import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import find from "lodash/find";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Layout } from "@/components";
import CurrenciesSelect from "@/components/select/CurrenciesSelect";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useAppDispatch, useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { APIActionResponse, Academy } from "@/types";

import { Badge, Form, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  title: string;
  email: string;
  support_email: string;
  vat_enabled: boolean;
  vat_id: string;
  vat_percent: number;
  vat_type: "excluded" | "included";
  vat_type_enabled: boolean;
  currency: {
    label: string;
    value: any;
  };
  meta: {
    restrict_login_ip: boolean;
    disable_text_copy: boolean;
    unbranded: boolean;
    enable_watermark: boolean;
  };
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
export default function Index() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { msaaqpay, currencies } = useAppSelector<AppSliceStateType>((state) => state.app);
  const academy = useAppSelector((state) => state.auth.current_academy);

  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();
  const schema = yup.object().shape({
    title: yup.string().required(),
    email: yup.string().email().required(),
    support_email: yup.string().email().nullable().required(),
    meta: yup.object().shape({
      restrict_login_ip: yup.boolean(),
      disable_text_copy: yup.boolean(),
      unbranded: yup.boolean(),
      enable_watermark: yup.boolean()
    }),
    vat_id: yup
      .string()
      .when("vat_enabled", {
        is: true,
        then: yup.string().required().nullable()
      })
      .nullable(),
    currency: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.string()
      })
      .required(),
    vat_percent: yup
      .number()
      .when("vat_enabled", {
        is: true,
        then: yup
          .number()
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .min(1, t("academy_settings.vat.vat_percent_validation"))
          .max(100)
          .required()
      })
      .nullable()
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
    watch,
    setValue,
    setError
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (academy && currencies.length) {
      const currency = find(currencies, (el) => el.code.toLowerCase() === academy.currency?.toLowerCase());

      reset({
        title: academy.title,
        email: academy.email,
        support_email: academy.support_email,
        meta: {
          restrict_login_ip: academy.meta.restrict_login_ip,
          unbranded: academy.meta.unbranded,
          disable_text_copy: academy.meta.disable_text_copy,
          enable_watermark: academy.meta.enable_watermark
        },
        vat_type: academy?.vat_type,
        vat_type_enabled: academy?.vat_type == "included",
        vat_id: academy?.vat_id,
        vat_percent: academy?.vat_percent,
        vat_enabled: !!academy?.vat_id,
        currency: {
          ...currency,
          label: currency?.name,
          value: currency?.code
        }
      });
    }
  }, [academy, currencies]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (!msaaqpay?.installed) {
      if (data.vat_type_enabled) {
        data.vat_type = "included";
      } else {
        data.vat_type = "excluded";
      }
    }

    let transformedData = {
      title: data.title,
      email: data.email,
      support_email: data.support_email,
      ...(data.vat_enabled
        ? {
            vat_id: data?.vat_id,
            vat_percent: data?.vat_percent
          }
        : {
            vat_id: "",
            vat_percent: 0
          }),
      vat_type: data?.vat_type,
      currency: data?.currency.value,
      meta: {
        restrict_login_ip: data.meta.restrict_login_ip,
        disable_text_copy: data.meta.disable_text_copy,
        unbranded: data.meta.unbranded,
        enable_watermark: data.meta.enable_watermark
      }
    };

    const updatedAcademy = (await updateAcademySettingsMutation(transformedData)) as APIActionResponse<Academy>;
    if (displayErrors(updatedAcademy)) {
      return;
    }
    displaySuccess(updatedAcademy);
    dispatch({ type: "auth/setCurrentAcademy", payload: updatedAcademy.data.data });
  };

  return (
    <Layout title={t("academy_settings.title")}>
      <SettingsTabs />
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={academy}
                redirect={"settings"}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("academy_settings.general_settings.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("academy_settings.general_settings.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"academy_settings.helpdesk_description"}
                    components={{
                      a: (
                        <Link
                          target={"_blank"}
                          href="https://help.msaaq.com/ar/category/iaadadat-alakadymya-kp2snr"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              className="section-required mb-6"
              hasDivider
            >
              <Form.Group
                required
                label={t("academy_settings.general_settings.academy_title")}
                errors={errors.title?.message}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      type={"text"}
                      placeholder={t("academy_settings.general_settings.academy_title_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("academy_settings.general_settings.academy_email")}
                help={t("academy_settings.general_settings.academy_email_help")}
                errors={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      type={"email"}
                      dir="ltr"
                      placeholder="reply@academy.com"
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("academy_settings.general_settings.academy_helpdesk_email")}
                help={t("academy_settings.general_settings.academy_helpdesk_email_help")}
                errors={errors.support_email?.message}
              >
                <Controller
                  name="support_email"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      type={"email"}
                      dir="ltr"
                      placeholder="support@academy.com"
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("academy_settings.general_customization.title")}
              description={t("academy_settings.general_customization.description")}
              hasDivider
              className="mb-6"
            >
              <Form.Group errors={errors.meta?.restrict_login_ip?.message}>
                <AddonController addon="app.restrict-login-ip">
                  <Controller
                    name={"meta.restrict_login_ip"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("academy_settings.general_customization.login_restriction_label")}
                        description={t("academy_settings.general_customization.login_restriction_description")}
                        {...rest}
                      />
                    )}
                  />
                </AddonController>
              </Form.Group>

              <Form.Group
                errors={errors.meta?.unbranded?.message}
                className="mb-0"
              >
                <AddonController addon="app.unbranded">
                  <Controller
                    name={"meta.unbranded"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("academy_settings.general_customization.delete_msaaq_logo")}
                        description={t("academy_settings.general_customization.delete_msaaq_logo_description")}
                        {...rest}
                      />
                    )}
                  />
                </AddonController>
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("academy_settings.safety_settings.title")}
              description={t("academy_settings.safety_settings.description")}
              hasDivider={msaaqpay && !msaaqpay?.installed}
              className="new-section mb-6"
            >
              <Form.Group errors={errors.meta?.disable_text_copy?.message}>
                <Controller
                  name={"meta.disable_text_copy"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("academy_settings.safety_settings.disable_text_copy_label")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group errors={errors.meta?.enable_watermark?.message}>
                <AddonController
                  addon="video-library.watermarking"
                  by_request={true}
                >
                  <Controller
                    name={"meta.enable_watermark"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={"enable_watermark"}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("academy_settings.safety_settings.water_mark_label")}
                        {...rest}
                      />
                    )}
                  />
                </AddonController>
              </Form.Group>
            </Form.Section>
            {msaaqpay && !msaaqpay?.installed && (
              <Form.Section
                title={t("academy_settings.vat.title")}
                description={t("academy_settings.vat.description")}
              >
                <Form.Group className="mb-6">
                  <Controller
                    name={"vat_enabled"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        disabled={msaaqpay?.installed}
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("academy_settings.vat.vat_toggle_label")}
                        {...rest}
                      >
                        {watch("vat_enabled") && (
                          <>
                            <Form.Group
                              errors={errors.vat_id?.message}
                              required
                              className="mb-0 mt-4 w-full md:w-2/4"
                              label={t("academy_settings.vat.vat_id")}
                            >
                              <Controller
                                name="vat_id"
                                control={control}
                                render={({ field }) => (
                                  <Form.Input
                                    type={"text"}
                                    placeholder={t("academy_settings.vat.vat_id_placeholder")}
                                    {...field}
                                  />
                                )}
                              />
                            </Form.Group>
                            <Form.Group
                              errors={errors.vat_percent?.message}
                              className="mt-2 gap-y-2"
                            >
                              <div className="mt-2 flex flex-col gap-2">
                                <Form.Group
                                  className="mb-0 w-full md:w-2/4"
                                  required
                                  label={t("academy_settings.vat.vat_percent")}
                                >
                                  <Controller
                                    name={"vat_percent"}
                                    control={control}
                                    render={({ field: { value, ...rest } }) => (
                                      <Form.Number
                                        value={value}
                                        suffix={t("academy_settings.vat.vat_percent_suffix")}
                                        placeholder={"0"}
                                        {...rest}
                                      />
                                    )}
                                  />
                                </Form.Group>
                              </div>
                            </Form.Group>
                          </>
                        )}
                      </Form.Toggle>
                    )}
                  />
                </Form.Group>

                <Form.Group
                  errors={errors.vat_type_enabled?.message}
                  className="mb-6"
                >
                  <Controller
                    name={"vat_type_enabled"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        disabled={msaaqpay?.installed}
                        id="vat_type_enabled"
                        checked={academy?.vat_type == "included"}
                        label={t("academy_settings.vat.vat_included")}
                        description={t("academy_settings.vat.vat_included_description")}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  required
                  className="mb-0"
                  label={t("academy_settings.vat.currency")}
                  errors={errors.currency?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <CurrenciesSelect
                        disabled={msaaqpay?.installed}
                        placeholder={t("academy_settings.vat.currency_placeholder")}
                        {...field}
                      />
                    )}
                    name={`currency`}
                    control={control}
                  />
                </Form.Group>
              </Form.Section>
            )}
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
