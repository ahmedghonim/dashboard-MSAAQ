import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import ReviewsTable from "@/components/shared/ReviewsTable";
import i18nextConfig from "@/next-i18next.config";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { productId }
  } = router;

  return (
    <Layout title={t("courses.reviews.title")}>
      <Layout.Container>
        <ReviewsTable
          filters={{
            product_id: productId as string
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
