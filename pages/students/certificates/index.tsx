import React, { useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadCertificatesTemplates } from "@/actions/options";
import CertificateTemplatesCols from "@/columns/certificateTemplates";
import { EmptyState, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import { Select } from "@/components/select";
import { useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useDeleteCertificateTemplateMutation,
  useFetchCertificatesTemplatesQuery
} from "@/store/slices/api/certificatesTemplatesSlice";
import { APIActionResponse, CertificateTemplate } from "@/types";

import { BookmarkSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Alert, Button, Form, Icon, Modal } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  alt_certificate_template_id: {
    value: string;
    label: string;
  } | null;
}

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [certificateTemplateId, setCertificateTemplateId] = useState<string | number | null>(null);

  const [deleteCertificateTemplateMutation] = useDeleteCertificateTemplateMutation();

  const schema = yup.object().shape({
    alt_certificate_template_id: yup
      .object()
      .shape({
        value: yup.string().required(),
        label: yup.string().required()
      })
      .required()
  });

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });
  const deleteCertificateTemplateHandler = (certificate: CertificateTemplate) => {
    setCertificateTemplateId(certificate.id);
    setShowModal(true);
  };
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (!certificateTemplateId || !data.alt_certificate_template_id) {
      return;
    }

    const deleted = (await deleteCertificateTemplateMutation({
      id: certificateTemplateId,
      alt_certificate_template_id: data.alt_certificate_template_id?.value
    })) as APIActionResponse<any>;

    if (displayErrors(deleted)) {
      return;
    }

    displaySuccess(deleted);

    setCertificateTemplateId(null);
    setShowModal(false);
    reset({
      alt_certificate_template_id: null
    });
  };

  return (
    <Layout title={t("certificates_templates.title")}>
      <Layout.Container>
        <Datatable
          selectable={false}
          columns={{
            columns: CertificateTemplatesCols,
            props: {
              deleteCertificateTemplateHandler
            }
          }}
          fetcher={useFetchCertificatesTemplatesQuery}
          toolbar={() => (
            <Button
              as={Link}
              href={"/students/certificates/create"}
              variant="primary"
              size="md"
              icon={
                <Icon
                  size="sm"
                  children={<PlusIcon />}
                />
              }
              children={t("certificates_templates.create")}
            />
          )}
          emptyState={
            <EmptyState
              title={t("certificates_templates.empty_state.title")}
              content={t("certificates_templates.empty_state.content")}
              icon={<Icon children={<BookmarkSquareIcon />} />}
            >
              <Button
                as={Link}
                href={"/students/certificates/create"}
                icon={
                  <Icon
                    size="sm"
                    children={<PlusIcon />}
                  />
                }
                children={t("certificates_templates.create")}
              />
            </EmptyState>
          }
        />
        <Modal
          open={showModal}
          onDismiss={() => {
            setCertificateTemplateId(null);
            setShowModal(false);
          }}
          size="lg"
        >
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header>
              <Modal.HeaderTitle>
                {t("certificates_templates.select_certificate_template_before_delete")}
              </Modal.HeaderTitle>
            </Modal.Header>
            <Modal.Body>
              <Modal.Content>
                <Alert
                  variant="danger"
                  title={t("certificates_templates.delete_and_replace_alert_title")}
                >
                  {t("certificates_templates.delete_and_replace_alert_content")}
                </Alert>
                <Form.Group
                  label={t("certificates_templates.certificate_template_select_label")}
                  className="mb-0 mt-6"
                  errors={errors.alt_certificate_template_id?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Select
                        placeholder={t("certificates_templates.certificate_template_select_placeholder")}
                        loadOptions={(inputValue, callback) => {
                          loadCertificatesTemplates(inputValue, callback, (data) =>
                            data
                              .map((item) => ({
                                label: item.name,
                                value: item.id,
                                ...item
                              }))
                              .filter((item) => item.id !== certificateTemplateId)
                          );
                        }}
                        {...field}
                      />
                    )}
                    name={"alt_certificate_template_id"}
                    control={control}
                  />
                </Form.Group>
              </Modal.Content>
            </Modal.Body>
            <Modal.Footer>
              <Button
                size="lg"
                children={t("confirm")}
                type="submit"
                disabled={!isValid || isSubmitting || !isDirty}
              />
              <Button
                variant="dismiss"
                size="lg"
                onClick={() => {
                  setShowModal(false);
                }}
                children={t("undo")}
              />
            </Modal.Footer>
          </Form>
        </Modal>
      </Layout.Container>
    </Layout>
  );
}
