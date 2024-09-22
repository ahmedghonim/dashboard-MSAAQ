import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import { loadSupportedLanguages } from "@/actions/options";
import { AddonController, Card, Layout } from "@/components";
import { Select } from "@/components/select";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useAppDispatch, useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { APIActionResponse, Academy, Language } from "@/types";

import { Button, Form, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  default_locale: {
    label: string;
    value: Language;
  };
  supported_locales: Language[];
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Translations() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const academy = useAppSelector((state) => state.auth.current_academy);

  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();
  const [toBeAddedLanguage, setToBeAddedLanguage] = useState<Language>();

  const schema = yup.object().shape({});

  const form = useForm<IFormInputs>({
    mode: "all",
    defaultValues: {
      supported_locales: []
    },
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
    setValue,
    getValues,
    watch
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (academy) {
      const lang = academy.supported_locales.find((lang) => lang.code === academy.locale);
      reset({
        default_locale: {
          label: lang?.native,
          value: lang
        },
        supported_locales: academy.supported_locales
      });
    }
  }, [academy]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedAcademy = (await updateAcademySettingsMutation({
      locale: data.default_locale.value.code,
      //@ts-ignore
      supported_locales: data.supported_locales.map((lang) => lang.code)
    })) as APIActionResponse<Academy>;
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
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={academy}
                redirect={"/settings"}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("translations.title")}
              description={t("translations.description")}
            >
              <Form.Group
                label={t("translations.default_locale")}
                required
                errors={errors.default_locale?.message}
              >
                <Controller
                  name={"default_locale"}
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={watch("supported_locales")?.length === 1}
                      isSearchable={false}
                      options={watch("supported_locales")?.map((lang) => ({
                        label: lang.native,
                        value: lang
                      }))}
                      components={{
                        Option: (props) => (
                          <components.Option {...props}>
                            <div className="flex items-center">
                              <div
                                style={{
                                  backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.regional
                                    ?.split("_")[1]
                                    ?.toLowerCase()}.svg)`
                                }}
                                className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                              />
                              <span className="mr-2">{props.data.label}</span>
                            </div>
                          </components.Option>
                        ),
                        SingleValue: (props) => (
                          <components.SingleValue {...props}>
                            <div className="flex items-center">
                              <div
                                style={{
                                  backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.regional
                                    ?.split("_")[1]
                                    ?.toLowerCase()}.svg)`
                                }}
                                className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                              />
                              <span className="mr-2">{props.data.label}</span>
                            </div>
                          </components.SingleValue>
                        )
                      }}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Card>
                <Card.Body>
                  <Typography.Paragraph
                    size="md"
                    className="text-gray-700"
                  >
                    {t("translations.supported_locales")}
                  </Typography.Paragraph>
                  {watch("supported_locales")?.map((lang) => (
                    <div
                      key={lang.code}
                      className="mb-4 rounded-lg bg-gray-50 p-4 last:mb-0"
                    >
                      <Form.Group
                        errors={errors.supported_locales?.message}
                        className="mb-0"
                      >
                        <div className="flex flex-row items-center justify-between">
                          <Form.Toggle
                            id={lang.code}
                            value={lang.code}
                            disabled={watch("supported_locales")?.length === 1}
                            checked={!!getValues("supported_locales")?.find((l) => l.code === lang.code)}
                            label={
                              <div className="flex items-center">
                                <div
                                  style={{
                                    backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${lang.regional
                                      .split("_")[1]
                                      ?.toLowerCase()}.svg)`
                                  }}
                                  className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                                />
                                <span className="mx-2 flex items-center gap-2">
                                  {lang.native}
                                  {lang.code === watch("default_locale")?.value.code && (
                                    <span className="text-xs text-gray-700">({t("translations.default_locale")})</span>
                                  )}
                                </span>
                              </div>
                            }
                            onChange={(e) => {
                              if (!e.target.checked) {
                                const locals = getValues("supported_locales").filter((l) => l.code !== lang.code);
                                setValue("supported_locales", locals, {
                                  shouldDirty: true
                                });
                                if (locals.length === 1) {
                                  setValue(
                                    "default_locale",
                                    {
                                      label: locals[0].native,
                                      value: locals[0]
                                    },
                                    {
                                      shouldDirty: true
                                    }
                                  );
                                }
                              }
                            }}
                          />
                          <Button
                            as={Link}
                            href={`/settings/translations/edit?lang=${lang.code}`}
                            variant="default"
                            size="sm"
                          >
                            {t("translations.edit_translations")}
                          </Button>
                        </div>
                      </Form.Group>
                    </div>
                  ))}

                  <AddonController
                    by_request={true}
                    addon="multilingual"
                  >
                    <div className="my-4 h-px bg-gray-400" />
                    <Form.Group label={t("translations.add_locale")}>
                      <Select
                        isSearchable={false}
                        loadOptions={loadSupportedLanguages}
                        cacheOptions={watch("supported_locales").map((lang) => lang.code)}
                        key={watch("supported_locales")
                          .map((lang) => lang.code)
                          .join("")}
                        filterOption={(option) => {
                          if (!watch("supported_locales")?.length) {
                            return false;
                          }
                          //@ts-ignore
                          return !watch("supported_locales").find((lang) => lang.code === option.value.code);
                        }}
                        components={{
                          Option: (props) => (
                            <components.Option {...props}>
                              <div className="flex items-center">
                                <div
                                  style={{
                                    backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.regional
                                      .split("_")[1]
                                      ?.toLowerCase()}.svg)`
                                  }}
                                  className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                                />
                                <span className="mr-2">{props.data.label}</span>
                              </div>
                            </components.Option>
                          ),
                          SingleValue: (props) => (
                            <components.SingleValue {...props}>
                              <div className="flex items-center">
                                <div
                                  style={{
                                    backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.regional
                                      .split("_")[1]
                                      ?.toLowerCase()}.svg)`
                                  }}
                                  className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                                />
                                <span className="mr-2">{props.data.label}</span>
                              </div>
                            </components.SingleValue>
                          )
                        }}
                        onChange={(option) => {
                          setToBeAddedLanguage(option.value);
                        }}
                      />
                    </Form.Group>
                    <Button
                      onClick={() => {
                        if (toBeAddedLanguage) {
                          setValue("supported_locales", [...getValues("supported_locales"), toBeAddedLanguage], {
                            shouldDirty: true
                          });
                          setToBeAddedLanguage(undefined);
                        }
                      }}
                      disabled={!toBeAddedLanguage}
                    >
                      {t("add")}
                    </Button>
                  </AddonController>
                </Card.Body>
              </Card>
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
