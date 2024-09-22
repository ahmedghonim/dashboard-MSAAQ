import { useContext, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { saveAs } from "file-saver";
import orderBy from "lodash/orderBy";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import { TransactionAvatar } from "@/columns/transactions";
import { Card, Layout, PaymentMethodLogo, Time } from "@/components";
import { CartItems } from "@/components/shared/cart/CartItems";
import { CartSource } from "@/components/shared/cart/CartSource";
import { useToast } from "@/components/toast";
import { AppContext } from "@/contextes";
import { useAppDispatch, useFormatPrice, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useFetchPayoutSettingsQuery } from "@/store/slices/api/msaaq-pay/payoutsSlice";
import { useFetchTransactionQuery, useRefundTransactionMutation } from "@/store/slices/api/msaaq-pay/transactionsSlice";
import { APIActionResponse, PayoutSettings, Transaction, TransactionStatus } from "@/types";
import { classNames, getStatusColor } from "@/utils";

import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Alert, Badge, Button, Form, Icon, Modal, Title, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export interface TransactionRefundForm {
  amount: number;
  type: TransactionStatus.FULLY_REFUNDED | TransactionStatus.PARTIALLY_REFUNDED;
  reason: string;
  remove_access: boolean;
}

export default function TransactionShowPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { formatPrice, setCurrency } = useFormatPrice();
  const { data: transaction = {} as Transaction } = useFetchTransactionQuery(router.query.transactionId as any);
  const {
    data: payoutSettings = {
      available_balance: 0
    } as PayoutSettings
  } = useFetchPayoutSettingsQuery();

  const availableBalance = payoutSettings.available_balance ?? 0;

  useEffect(() => {
    if (transaction.currency) {
      setCurrency(transaction.currency);
    }
  }, [transaction]);

  const [toast] = useToast();
  const { setIsLoading } = useContext(AppContext);

  const downloadReceipt = async () => {
    const data = await axios
      .get(`/msaaqpay/transactions/${transaction.id}/invoice`, {
        responseType: "blob"
      })
      .then((res) => res.data)
      .catch(() => {
        setIsLoading(false);

        toast.error({
          message: t("msaaq_pay.payouts.receipt_download_error")
        });
      });

    if (data) {
      saveAs(data, `payouts-receipt-${transaction.id}.pdf`);
    }
  };

  const refundHistory =
    transaction.history?.filter((history) => {
      // @ts-ignore
      return [TransactionStatus.PARTIALLY_REFUNDED, TransactionStatus.FULLY_REFUNDED].includes(history.type);
    }) ?? [];

  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    setValue,
    setError
  } = useForm<TransactionRefundForm>({
    defaultValues: {
      type: TransactionStatus.FULLY_REFUNDED
    },
    mode: "all",
    resolver: yupResolver(
      yup
        .object({
          type: yup.string().required(),
          amount: yup
            .number()
            .max(payoutSettings.available_balance / 100, t("validation.max_payout_amount"))
            .when("type", {
              is: TransactionStatus.PARTIALLY_REFUNDED,
              then: yup.number().required()
            })
        })
        .required()
    )
  });

  useEffect(() => {
    if (!transaction.payment_details?.amount) {
      return;
    }

    setValue(
      "type",
      transaction.payment_details?.amount > availableBalance
        ? TransactionStatus.PARTIALLY_REFUNDED
        : TransactionStatus.FULLY_REFUNDED
    );
  }, [availableBalance]);

  useEffect(() => {
    if (transaction && transaction.description == "transfer") {
      router.push(`/msaaq-pay/transactions/`);
    }
  }, [transaction]);

  const [refundMutation] = useRefundTransactionMutation();
  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });
  const onSubmit = async (data: TransactionRefundForm) => {
    const payload = {
      ...data,
      id: transaction.id,
      amount:
        data.type === TransactionStatus.FULLY_REFUNDED
          ? (transaction.payment_details?.amount - refundHistory.reduce((acc, history) => acc + history.amount, 0)) /
            100
          : data.amount
    };

    const mutation = (await refundMutation(payload)) as APIActionResponse<any>;

    if (displayErrors(mutation)) {
      return;
    }

    displaySuccess(mutation);
    dispatch(apiSlice.util.invalidateTags(["transactions.index"]));

    setShowModal(false);
  };

  const [isRefundable, setIsRefundable] = useState<boolean>(true);
  useEffect(() => {
    if (transaction) {
      if (!transaction.created_at) {
        return;
      }

      if (transaction.payment_method && transaction.payment_method.toUpperCase().includes("MADA")) {
        setIsRefundable(dayjs(transaction.created_at).isAfter(dayjs().subtract(30, "day")));
      }
    }
  }, [transaction]);

  return (
    <Layout title={t("msaaq_pay.transactions.transaction_details")}>
      <Layout.Container>
        <Layout.FormGrid
          sidebarFixedOnMobile={false}
          sidebar={
            <Layout.FormGrid.DefaultSidebar>
              <div className="flex flex-col gap-4">
                <Card label={t("msaaq_pay.payouts.financial_details")}>
                  <Card.Body className="flex flex-col gap-2">
                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(transaction.payment_details?.amount)}
                      subtitle={t("msaaq_pay.transactions.amount")}
                    />

                    {transaction?.payment_details?.fees?.msaaq_percentage ? (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={formatPrice(parseFloat(transaction?.payment_details?.fees?.msaaq_fees))}
                        subtitle={t("msaaq_pay.transactions.msaaq_fee", {
                          percentage: transaction?.payment_details?.fees?.msaaq_percentage
                        })}
                      />
                    ) : null}

                    {transaction?.payment_details?.fees?.total ? (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={formatPrice(
                          parseFloat(transaction?.payment_details?.fees?.gateway_fees) +
                            parseFloat(transaction?.payment_details?.fees?.gateway_extra_fees) +
                            parseFloat(transaction?.payment_details?.fees?.tax)
                        )}
                        subtitle={
                          <>
                            <span className="flex gap-2">
                              <Typography.Paragraph
                                as="span"
                                size="sm"
                                weight="normal"
                                className="text-gray-800"
                                children={t("msaaq_pay.transactions.total_fees")}
                              />
                              <Tooltip>
                                <Tooltip.Trigger>
                                  <Icon>
                                    <ExclamationCircleIcon className="text-gray-600" />
                                  </Icon>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <Typography.Paragraph
                                    size="sm"
                                    children={t("msaaq_pay.transactions.tooltip.transaction_fix", {
                                      value: formatPrice(
                                        parseFloat(transaction?.payment_details?.fees?.gateway_fees) +
                                          parseFloat(transaction?.payment_details?.fees?.gateway_extra_fees)
                                      ),
                                      percentage: `30¢ + ${transaction?.payment_details?.fees?.gateway_percentage}`
                                    })}
                                  />
                                  <Typography.Paragraph
                                    size="sm"
                                    children={t("msaaq_pay.transactions.tooltip.vat", {
                                      value: formatPrice(parseFloat(transaction?.payment_details?.fees?.tax)),
                                      percentage: transaction?.payment_details?.fees?.tax_percentage
                                    })}
                                  />
                                </Tooltip.Content>
                              </Tooltip>
                            </span>
                          </>
                        }
                      />
                    ) : null}

                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(transaction?.payment_details?.vat?.net)}
                      subtitle={t("msaaq_pay.transactions.vat")}
                    />
                  </Card.Body>

                  <Card.Actions>
                    <Title
                      reverse
                      className="w-full [&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(transaction?.payment_details?.net)}
                      subtitle={
                        <span
                          className="font-bold text-gray-950"
                          children={t("msaaq_pay.payouts.net_amount")}
                        />
                      }
                    />
                  </Card.Actions>
                </Card>

                <Card label={t("msaaq_pay.transactions.history")}>
                  <Card.Body className="flex flex-col gap-6">
                    {transaction.history?.find((history) => history.remove_access === true) && (
                      <Alert
                        variant="info"
                        children={t("msaaq_pay.transactions.products_access_removed")}
                      />
                    )}

                    <ol className="relative border-dashed border-gray ltr:border-l rtl:border-r">
                      {orderBy(transaction.history, ["created_at"], ["desc"])?.map((history, i) => (
                        <li
                          className="mb-6 ltr:ml-6 rtl:mr-6"
                          key={i}
                        >
                          <div className="absolute -right-3 flex h-6 w-6 items-center rounded-full bg-white p-1">
                            <Icon
                              children={<CheckCircleIcon />}
                              className="text-gray-600"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <Typography.Paragraph
                              size="lg"
                              weight="medium"
                              children={t(`msaaq_pay.transactions.history_descriptions.${history.type}`, {
                                amount: formatPrice(history.amount)
                              })}
                            />

                            {history.reason && <Typography.Paragraph children={history.reason} />}

                            <Typography.Paragraph
                              size="sm"
                              className="text-gray-800"
                              children={
                                <Time
                                  date={history.created_at}
                                  format="DD MMM YYYY, hh:mmA"
                                />
                              }
                            />
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card.Body>
                </Card>
              </div>
            </Layout.FormGrid.DefaultSidebar>
          }
        >
          <div className="flex flex-col gap-4">
            <Card label={t("msaaq_pay.transactions.transaction_details")}>
              {!isRefundable && (
                <Card.Body className="pb-0">
                  <Alert
                    variant="info"
                    children={t("msaaq_pay.transactions.mada_refund_note")}
                  />
                </Card.Body>
              )}

              <Card.Body className="flex justify-between py-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {transaction.card?.issuer_country && (
                      <Image
                        width={26}
                        height={16}
                        className="rounded"
                        src={`https://cdn.msaaq.com/assets/flags/${transaction.card?.issuer_country?.toLowerCase()}.svg`}
                        alt={transaction.card.issuer_country}
                      />
                    )}

                    <Typography.Subtitle
                      size="lg"
                      children={formatPrice(transaction.payment_details?.amount)}
                    />

                    <Badge
                      size="sm"
                      variant={getStatusColor(transaction.status)}
                      children={<Trans i18nKey={`msaaq_pay.transactions.statuses.${transaction.status}`} />}
                      rounded
                      soft
                    />
                  </div>
                  {transaction.status == TransactionStatus.PARTIALLY_REFUNDED
                    ? refundHistory?.length > 0 && (
                        <>
                          {orderBy(refundHistory, ["created_at"], ["desc"])?.map((history, i) => (
                            <div key={i}>
                              <Typography.Paragraph
                                size="lg"
                                className="text-danger"
                                title={`${t(`msaaq_pay.transactions.statuses.${history.type}`)} ${formatPrice(
                                  history.amount
                                )}`.trim()}
                              >
                                {"- "}
                                {formatPrice(history.amount)}
                              </Typography.Paragraph>
                            </div>
                          ))}

                          <Typography.Paragraph
                            size="lg"
                            weight="bold"
                          >
                            {"= "}
                            {formatPrice(
                              transaction.payment_details?.amount -
                                refundHistory.reduce((acc, history) => acc + history.amount, 0)
                            )}
                          </Typography.Paragraph>
                        </>
                      )
                    : transaction.refunds_amount &&
                      transaction.status == TransactionStatus.FULLY_REFUNDED && (
                        <>
                          <Typography.Paragraph
                            size="lg"
                            className="text-danger"
                            title={`${t(`msaaq_pay.transactions.statuses.${transaction.type}`)} ${formatPrice(
                              transaction.refunds_amount
                            )}`.trim()}
                          >
                            {"- "}
                            {formatPrice(transaction.refunds_amount)}
                          </Typography.Paragraph>

                          <Typography.Paragraph
                            size="lg"
                            weight="bold"
                          >
                            {"= "}
                            {formatPrice(transaction.payment_details?.amount - transaction.refunds_amount)}
                          </Typography.Paragraph>
                        </>
                      )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    children={t("msaaq_pay.transactions.invoice")}
                    onClick={downloadReceipt}
                  />

                  {[TransactionStatus.PARTIALLY_REFUNDED, TransactionStatus.SUCCESS].includes(transaction.status) && (
                    <Button
                      variant="primary"
                      disabled={!isRefundable}
                      children={t("msaaq_pay.transactions.refund_button")}
                      onClick={() => setShowModal(true)}
                    />
                  )}
                </div>
              </Card.Body>
              <Card.Actions className="card-divide-x grid grid-cols-6">
                <TransactionAvatar
                  className="col-span-2"
                  transaction={transaction}
                />

                <Title
                  reverse
                  title={<Time date={transaction.created_at} />}
                  subtitle={t("msaaq_pay.transactions.created_at")}
                />

                <Title
                  reverse
                  title={
                    <>
                      <PaymentMethodLogo
                        method={transaction.payment_method}
                        last4={transaction.card?.last4}
                      />
                    </>
                  }
                  subtitle={t("msaaq_pay.transactions.payment_method")}
                />

                <Title
                  reverse
                  title={
                    transaction.order?.id ? (
                      <Link
                        href={`/orders/${transaction.order?.id}`}
                        className="text-info hover:underline"
                      >
                        #{transaction.order?.id}
                      </Link>
                    ) : (
                      "—"
                    )
                  }
                  subtitle={t("orders.id")}
                />

                <Title
                  reverse
                  title={transaction.id}
                  subtitle={t("msaaq_pay.transactions.id")}
                />
              </Card.Actions>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <CartItems
                items={transaction.order?.items}
                formatPrice={formatPrice}
              />

              <CartSource source={transaction.order?.source} />
            </div>
          </div>
        </Layout.FormGrid>
      </Layout.Container>

      <Modal
        open={showModal}
        onDismiss={() => setShowModal(false)}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("msaaq_pay.transactions.refund_button")}</Modal.HeaderTitle>
        </Modal.Header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <div className="flex items-center justify-between gap-4 bg-gray-50 p-4">
              <Typography.Paragraph>{t("msaaq_pay.available_balance")}</Typography.Paragraph>
              <Typography.Paragraph
                size="sm"
                weight="medium"
                children={formatPrice(availableBalance)}
              />
            </div>

            <Modal.Content>
              <Form.Group
                label={t("msaaq_pay.transactions.refund_type")}
                required
              >
                <div className="flex flex-col gap-4">
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={TransactionStatus.FULLY_REFUNDED}
                    render={({ field: { value, ...field } }) => (
                      <label
                        className={classNames(
                          "w-full cursor-pointer rounded border px-4 py-4",
                          "flex flex-col gap-6",
                          transaction.payment_details?.amount > availableBalance && "cursor-not-allowed",
                          value === TransactionStatus.FULLY_REFUNDED ? "border-primary bg-primary-50" : "border-gray"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Form.Radio
                            id="option-1"
                            value={TransactionStatus.FULLY_REFUNDED}
                            checked={value === TransactionStatus.FULLY_REFUNDED}
                            label={t("msaaq_pay.transactions.fully_refund")}
                            disabled={transaction.payment_details?.amount > availableBalance}
                            {...field}
                          />

                          <Typography.Paragraph
                            size="lg"
                            className="mr-auto"
                            weight={"medium"}
                            children={formatPrice(
                              transaction.payment_details?.amount -
                                refundHistory.reduce((acc, history) => acc + history.amount, 0)
                            )}
                          />
                        </div>

                        {transaction.payment_details?.amount > availableBalance && (
                          <Alert
                            variant={"danger"}
                            children={t("msaaq_pay.transactions.you_dont_have_enough_balance")}
                          />
                        )}
                      </label>
                    )}
                  />

                  <Controller
                    name="type"
                    control={control}
                    defaultValue={TransactionStatus.PARTIALLY_REFUNDED}
                    render={({ field: { value, ...field } }) => (
                      <label
                        className={classNames(
                          "w-full cursor-pointer rounded border px-4 py-4",
                          "flex flex-col gap-3",
                          value === TransactionStatus.PARTIALLY_REFUNDED
                            ? "border-primary bg-primary-50"
                            : "border-gray"
                        )}
                      >
                        <Form.Radio
                          id="option-2"
                          value={TransactionStatus.PARTIALLY_REFUNDED}
                          checked={value === TransactionStatus.PARTIALLY_REFUNDED}
                          label={t("msaaq_pay.transactions.partially_refund")}
                          {...field}
                        >
                          <Form.Group
                            label={t("msaaq_pay.transactions.enter_refund_amount")}
                            className="mb-0 w-2/3"
                            errors={errors.amount?.message}
                            required
                          >
                            <Controller
                              name={"amount"}
                              control={control}
                              render={({ field: { onChange, ...field } }) => (
                                <Form.Number
                                  placeholder={"0.00"}
                                  onChange={(e) => onChange(parseInt(e.target.value) ?? null)}
                                  min={0}
                                  max={transaction.payment_details?.amount}
                                  {...field}
                                />
                              )}
                            />
                          </Form.Group>
                        </Form.Radio>
                      </label>
                    )}
                  />
                </div>
              </Form.Group>

              <Form.Group
                label={t("msaaq_pay.transactions.refund_reason")}
                help={t("msaaq_pay.transactions.refund_reason_help")}
                errors={errors.reason?.message}
              >
                <Controller
                  name={"reason"}
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("msaaq_pay.transactions.refund_reason_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Controller
                  name={"remove_access"}
                  control={control}
                  defaultValue={false}
                  render={({ field: { value, ...field } }) => (
                    <Form.Toggle
                      id="remove_access"
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("msaaq_pay.transactions.remove_access_label")}
                      description={t("msaaq_pay.transactions.remove_access_help")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Modal.Content>
          </Modal.Body>

          <Modal.Footer className="gap-2">
            <Button
              size="lg"
              variant="primary"
              type="submit"
              disabled={!isValid || !isDirty || isSubmitting}
              children={t("msaaq_pay.transactions.confirm_refund")}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              onClick={() => setShowModal(false)}
              children={t("cancel")}
            />
          </Modal.Footer>
        </form>
      </Modal>
    </Layout>
  );
}
