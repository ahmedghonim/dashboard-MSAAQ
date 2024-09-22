import React from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import TaxonomiesTable from "@/components/taxonomies/TaxonomiesTable";
import i18nextConfig from "@/next-i18next.config";
import { TaxonomyType } from "@/types";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  return <TaxonomiesTable type={[TaxonomyType.COURSE_DIFFICULTY]} />;
}
