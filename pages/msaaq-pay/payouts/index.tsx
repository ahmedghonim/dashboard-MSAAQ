import { useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import PayoutsCols from "@/columns/payouts";
import { Card, EmptyStateTable, Layout, SuccessModal } from "@/components";
import { MsaaqPayIcon } from "@/components/Icons/solid";
import { Datatable } from "@/components/datatable";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchMsaaqPayStatsQuery } from "@/store/slices/api/msaaq-pay/msaaqpaySlice";
import {
  useCreatePayoutMutation,
  useFetchPayoutSettingsQuery,
  useFetchPayoutsQuery
} from "@/store/slices/api/msaaq-pay/payoutsSlice";
import { APIActionResponse, Payout, PayoutSettings, PayoutStatus } from "@/types";
import { middleTruncate, randomUUID } from "@/utils";

import { BuildingLibraryIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface PayoutRequestForm {
  amount: number;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    data: msaaqpay = {} as {
      currency: string;
    }
  } = useFetchMsaaqPayStatsQuery();

  const { formatPrice } = useFormatPrice(msaaqpay.currency);
  const {
    data: payoutSettings = {
      min_payout_amount: 100,
      available_balance: 0
    } as PayoutSettings
  } = useFetchPayoutSettingsQuery();

  const [createPayoutMutation] = useCreatePayoutMutation();

  const schema = yup
    .object({
      amount: yup
        .number()
        .min(
          payoutSettings.min_payout_amount,
          t("validation.min_payout_amount", { amount: formatPrice(payoutSettings.min_payout_amount * 100) })
        )
        .max(payoutSettings.available_balance / 100, t("validation.max_payout_amount"))
        .required()
    })
    .required();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isDirty, isSubmitting },
    setError
  } = useForm<PayoutRequestForm>({
    defaultValues: {
      amount: 0
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  const { displayErrors } = useResponseToastHandler({ setError });

  const setAmount = () => {
    setValue("amount", payoutSettings.available_balance / 100, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const Clickable = ({ children }: any) => (
    <span
      children={children}
      className="cursor-pointer text-info"
      onClick={setAmount}
    />
  );

  const onSubmit: SubmitHandler<PayoutRequestForm> = async (data) => {
    const response = (await createPayoutMutation(data.amount)) as APIActionResponse<PayoutSettings>;

    if (response.error) {
      setShow(false);
      displayErrors(response);

      return;
    }

    await router.push({
      pathname: router.pathname,
      query: { fetch: randomUUID() }
    });

    setShow(false);

    setShowSuccessModal(true);
  };

  return (
    <Layout title={t("sidebar.msaaq_pay.payouts")}>
      <Layout.Container>
        <Datatable
          columns={{
            columns: PayoutsCols
          }}
          hasFilter={false}
          fetcher={useFetchPayoutsQuery}
          toolbar={(instance) => {
            const item = instance.data.filter((item: Payout) => item.status === PayoutStatus.PENDING);
            return (
              <Button
                onClick={item.length > 0 ? undefined : () => setShow(true)}
                variant="primary"
                disabled={item.length > 0}
                size="md"
                children={t("msaaq_pay.payouts.create_payout_request")}
              />
            );
          }}
          emptyState={
            <EmptyStateTable
              title={t("msaaq_pay.payouts.empty_state.title")}
              content={t("msaaq_pay.payouts.empty_state.description")}
              icon={<MsaaqPayIcon />}
            />
          }
        />
      </Layout.Container>

      <Modal
        size="lg"
        open={show}
        onDismiss={() => setShow(false)}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("msaaq_pay.payouts.create_new_payout_request")}</Modal.HeaderTitle>
        </Modal.Header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <div className="flex items-center justify-between gap-4 bg-gray-50 p-4">
              <Typography.Paragraph>{t("msaaq_pay.available_balance")}</Typography.Paragraph>
              <Typography.Paragraph
                size="sm"
                weight="medium"
                children={formatPrice(payoutSettings.available_balance)}
                className="cursor-pointer"
                onClick={setAmount}
              />
            </div>

            <Modal.Content>
              <Form.Group
                label={t("msaaq_pay.payouts.payout_request_amount")}
                errors={errors.amount?.message}
                required
                help={
                  <Typography.Paragraph
                    size="sm"
                    weight="normal"
                    className="mt-1 text-gray-700"
                  >
                    <Trans
                      i18nKey="msaaq_pay.payouts.max_you_can_withdraw"
                      values={{ amount: formatPrice(payoutSettings.available_balance) }}
                      components={{
                        clickable: <Clickable />
                      }}
                    />
                  </Typography.Paragraph>
                }
              >
                <Controller
                  name={"amount"}
                  control={control}
                  render={({ field: { onChange, ...field } }) => (
                    <Form.Number
                      placeholder={"0.00"}
                      min={0}
                      onChange={(e) => onChange(parseInt(e.target.value) ?? null)}
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              <Card>
                <Card.Body>
                  <Typography.Paragraph
                    size="sm"
                    weight="medium"
                    children={t("msaaq_pay.payouts.transfer_will_be_made_to_this_account")}
                  />

                  <div className="mt-4 flex items-center gap-2">
                    <div className="rounded bg-gray-200 p-2">
                      <Icon
                        children={<BuildingLibraryIcon />}
                        size="lg"
                      />
                    </div>

                    <div>
                      {payoutSettings?.bank && (
                        <>
                          <Typography.Paragraph
                            size="sm"
                            weight="medium"
                            children={payoutSettings?.bank?.bank_name}
                          />

                          <Typography.Paragraph
                            size="sm"
                            weight="medium"
                            children={middleTruncate(payoutSettings?.bank?.account_number, 2, 4, "****")}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Modal.Content>
          </Modal.Body>

          <Modal.Footer>
            <Button
              size="lg"
              className="ml-2"
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting || !isDirty}
              children={t("msaaq_pay.payouts.make_request")}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              onClick={() => setShow(false)}
              children={t("cancel")}
            />
          </Modal.Footer>
        </form>
      </Modal>

      <SuccessModal
        open={showSuccessModal}
        onDismiss={() => setShowSuccessModal(false)}
        title={t("msaaq_pay.payouts.success_modal_title")}
        description={t("msaaq_pay.payouts.success_modal_description")}
        buttons={
          <>
            <Button
              variant="primary"
              children={t("msaaq_pay.payouts.back_to_msaaqpay")}
              as={Link}
              href="/msaaq-pay"
            />

            <Button
              variant="default"
              children={t("close")}
              onClick={() => setShowSuccessModal(false)}
            />
          </>
        }
      />
    </Layout>
  );
}
