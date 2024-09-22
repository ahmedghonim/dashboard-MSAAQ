import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { components } from "react-select";

import { AddonController, Card, Layout } from "@/components";
import { Select } from "@/components/select";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchAcademyTranslationsQuery,
  useUpdateAcademyTranslationsMutation
} from "@/store/slices/api/academyTranslationsSlice";
import { APIActionResponse } from "@/types";

import { Alert, Form, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  [key: string]: {
    [key: string]: TranslationKey;
  };
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
type TranslationKey = {
  default: string;
  current: string;
};
type Translations = {
  [key: string]: {
    [key: string]: TranslationKey;
  };
};

export default function Translations() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = router.query;
  const academy = useAppSelector((state) => state.auth.current_academy);

  const [selectedLocale, setSelectedLocale] = useState<string>((lang as string) || academy.locale);

  const { data: translations = {} as { data: Translations }, isLoading } = useFetchAcademyTranslationsQuery({
    locale: selectedLocale
  });
  const [updateAcademyTranslationsMutation] = useUpdateAcademyTranslationsMutation();
  const [selectedTranslationKey, setSelectedTranslationKey] = useState<string>("");

  const form = useForm({
    mode: "all"
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    reset
  } = form;

  const { display } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (translations?.data && selectedTranslationKey) {
      reset({
        [selectedTranslationKey]: translations.data[selectedTranslationKey]
      });
    }
  }, [selectedTranslationKey, selectedLocale, translations]);

  useEffect(() => {
    if (translations?.data && !isLoading) {
      setSelectedTranslationKey((prev) => {
        if (!prev) {
          return Object.keys(translations.data)[0];
        }
        return prev;
      });
    }
  }, [translations]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const texts: Record<string, string> = {};
    for (const parentKey in data) {
      for (const childKey in data[parentKey]) {
        const current = data[parentKey][childKey].current;
        const key = `${parentKey}.${childKey}`;
        texts[key] = current;
      }
    }
    const result = {
      locale: selectedLocale,
      texts: texts
    };
    const req = (await updateAcademyTranslationsMutation(result)) as APIActionResponse<any>;

    display(req);
  };

  return (
    <Layout title={t("academy_settings.title")}>
      <SettingsTabs />
      <Layout.Container>
        <AddonController addon="translations">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Alert
              variant="default"
              className="mb-6"
              children={t("academy_settings.translations.alert")}
            />
            <Layout.FormGrid
              sidebar={
                <Layout.FormGrid.Actions
                  product={academy}
                  redirect={"settings"}
                  form={form}
                />
              }
            >
              <Card>
                <Card.Body>
                  <Form.Group label={t("translations.select_locale_to_edit")}>
                    <Select
                      disabled={academy.supported_locales?.length === 1}
                      isSearchable={false}
                      options={academy.supported_locales?.map((lang) => ({
                        label: lang.native,
                        value: lang
                      }))}
                      defaultValue={{
                        label: academy.supported_locales?.find((lang) => lang.code === selectedLocale)?.native,
                        value: academy.supported_locales?.find((lang) => lang.code === selectedLocale)
                      }}
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
                      onChange={(option) => {
                        router.push({
                          query: {
                            lang: option.value.code
                          }
                        });
                        setSelectedLocale(option.value.code);
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    label={t("academy_settings.translations.translations_select_label")}
                    className="mb-0"
                  >
                    {!isLoading && (
                      <Select
                        options={Object.keys(translations?.data ?? {}).map((key) => {
                          return {
                            label: t(`translation-headers.${key}`),
                            value: key
                          };
                        })}
                        value={{
                          label: t(`translation-headers.${selectedTranslationKey}`),
                          value: selectedTranslationKey
                        }}
                        placeholder={t("academy_settings.translations.translations_select_label")}
                        onChange={(option) => {
                          setSelectedTranslationKey(option.value);
                        }}
                      />
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
              <div className="mt-4 flex flex-col space-y-4">
                {selectedTranslationKey && (
                  <Typography.Paragraph
                    size="lg"
                    weight="bold"
                    children={t(`translation-headers.${selectedTranslationKey}`)}
                  />
                )}
                <div className="flex flex-col space-y-6">
                  {Object.keys(translations?.data?.[selectedTranslationKey] ?? {}).map((key, index) => {
                    return (
                      <Form.Group
                        key={index}
                        label={(translations?.data?.[selectedTranslationKey][key] as TranslationKey).default}
                        //@ts-ignore
                        errors={errors?.[selectedTranslationKey]?.[key] ? ["field is required"] : []}
                        className="mb-0"
                        dir="auto"
                      >
                        <Controller
                          render={({ field: { value, onChange, ...rest } }) => (
                            <Form.Input
                              dir="auto"
                              value={(translations?.data?.[selectedTranslationKey][key] as TranslationKey).current}
                              onChange={(e) => {
                                onChange({
                                  current: e.target.value,
                                  default: (translations?.data?.[selectedTranslationKey][key] as TranslationKey).default
                                });
                              }}
                              {...rest}
                            />
                          )}
                          name={`${selectedTranslationKey}.${key}`}
                          control={control}
                          rules={{
                            required: true
                          }}
                        />
                      </Form.Group>
                    );
                  })}
                </div>
              </div>
            </Layout.FormGrid>
          </Form>
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
