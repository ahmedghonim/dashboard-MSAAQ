import React, { useEffect } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadMembers } from "@/actions/options";
import { AddonController, HelpdeskLink, Layout } from "@/components";
import AffiliatesIndexTabs from "@/components/marketing/affiliates/AffiliatesIndexTabs";
import { Select } from "@/components/select";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchAffiliatesSettingsQuery,
  useUpdateAffiliateSettingsMutation
} from "@/store/slices/api/affiliateSettingsSlice";
import { APIActionResponse } from "@/types";
import { AffiliateSettings, AffiliateSettingsAvailability } from "@/types/models/affiliateSettings";

import { Form, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  id: number;
  cookies_period: number | string | { value: number | string; label: string };
  invited_users: Array<{ value: number; label: string }> | null;
  availability: AffiliateSettingsAvailability;
  commission: number | string;
  payout_threshold: number | string;
  payout_methods: string[];
}

export default function Settings({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  const { currentCurrency } = useFormatPrice();
  const { data: affiliates, isLoading } = useFetchAffiliatesSettingsQuery();
  const [updateAffiliateSettings] = useUpdateAffiliateSettingsMutation();

  const cookies_periods = [
    { value: 0, label: "---" },
    { value: 1, label: t("day") },
    { value: 7, label: t("week") },
    { value: 30, label: t("month") },
    { value: 365, label: t("year") }
  ];

  const schema = yup.object().shape({
    availability: yup.string().required(),
    commission: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .max(100)
      .required(),
    cookies_period: yup.object().required(),
    payout_threshold: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .required(),
    payout_methods: yup.array().required(),
    invited_users: yup.array().nullable()
  });

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    reset
  } = form;

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (!isLoading && affiliates) {
      reset({
        availability: affiliates?.availability,
        commission: affiliates?.commission,
        invited_users: affiliates?.invited_users?.map(({ id, name }) => ({ value: id, label: name })),
        cookies_period:
          cookies_periods.find((period) => period.value === affiliates?.cookies_period) ?? cookies_periods[0],
        payout_threshold: affiliates?.payouts?.threshold,
        payout_methods: affiliates?.payouts?.methods
      });
    }
  }, [affiliates]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data: IFormInputs) => {
    const response = (await updateAffiliateSettings({
      availability: data.availability,
      commission: data.commission,
      cookies_period: typeof data.cookies_period === "object" ? data.cookies_period.value : data.cookies_period,
      // @ts-ignore
      invited_users: data.invited_users?.map((user) => user.value) ?? [],
      payout_threshold: data.payout_threshold,
      payout_methods: data.payout_methods
    })) as APIActionResponse<AffiliateSettings>;

    if (displayErrors(response)) return;

    displaySuccess(response);
  };

  return (
    <Layout title={t("sidebar.marketing.affiliates")}>
      <AffiliatesIndexTabs />

      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={{ id: 1, ...affiliates }}
                redirect={`/marketing/affiliates/payouts`}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("marketing.affiliates.form.settings.availability")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("marketing.affiliates.form.settings.availability_description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"helpdesk_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug="iaadadat-altsoyk-balaamola-1pv2qjo"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              hasDivider={watch("availability") !== AffiliateSettingsAvailability.CLOSED}
            >
              <Form.Group
                errors={errors.availability?.message}
                required
                label={t("marketing.affiliates.form.settings.availability")}
                className={`mb-0`}
              >
                <Controller
                  name="availability"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Form.Group>
                        <Form.Radio
                          {...field}
                          id="available_closed"
                          label={t("marketing.affiliates.form.settings.closed")}
                          tooltip={t("marketing.affiliates.form.settings.closed_tooltip")}
                          value={AffiliateSettingsAvailability.CLOSED}
                          checked={watch("availability") === AffiliateSettingsAvailability.CLOSED}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Radio
                          {...field}
                          id="available_for_anyone"
                          label={t("marketing.affiliates.form.settings.available_for_anyone")}
                          tooltip={t("marketing.affiliates.form.settings.available_for_anyone_tooltip")}
                          value={AffiliateSettingsAvailability.ANYONE}
                          checked={watch("availability") === AffiliateSettingsAvailability.ANYONE}
                        />
                      </Form.Group>
                      <Form.Group className={`mb-0`}>
                        <Form.Radio
                          {...field}
                          id="available_for_invited_users"
                          label={t("marketing.affiliates.form.settings.available_for_invited_users")}
                          tooltip={t("marketing.affiliates.form.settings.available_for_invited_users_tooltip")}
                          value={AffiliateSettingsAvailability.INVITE_ONLY}
                          checked={watch("availability") === AffiliateSettingsAvailability.INVITE_ONLY}
                        >
                          {watch("availability") === AffiliateSettingsAvailability.INVITE_ONLY && (
                            <Form.Group
                              className="mt-4"
                              label={t("marketing.affiliates.form.settings.invited_users")}
                            >
                              <Controller
                                name="invited_users"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    placeholder={t("select_from_list")}
                                    isMulti
                                    isClearable
                                    isSearchable
                                    loadOptions={loadMembers}
                                  />
                                )}
                              />
                            </Form.Group>
                          )}
                        </Form.Radio>
                      </Form.Group>
                    </>
                  )}
                />
              </Form.Group>
            </Form.Section>

            {watch("availability") !== AffiliateSettingsAvailability.CLOSED && (
              <>
                <Form.Section
                  className="relative"
                  title={t("marketing.affiliates.form.settings.commission_control")}
                  description={t("marketing.affiliates.form.settings.commission_control_description")}
                  hasDivider
                >
                  <Form.Group
                    required
                    label={t("marketing.affiliates.form.settings.commission")}
                    help={t("marketing.affiliates.form.settings.commission_help")}
                    placeholder="0.00"
                    className="mb-0"
                    errors={errors.commission?.message}
                  >
                    <Controller
                      name={"commission"}
                      control={control}
                      render={({ field }) => (
                        <Form.Number
                          className="w-full"
                          withHandlers={false}
                          min={0}
                          max={100}
                          suffix={t("percent")}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>

                  <Form.Group
                    required
                    label={t("marketing.affiliates.form.settings.cookies_period")}
                    tooltip={t("marketing.affiliates.form.settings.cookies_period_tooltip")}
                    className="relative z-20 mb-0 mt-6"
                    errors={errors.cookies_period?.message}
                  >
                    <Controller
                      name={"cookies_period"}
                      control={control}
                      render={({ field }) => (
                        <Select
                          placeholder={t("select_from_list")}
                          className="w-full"
                          {...field}
                          options={[
                            { value: 1, label: t("day") },
                            { value: 7, label: t("week") },
                            { value: 30, label: t("month") }
                          ]}
                        />
                      )}
                    />
                  </Form.Group>
                </Form.Section>
                <Form.Section
                  title={t("marketing.affiliates.form.settings.payout_control")}
                  description={t("marketing.affiliates.form.settings.payout_control_description")}
                >
                  <AddonController addon="affiliates.settings.payouts">
                    <Typography.Paragraph
                      size="lg"
                      weight="medium"
                      className={"mb-3"}
                      children={t("marketing.affiliates.form.settings.payout_minimum")}
                    />
                    <Form.Group
                      required
                      className="mb-0"
                      errors={errors.payout_threshold?.message}
                      placeholder="0.00"
                    >
                      <Controller
                        name={"payout_threshold"}
                        control={control}
                        render={({ field }) => (
                          <Form.Number
                            className="w-full"
                            withHandlers={false}
                            min={0}
                            max={100}
                            suffix={currentCurrency}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>

                    <Form.Group
                      errors={errors.payout_methods?.message}
                      required
                      label={t("marketing.affiliates.form.settings.payout_methods")}
                      className="mb-0 mt-6"
                    >
                      <Controller
                        name={"payout_methods"}
                        control={control}
                        render={({ field }) => (
                          <div className="mt-1">
                            <Form.Group className="!mb-4">
                              <Form.Checkbox
                                id="payout_methods_wire"
                                label={t("marketing.affiliates.form.settings.payout_methods_wire")}
                                {...field}
                                value="wire"
                                checked={field.value?.includes("wire")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, e.target.value]);
                                  } else {
                                    field.onChange(field.value.filter((item) => item !== e.target.value));
                                  }
                                }}
                              />
                            </Form.Group>
                            <Form.Group className="!mb-0">
                              <Form.Checkbox
                                id="payout_methods_paypal"
                                label={t("marketing.affiliates.form.settings.payout_methods_paypal")}
                                {...field}
                                value="paypal"
                                checked={field.value?.includes("paypal")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, e.target.value]);
                                  } else {
                                    field.onChange(field.value.filter((item) => item !== e.target.value));
                                  }
                                }}
                              />
                            </Form.Group>
                          </div>
                        )}
                      />
                    </Form.Group>
                  </AddonController>
                </Form.Section>
              </>
            )}
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
