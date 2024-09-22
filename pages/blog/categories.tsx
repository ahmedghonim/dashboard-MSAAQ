import React from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController } from "@/components";
import ArticlesIndexTabs from "@/components/shared/blog/ArticlesIndexTabs";
import TaxonomiesTable from "@/components/taxonomies/TaxonomiesTable";
import i18nextConfig from "@/next-i18next.config";
import { TaxonomyType } from "@/types";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  return (
    <AddonController addon="articles">
      <TaxonomiesTable
        type={[TaxonomyType.POST_CATEGORY]}
        title={t("articles.title")}
        tabs={<ArticlesIndexTabs />}
      />
    </AddonController>
  );
}
