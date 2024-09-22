import React from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout } from "@/components";
import CertificateTemplateForm from "@/components/shared/certificates/CertificateTemplateForm";
import i18nextConfig from "@/next-i18next.config";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});
export default function Create({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  return (
    <Layout title={t("certificates_templates.create")}>
      <Layout.Container>
        <AddonController addon="certificates">
          <CertificateTemplateForm
            certificateTemplate={{
              id: 1,
              updated_at: new Date().toString(),
              created_at: new Date().toString(),
              temp_values: true
            }}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
