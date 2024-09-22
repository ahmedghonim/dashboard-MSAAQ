import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { CellProps } from "@/columns";
import { Card, Layout, PaymentMethodLogo } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import CurrenciesSelect, { CountryNameWithFlag } from "@/components/select/CurrenciesSelect";
import { AuthContext } from "@/contextes";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchMsaaqPaySettingsQuery,
  useUpdateMsaaqPaySettingsMutation
} from "@/store/slices/api/msaaq-pay/msaaqpaySlice";
import { APIActionResponse, Currency, Gateway, MsaaqPayBundle, MsaaqPayInfo, Plans } from "@/types";
import { classNames } from "@/utils";

import { ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Badge, Button, Collapse, Form, Grid, Icon, Modal, Table, Title, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  vat_type: MsaaqPayInfo["vat_type"];
  currencies: MsaaqPayInfo["currencies"];
  gateways: MsaaqPayInfo["gateways"];
  default_currency: Currency | any;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function MsaaqPaySettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatCurrency } = useFormatPrice();
  const { data: settings } = useFetchMsaaqPaySettingsQuery();
  const [updateSettings] = useUpdateMsaaqPaySettingsMutation();
  const [showCompareModal, setShowCompareModal] = useState(false);

  const schema = yup.object().shape({
    vat_type: yup.string().oneOf(["excluded", "included"]).required()
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    getValues,
    setError
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const [currencies, setCurrencies] = useState<MsaaqPayInfo["currencies"]>([]);
  const [gateways, setGateways] = useState<MsaaqPayInfo["gateways"]>([]);
  const [bundles, setBundles] = useState<MsaaqPayInfo["bundles"]>([]);
  const { current_academy } = useContext(AuthContext);

  const resetForm = (data: MsaaqPayInfo) => {
    const defaultCurrency = data.currencies.find((currency) => currency.default);

    setCurrencies(data.currencies.filter((currency) => currency.is_active));
    setGateways(data.gateways);
    setBundles(data.bundles);
    reset({
      vat_type: data.vat_type,
      gateways: data.gateways,
      currencies: data.currencies,
      default_currency: defaultCurrency
        ? {
            label: defaultCurrency.name,
            value: defaultCurrency.id,
            ...defaultCurrency
          }
        : {}
    });
  };

  useEffect(() => {
    if (!settings) {
      return;
    }

    resetForm(settings);
  }, [settings, router]);

  useEffect(() => {
    setValue("currencies", currencies, { shouldDirty: true });
  }, [currencies]);

  useEffect(() => {
    setValue("gateways", gateways, { shouldDirty: true });
  }, [gateways]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const response = (await updateSettings({
      vat_type: data.vat_type,
      currencies: data.currencies.filter((currency) => currency.is_active).map((currency) => currency.id),
      gateways: data.gateways.filter((gateway) => gateway.is_active).map((gateway) => gateway.gateway.id)
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      return;
    }

    displaySuccess(response);

    resetForm(response.data.data);
  };
  const getPlanColor = (bundle: MsaaqPayBundle) => {
    switch (bundle?.key) {
      case Plans.GROWTH:
        return "text-orange";
      case Plans.PRO:
        return "text-purple";
    }
  };

  const TrialCard = ({ openModalButton = false, endsAt = "" }: { openModalButton?: boolean; endsAt?: string }) => {
    return (
      <div className="flex flex-col gap-2">
        <Card>
          <Card.Body>
            <div className="mb-5 flex items-center gap-2">
              <Typography.Subtitle
                size="sm"
                weight="bold"
              >
                {t("msaaq_pay.trial")}
              </Typography.Subtitle>
              <Badge
                size="md"
                variant={"orange"}
                soft
                rounded
              >
                {t("msaaq_pay.trial_ends_at", { value: endsAt })}
              </Badge>
            </div>
            <Typography.Paragraph
              size="lg"
              weight="bold"
              className="mb-3"
            >
              20%
            </Typography.Paragraph>
            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-5"
            >
              {t("msaaq_pay.bundles.msaaq_commission")}
            </Typography.Paragraph>

            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-2"
            >
              {t("msaaq_pay.bundles.gateway_commission")}
            </Typography.Paragraph>

            <Title
              reverse
              className="mb-2 [&>*]:flex-row-reverse [&>*]:justify-between"
              title={`3.80%`}
              subtitle={t(`msaaq_pay.bundles.gateway.VISA`)}
            />
            <Title
              reverse
              className="mb-2 [&>*]:flex-row-reverse [&>*]:justify-between"
              title={`3.80%`}
              subtitle={t(`msaaq_pay.bundles.gateway.MASTERCARD`)}
            />
            <Title
              reverse
              className="mb-2 [&>*]:flex-row-reverse [&>*]:justify-between"
              title={`2.70%`}
              subtitle={t(`msaaq_pay.bundles.gateway.MADA`)}
            />
            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-5"
            >
              {t("msaaq_pay.bundles.every_success_payment")}
            </Typography.Paragraph>
            {openModalButton && (
              <Button
                variant={"default"}
                className="w-full"
                onClick={() => {
                  setShowCompareModal(true);
                }}
              >
                {t("msaaq_pay.bundles.comparisons")}
              </Button>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };
  const BundleCard = ({ bundle, openModalButton = false }: { bundle: MsaaqPayBundle; openModalButton?: boolean }) => {
    return (
      <div className="flex flex-col gap-2">
        <Card>
          <Card.Body>
            <Typography.Subtitle
              size="sm"
              weight="bold"
              className={classNames(getPlanColor(bundle), "mb-5")}
            >
              {bundle?.label}
            </Typography.Subtitle>
            <Typography.Paragraph
              size="lg"
              weight="bold"
              className={classNames(getPlanColor(bundle), "mb-3")}
            >
              {bundle.msaaq_pay_fees}%
            </Typography.Paragraph>
            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-5"
            >
              {t("msaaq_pay.bundles.msaaq_commission")}
            </Typography.Paragraph>

            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-2"
            >
              {t("msaaq_pay.bundles.gateway_commission")}
            </Typography.Paragraph>
            {Array.isArray(bundle?.fees) &&
              bundle?.fees?.map((item: MsaaqPayInfo["bundles"][0]["fees"], index) => (
                <Title
                  key={index}
                  reverse
                  className="mb-2 [&>*]:flex-row-reverse [&>*]:justify-between"
                  title={`${item.fees.value}%`}
                  subtitle={t(`msaaq_pay.bundles.gateway.${item.gateway_name}`)}
                />
              ))}
            <Typography.Paragraph
              size="md"
              weight="medium"
              className="mb-5"
            >
              {t("msaaq_pay.bundles.every_success_payment")}
            </Typography.Paragraph>
            {openModalButton ? (
              <Button
                variant={"default"}
                className="w-full"
                onClick={() => {
                  setShowCompareModal(true);
                }}
              >
                {t("msaaq_pay.bundles.comparisons")}
              </Button>
            ) : !current_academy.is_plus && bundle.key !== Plans.ADVANCED ? (
              <Button
                disabled={bundle?.is_current}
                as={bundle?.is_current ? "button" : Link}
                variant={bundle?.is_current ? "default" : "primary"}
                className="w-full"
                href={"/settings/billing/subscription"}
              >
                {bundle?.is_current ? t("msaaq_pay.bundles.current") : t("msaaq_pay.bundles.upgrade")}
              </Button>
            ) : null}
          </Card.Body>
        </Card>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: <Trans i18nKey="msaaq_pay.settings.gateways.payment_method" />,
        id: "key",
        disableSortBy: true,
        width: 200,
        Cell: ({ row: { original } }: CellProps<Gateway>) => {
          const ref = useRef<any>();
          return (
            <Form.Toggle
              ref={ref}
              id={original.gateway.key}
              checked={original.is_active}
              value={original.gateway.key}
              onChange={async (e) => {
                e.preventDefault();

                if (
                  !e.target.checked &&
                  !(await confirm({
                    title: t("msaaq_pay.settings.gateways.disable_confirm_alert_title", {
                      gateway: original.gateway.name
                    }),
                    variant: "warning",
                    okLabel: t("continue"),
                    cancelLabel: t("cancel"),
                    children: (
                      <Typography.Paragraph
                        size="sm"
                        children={t("msaaq_pay.settings.gateways.disable_confirm_alert_description")}
                      />
                    )
                  }))
                ) {
                  ref.current.checked = true;
                  return;
                }

                setGateways((items) =>
                  items.map((gateway: Gateway) => {
                    if (gateway.gateway.key === original.gateway.key) {
                      ref.current.checked = !gateway.is_active;
                      return {
                        ...gateway,
                        is_active: !gateway.is_active
                      };
                    }

                    return gateway;
                  })
                );
              }}
              label={
                <span className="flex items-center gap-3">
                  <PaymentMethodLogo method={original.gateway.key} />
                  {original.gateway.name}
                </span>
              }
            />
          );
        }
      },
      {
        Header: <Trans i18nKey="msaaq_pay.settings.gateways.fees" />,
        id: "fees",
        disableSortBy: true,
        Cell: ({ row: { original } }: CellProps<Gateway>) => (
          <Typography.Paragraph
            size="sm"
            weight="medium"
            dir="auto"
            className="text-gray-800"
            children={
              original.fees_value
                ? `${original.fees_value}% + ${original.extra_fixed_fees}¢`
                : t("msaaq_pay.settings.gateways.digital_wallet_fees")
            }
          />
        )
      }
    ],
    []
  );

  return (
    <Layout title={t("sidebar.msaaq_pay.settings")}>
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={{
                  id: !!settings
                }}
                redirect={"/msaaq-pay/settings"}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("msaaq_pay.settings.gateways.title")}
              description={t("msaaq_pay.settings.gateways.description")}
              className="mb-6"
              hasDivider
            >
              <Table
                selectable={false}
                hasPagination={false}
                data={settings?.gateways ?? []}
                columns={columns}
              />
            </Form.Section>

            <Form.Section
              title={t("msaaq_pay.settings.currencies.title")}
              description={t("msaaq_pay.settings.currencies.description")}
              hasDivider
            >
              <Form.Group
                label={t("msaaq_pay.settings.currencies.default_currency")}
                required
              >
                <div className="flex gap-4">
                  <Controller
                    name={"default_currency"}
                    control={control}
                    render={({ field }) => (
                      <CurrenciesSelect
                        disabled={true}
                        {...field}
                      />
                    )}
                  />

                  <Button
                    as={Link}
                    href="/settings/verify?step=BANK_ACCOUNT_INFORMATION"
                    variant="default"
                    size={"lg"}
                    className="w-2/4"
                    children={t("msaaq_pay.settings.currencies.change_default_currency")}
                  />
                </div>
              </Form.Group>

              <Card>
                <Card.Header className="!border-b-0 px-4 py-2">
                  <Typography.Paragraph
                    size={"sm"}
                    className={"text-gray-800"}
                    children={t("msaaq_pay.settings.currencies.other_currencies")}
                  />
                </Card.Header>

                {currencies.map((currency) =>
                  currency.code !== getValues("default_currency")?.code ? (
                    <div
                      className="flex items-center justify-between border-t border-gray-300 px-4 py-2 first:border-t-0"
                      key={currency.id}
                    >
                      <CountryNameWithFlag
                        label={currency.name}
                        symbol={currency.symbol}
                        country={currency.country_code}
                      />

                      <Button
                        size="sm"
                        variant="dismiss"
                        icon={
                          <Icon
                            size="sm"
                            children={<TrashIcon />}
                          />
                        }
                        onClick={(e) => {
                          e.preventDefault();

                          setCurrencies(currencies.filter((c: Currency) => c.id !== currency.id));
                        }}
                      />
                    </div>
                  ) : null
                )}

                {currencies.length === 0 && (
                  <Card.Body className="border-t border-gray-300 text-center ">
                    <Typography.Paragraph
                      className={"text-gray-800"}
                      children={t("msaaq_pay.settings.currencies.no_other_currencies")}
                    />
                  </Card.Body>
                )}

                <Card.Actions>
                  <Form.Group
                    label={t("msaaq_pay.settings.currencies.add_currency")}
                    className="mb-0 w-full"
                  >
                    <CurrenciesSelect
                      filterOption={(option) => {
                        if (!currencies || !settings) return true;

                        return (
                          !currencies?.find((c) => c.id === option.data.id) &&
                          option.data.id !== getValues("default_currency")?.id
                        );
                      }}
                      onChange={(selected: any) => {
                        if (!selected) return;

                        if (currencies.find((c) => c.id === selected.id)) {
                          return;
                        }

                        setCurrencies([
                          ...currencies,
                          {
                            ...selected,
                            is_active: true
                          }
                        ]);
                      }}
                    />
                  </Form.Group>
                </Card.Actions>
              </Card>
            </Form.Section>

            <Form.Section
              title={t("msaaq_pay.settings.vat.title")}
              description={t("msaaq_pay.settings.vat.description")}
              hasDivider
            >
              <Form.Group errors={errors?.vat_type?.message}>
                <Controller
                  name={"vat_type"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Radio
                      label={t("msaaq_pay.settings.vat.type_excluded_label")}
                      description={t("msaaq_pay.settings.vat.type_excluded_description")}
                      id="vat_excluded"
                      value={"excluded"}
                      checked={value === "excluded"}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Controller
                  name={"vat_type"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Radio
                      label={t("msaaq_pay.settings.vat.type_included_label")}
                      description={t("msaaq_pay.settings.vat.type_included_description")}
                      id="vat_included"
                      value={"included"}
                      checked={value === "included"}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>

            <Form.Section
              title={t("msaaq_pay.settings.bank.title")}
              description={t("msaaq_pay.settings.bank.description")}
              hasDivider
            >
              <Card>
                <Card.Body className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Title
                      className="truncate"
                      reverse
                      title={settings?.bank.bank_name}
                      subtitle={t("bank_info.bank_name")}
                    />

                    <Title
                      className="truncate"
                      reverse
                      title={settings?.bank.account_number}
                      subtitle={t("bank_info.account_number")}
                    />

                    <Title
                      className="truncate"
                      reverse
                      title={settings?.bank.account_name}
                      subtitle={t("bank_info.account_owner_name")}
                    />

                    <Title
                      className="truncate"
                      reverse
                      title={settings?.bank.iban}
                      subtitle={t("bank_info.iban")}
                    />

                    <Title
                      className="truncate"
                      reverse
                      title={settings?.bank.bic}
                      subtitle={t("bank_info.swift")}
                    />

                    <Title
                      className="truncate"
                      reverse
                      title={`${formatCurrency(settings?.bank.currency as string)} (${settings?.bank.currency})`}
                      subtitle={t("bank_info.currency")}
                    />
                  </div>

                  <Button
                    as={Link}
                    href="/settings/verify?step=BANK_ACCOUNT_INFORMATION"
                    variant="default"
                    children={t("bank_info.change_bank_info")}
                  />
                </Card.Body>
              </Card>
            </Form.Section>

            <Form.Section
              title={t("msaaq_pay.settings.faqs.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  <Trans
                    i18nKey={"msaaq_pay.settings.faqs.description"}
                    components={{
                      a: (
                        <a
                          href="https://help.msaaq.com/ar/category/msak-bay-196qvmc"
                          target="_blank"
                          rel="noreferrer"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              hasDivider
            >
              <div className="flex flex-col gap-2">
                {settings?.faq.map((faq) => (
                  <Card key={faq.id}>
                    <Collapse>
                      {({ isOpen }) => (
                        <>
                          <Collapse.Button
                            append={
                              <Icon
                                size="sm"
                                className={classNames(
                                  isOpen && "rotate-180 transform",
                                  "transition-all duration-300 ease-in-out"
                                )}
                                children={<ChevronUpIcon />}
                              />
                            }
                          >
                            <Typography.Paragraph
                              children={faq.question}
                              weight="medium"
                            />
                          </Collapse.Button>
                          <Collapse.Content
                            className="px-4 pb-4 text-gray-700"
                            children={
                              <Typography.Paragraph>
                                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                              </Typography.Paragraph>
                            }
                          />
                        </>
                      )}
                    </Collapse>
                  </Card>
                ))}
              </div>
            </Form.Section>
            <Form.Section
              title={t("msaaq_pay.bundles.msaaq_commission")}
              description={t("msaaq_pay.bundles.description")}
              hasDivider
            >
              {bundles.filter((bundle) => bundle.is_current)[0] ? (
                <BundleCard
                  bundle={bundles.filter((bundle) => bundle.is_current)[0]}
                  openModalButton={true}
                />
              ) : (
                <TrialCard
                  endsAt={
                    // @ts-ignore
                    dayjs(current_academy?.trial_ends_at).fromNow(true)
                  }
                  openModalButton={true}
                />
              )}
            </Form.Section>
            <Modal
              className="max-w-6xl"
              open={showCompareModal}
              onDismiss={() => {
                setShowCompareModal(false);
              }}
            >
              <Modal.Header>
                <Modal.HeaderTitle>
                  <Trans i18nKey="msaaq_pay.bundles.msaaq_commission"></Trans>
                </Modal.HeaderTitle>
              </Modal.Header>
              <Modal.Body>
                <Modal.Content>
                  <Grid
                    className="gap-5"
                    columns={{
                      sm: 3
                    }}
                  >
                    {bundles.map((bundle, index) => (
                      <Grid.Cell key={index}>
                        <BundleCard
                          bundle={bundle}
                          openModalButton={false}
                        />
                      </Grid.Cell>
                    ))}
                  </Grid>
                  <Button
                    className="mt-4"
                    as={Link}
                    variant="link"
                    href="/settings/billing/subscription/plans"
                  >
                    {t("msaaq_pay.bundles.see_all_bundles")}
                  </Button>
                </Modal.Content>
              </Modal.Body>
            </Modal>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
