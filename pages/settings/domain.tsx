import React, { ChangeEvent, useContext, useEffect, useState } from "react";

import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Card, HelpdeskLink, Layout } from "@/components";
import DomainDnsSettingsModal from "@/components/modals/DomainDnsSettingsModal";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { AuthContext } from "@/contextes";
import { useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useCreateDomainMutation,
  useDeleteDomainMutation,
  useFetchDomainsQuery,
  useMakeDomainDefaultMutation,
  useVerifyDomainActivationMutation
} from "@/store/slices/api/domainsSlice";
import { APIActionResponse, DomainStatus } from "@/types";
import { Domain } from "@/types/models/domain";
import { classNames, selectOnClick, slugify } from "@/utils";

import { BoltIcon, FlagIcon } from "@heroicons/react/24/outline";

import { Badge, Button, Form, Icon, Title, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  type: "free" | "custom";
  slug: string;
  domain: string;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    multiTenancyRootDomain: process.env.MULTI_TENANCY_ROOT_DOMAIN,
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function DomainSettings({
  multiTenancyRootDomain
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const { data: domains, refetch } = useFetchDomainsQuery();
  const [createDomainMutation] = useCreateDomainMutation();
  const [verifyDomainActivation, { isLoading }] = useVerifyDomainActivationMutation();
  const [makeDomainDefault] = useMakeDomainDefaultMutation();
  const { current_academy, refetchAuth } = useContext(AuthContext);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteDomainMutation
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(
      yup.object().shape({
        type: yup.string().oneOf(["free", "custom"]).required(),
        slug: yup.mixed().when("type", {
          is: "free",
          then: yup.string().required()
        }),
        domain: yup.mixed().when("type", {
          is: "custom",
          then: yup.string().required()
        })
      })
    )
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setError
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const resetForm = () => {
    const isFreeDomain = current_academy?.domain.includes(multiTenancyRootDomain);

    reset({
      slug: current_academy?.slug,
      type: domains?.data?.length ? "custom" : "free",
      domain: domains?.data?.length ? domains?.data[0].domain : ""
    });
  };

  useEffect(() => {
    if (domains?.data?.length) {
      setDomain(domains.data[0]);
    }

    resetForm();
  }, [current_academy, domains]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    let response: APIActionResponse<Domain>;
    if (data.type === "custom" && domain?.status === DomainStatus.ACTIVE) {
      response = (await makeDomainDefault(domain.id)) as APIActionResponse<Domain>;
    } else {
      response = (await createDomainMutation({
        type: data.type,
        domain: data.type === "free" ? undefined : data.domain,
        slug: data.type === "custom" ? undefined : data.slug
      })) as APIActionResponse<Domain>;
    }

    if (displayErrors(response)) {
      return;
    }

    displaySuccess(response);

    if (data.type === "custom") {
      setDomain(response.data.data);
    }

    resetForm();
  };

  const checkDomainVerification = async () => {
    if (!domain?.id) {
      return;
    }

    const response = (await verifyDomainActivation(domain.id)) as APIActionResponse<Domain>;

    if (displayErrors(response)) {
      return;
    }

    displaySuccess(response);

    setDomain(response.data.data);

    resetForm();
  };

  return (
    <Layout title={t("academy_settings.domain.title")}>
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={{
                  id: true
                }}
                saveAndContinue={false}
                redirect={"/settings/domain"}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("academy_settings.domain.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("academy_settings.domain.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"academy_settings.domain.help_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug="kyfya-rbt-alntak-almkhss-maa-akadymytk-zmti34"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
            >
              <Form.Group label={t("academy_settings.domain.select_domain_type")}>
                <div className="flex items-start gap-4">
                  <Controller
                    name="type"
                    control={control}
                    defaultValue="free"
                    render={({ field: { value, ...field } }) => (
                      <label
                        className={classNames(
                          "w-full cursor-pointer rounded border px-4 py-4",
                          "flex items-center gap-2",
                          value === "free" ? "border-primary bg-primary-50" : "border-gray"
                        )}
                      >
                        <Form.Radio
                          id="source-free"
                          value="free"
                          checked={value === "free"}
                          label={t("academy_settings.domain.free_domain")}
                          {...field}
                        />

                        <Icon
                          size="lg"
                          children={<FlagIcon />}
                          className="mr-auto"
                        />
                      </label>
                    )}
                  />

                  <Controller
                    name="type"
                    control={control}
                    defaultValue="custom"
                    render={({ field: { value, ...field } }) => (
                      <label
                        className={classNames(
                          "w-full cursor-pointer rounded border px-4 py-4",
                          "flex items-center gap-2",
                          value === "custom" ? "border-primary bg-primary-50" : "border-gray"
                        )}
                      >
                        <Form.Radio
                          id="source-custom"
                          value="custom"
                          checked={value === "custom"}
                          label={t("academy_settings.domain.custom_domain")}
                          {...field}
                        />

                        <Icon
                          size="lg"
                          children={<BoltIcon />}
                          className="mr-auto"
                        />
                      </label>
                    )}
                  />
                </div>
              </Form.Group>

              {watch("type") === "free" && (
                <AddonController
                  addon="domains.subdomain"
                  type="block"
                >
                  <Form.Group
                    required
                    label={t("academy_settings.domain.enter_subdomain")}
                    help={t("academy_settings.domain.enter_subdomain_help")}
                    errors={errors.slug?.message}
                  >
                    <Controller
                      name="slug"
                      control={control}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <Form.Input
                          className="swipe-direction"
                          prepend={
                            <div
                              className=" swipe-direction latin-text bg-gray px-4 py-3 text-gray-700"
                              children=".msaaq.net"
                            />
                          }
                          placeholder="your-domain"
                          value={slugify(value).trim()}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            onChange(slugify(event.target.value).trim());
                          }}
                          {...rest}
                        />
                      )}
                    />
                  </Form.Group>
                </AddonController>
              )}

              {watch("type") === "custom" && (
                <AddonController
                  addon="domains.custom"
                  type="block"
                >
                  <Form.Group
                    required
                    label={t("academy_settings.domain.enter_subdomain")}
                    errors={errors.domain?.message}
                  >
                    <Controller
                      name="domain"
                      control={control}
                      render={({ field: { value, ...field } }) => (
                        <Form.Input
                          placeholder={t("academy_settings.domain.custom_domain_placeholder")}
                          value={value}
                          dir={value ? "ltr" : "rtl"}
                          disabled={!!domain?.id}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>

                  {domain && (
                    <div className="flex flex-col gap-4">
                      <Card>
                        <Card.Body className="flex flex-col gap-4">
                          <div>
                            <Typography.Paragraph
                              weight="medium"
                              children={t("academy_settings.domain.activation_steps")}
                            />
                            <Typography.Paragraph
                              className="text-gray-700"
                              children={t(
                                !domain.is_subdomain
                                  ? "academy_settings.domain.root_domain_activation"
                                  : "academy_settings.domain.subdomain_activation"
                              )}
                            />
                          </div>

                          <Card className="px-4 py-2">
                            {domain.is_subdomain
                              ? domain.instructions?.map((instruction, i) => (
                                  <div
                                    className="card-divide-x grid grid-cols-5"
                                    key={i}
                                  >
                                    <Title
                                      reverse
                                      className="truncate uppercase"
                                      title={instruction.type}
                                      subtitle={t("academy_settings.domain.records.type")}
                                    />

                                    <Title
                                      reverse
                                      className="col-span-2 truncate"
                                      subtitle={t("academy_settings.domain.records.name")}
                                      title={
                                        <span
                                          children={instruction.name}
                                          onClick={selectOnClick}
                                        />
                                      }
                                    />

                                    <Title
                                      reverse
                                      className="col-span-2 truncate"
                                      subtitle={t("academy_settings.domain.records.value")}
                                      title={
                                        <span
                                          children={instruction.value}
                                          onClick={selectOnClick}
                                        />
                                      }
                                    />
                                  </div>
                                ))
                              : domain.instructions?.map((instruction, i) => (
                                  <p
                                    key={i}
                                    dir="ltr"
                                    children={instruction.value}
                                    onClick={selectOnClick}
                                  />
                                ))}
                          </Card>

                          <Typography.Paragraph
                            className="text-gray-700"
                            children={t("academy_settings.domain.activation_dns_record_help", {
                              provider: domain.registrar
                            })}
                          />

                          <div className="flex items-center justify-between">
                            {domain?.is_active ? (
                              domain.cf_zone_id ? (
                                <DomainDnsSettingsModal domain={domain} />
                              ) : null
                            ) : (
                              <Button
                                variant="default"
                                disabled={isLoading}
                                isLoading={isLoading}
                                children={t("academy_settings.domain.check_verification")}
                                onClick={checkDomainVerification}
                              />
                            )}

                            <Badge
                              icon={<span className="h-1.5 w-1.5 rounded-full bg-white" />}
                              children={t(`academy_settings.domain.statuses.${domain.status}`)}
                              variant={domain.is_active ? "success" : "default"}
                              size="sm"
                              rounded
                            />
                          </div>
                        </Card.Body>
                      </Card>

                      <div>
                        <Button
                          variant="danger"
                          children={t("academy_settings.domain.delete_domain")}
                          ghost
                          onClick={() => {
                            confirmableDelete({
                              id: domain.id,
                              title: t("academy_settings.domain.delete_domain"),
                              children: t("academy_settings.domain.delete_confirm_message"),
                              callback: async () => {
                                setDomain(null);
                                resetForm();
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </AddonController>
              )}
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
