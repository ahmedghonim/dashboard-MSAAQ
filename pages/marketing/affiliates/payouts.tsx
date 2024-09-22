import React, { useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import AffiliatePayoutsCols from "@/columns/affiliatePayouts";
import { Card, Datatable, EmptyStateTable, Layout } from "@/components";
import AffiliatesIndexTabs from "@/components/marketing/affiliates/AffiliatesIndexTabs";
import { useCopyToClipboard, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchAffiliatePayoutsQuery,
  useUpdateAffiliatePayoutMutation
} from "@/store/slices/api/affiliatePayoutsSlice";
import { APIActionResponse } from "@/types";
import { AffiliatePayout } from "@/types/models/affiliatePayout";
import { classNames, objectToQueryString, randomUUID } from "@/utils";

import { DocumentCheckIcon, DocumentDuplicateIcon, PencilIcon } from "@heroicons/react/24/outline";

import { Button, Form, Grid, Icon, Modal, SingleFile, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  receipt?: SingleFile[];
}

export default function Payouts({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const [copy, values] = useCopyToClipboard();

  const [showApprovedModal, setShowApprovedModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<AffiliatePayout | null>(null);

  const [updateAffiliatePayout] = useUpdateAffiliatePayoutMutation();

  const schema = yup.object({
    receipt: yup.mixed().required()
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const onSubmit: SubmitHandler<IFormInputs> = async (data: IFormInputs) => {
    const affiliatePayout = (await updateAffiliatePayout({
      id: editing?.id,
      receipt: data.receipt?.map((file) => file.file).pop()
    })) as APIActionResponse<AffiliatePayout>;

    if (displayErrors(affiliatePayout)) return;

    displaySuccess(affiliatePayout);

    await router.replace({
      query: objectToQueryString({
        ...router.query,
        fetch: randomUUID()
      })
    });

    setShowApprovedModal(false);
    setEditing(null);
    reset();
  };

  return (
    <Layout title={t("sidebar.marketing.affiliates")}>
      <AffiliatesIndexTabs />

      <Layout.Container>
        <Datatable
          fetcher={useFetchAffiliatePayoutsQuery}
          columns={{
            columns: AffiliatePayoutsCols,
            props: {
              approveAffiliateHandler: (payout: AffiliatePayout) => {
                setEditing(payout);
                setShowApprovedModal(true);
              }
            }
          }}
          emptyState={
            <EmptyStateTable
              title={t("marketing.affiliates.empty_state.title")}
              content={t("marketing.affiliates.empty_state.description")}
              icon={<PencilIcon className="h-12 w-12 text-gray-400" />}
            />
          }
        />

        <Modal
          size="lg"
          open={showApprovedModal}
          onDismiss={() => setShowApprovedModal(false)}
        >
          <Modal.Header>
            <Modal.HeaderTitle>{t("marketing.affiliates.form.approve_payout")}</Modal.HeaderTitle>
          </Modal.Header>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Modal.Content>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Header>
                      <Typography.Paragraph
                        size="md"
                        weight="bold"
                        children={t("marketing.affiliates.form.payout_details")}
                      />
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        columns={{
                          sm: 2
                        }}
                      >
                        <Grid.Cell>
                          <Typography.Paragraph
                            size="sm"
                            className={`gray-700`}
                            children={t(
                              `marketing.affiliates.form.${
                                editing?.payout_details?.method === "paypal" ? "paypal_email" : "bank_name"
                              }`
                            )}
                          />

                          <div className="flex items-center">
                            <Typography.Paragraph
                              size="sm"
                              weight="bold"
                              children={
                                editing?.payout_details?.method === "paypal"
                                  ? editing?.payout_details?.paypal_email
                                  : editing?.payout_details?.bank_name
                              }
                            />
                            <Button
                              ghost
                              variant="default"
                              onClick={() =>
                                copy(
                                  editing?.payout_details?.method === "paypal"
                                    ? editing?.payout_details?.paypal_email
                                    : editing?.payout_details?.bank_name
                                )
                              }
                              icon={
                                <Icon
                                  size="sm"
                                  className={classNames(
                                    values.includes(
                                      editing?.payout_details?.method === "paypal"
                                        ? editing?.payout_details?.paypal_email
                                        : editing?.payout_details?.bank_name
                                    )
                                      ? "text-success"
                                      : ""
                                  )}
                                  children={values.includes("") ? <DocumentCheckIcon /> : <DocumentDuplicateIcon />}
                                />
                              }
                            />
                          </div>
                        </Grid.Cell>

                        <Grid.Cell>
                          <Typography.Paragraph
                            size="sm"
                            className={`gray-700`}
                            children={t("marketing.affiliates.form.method")}
                          />

                          <Typography.Paragraph
                            size="md"
                            weight="medium"
                            children={t("marketing.affiliates.methods." + editing?.payout_details?.method)}
                          />
                        </Grid.Cell>

                        <Grid.Cell
                          columnSpan={{
                            sm: 2
                          }}
                        >
                          <Typography.Paragraph
                            size="sm"
                            className={`gray-700`}
                            children={t(`marketing.affiliates.form.member`)}
                          />

                          <div className="flex items-center">
                            <Typography.Paragraph
                              size="sm"
                              weight="bold"
                              children={
                                <Card.Author
                                  title={editing?.member.name}
                                  subtitle={editing?.member.email}
                                  avatar={editing?.member.avatar?.url}
                                />
                              }
                            />
                            <Button
                              ghost
                              variant="default"
                              onClick={() => copy(editing?.member?.name || "")}
                              icon={
                                <Icon
                                  size="sm"
                                  className={classNames(
                                    values.includes(editing?.member?.name || "") ? "text-success" : ""
                                  )}
                                  children={values.includes("") ? <DocumentCheckIcon /> : <DocumentDuplicateIcon />}
                                />
                              }
                            />
                          </div>
                        </Grid.Cell>

                        {editing?.payout_details?.method !== "paypal" && (
                          <Grid.Cell
                            columnSpan={{
                              sm: 2
                            }}
                          >
                            <Typography.Paragraph
                              size="sm"
                              className={`gray-700`}
                              children={t(`marketing.affiliates.form.bank_account_iban`)}
                            />

                            <div className="flex items-center">
                              <Typography.Paragraph
                                size="sm"
                                weight="bold"
                                children={editing?.payout_details?.iban}
                              />
                              <Button
                                ghost
                                variant="default"
                                onClick={() => copy(editing?.payout_details?.iban || "")}
                                icon={
                                  <Icon
                                    size="sm"
                                    className={classNames(
                                      values.includes(editing?.payout_details?.iban || "") ? "text-success" : ""
                                    )}
                                    children={values.includes("") ? <DocumentCheckIcon /> : <DocumentDuplicateIcon />}
                                  />
                                }
                              />
                            </div>
                          </Grid.Cell>
                        )}
                      </Grid>
                    </Card.Body>
                  </Card.Body>
                </Card>

                <Form.Group
                  label={t("marketing.affiliates.form.receipt")}
                  className={`mb-0 mt-4`}
                  errors={errors.receipt?.message}
                >
                  <Controller
                    name={"receipt"}
                    control={control}
                    render={({ field: { onChange, ...rest } }) => (
                      <Form.File
                        accept={["image/*", "application/pdf"]}
                        maxFiles={1}
                        maxSize={2}
                        onChange={(files: SingleFile[]) => {
                          if (files.length) {
                            onChange(files);
                          }
                        }}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
              </Modal.Content>
            </Modal.Body>

            <Modal.Footer>
              <Button
                size="lg"
                className="ml-2"
                type="submit"
                children={t("marketing.affiliates.actions.approve")}
                disabled={isSubmitting || !isValid}
              />

              <Button
                ghost
                size="lg"
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  setShowApprovedModal(false);
                }}
                children={t("cancel")}
              />
            </Modal.Footer>
          </Form>
        </Modal>
      </Layout.Container>
    </Layout>
  );
}
