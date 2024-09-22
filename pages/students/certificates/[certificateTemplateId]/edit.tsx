import React from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout } from "@/components";
import CertificateTemplateForm from "@/components/shared/certificates/CertificateTemplateForm";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCertificatesTemplateQuery } from "@/store/slices/api/certificatesTemplatesSlice";
import { CertificateTemplate } from "@/types";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});
export default function Edit({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    query: { certificateTemplateId }
  } = router;

  const { data: certificate = {} as CertificateTemplate } = useFetchCertificatesTemplateQuery(
    certificateTemplateId as string,
    {
      refetchOnMountOrArgChange: true
    }
  );

  return (
    <Layout title={t("certificates_templates.edit")}>
      <Layout.Container>
        <AddonController addon="certificates">
          <CertificateTemplateForm certificateTemplate={certificate} />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
