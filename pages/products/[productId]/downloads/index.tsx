import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProductDownloadsCol from "@/columns/productDownloadsCol";
import { Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import { useAppDispatch, useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductDownloadsQuery, useFetchProductQuery } from "@/store/slices/api/productsSlice";
import { Course, Product } from "@/types";

import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Breadcrumbs, Button, Icon, Typography } from "@msaaqcom/abjad";

type CourseData = Array<Course> & {
  subRows?: CourseData[];
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { productId }
  } = router;
  const { data: product = {} as Product } = useFetchProductQuery(productId as string);

  const [exportProductDownloads] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportProductDownloads({
      endpoint: `/products/${product.id}/downloads/export`,
      payload: {
        filters: {
          product_id: productId
        }
      },
      name: `${product.id}-downloads`,
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/products/${productId}` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  return (
    <Layout title={product?.title}>
      <Layout.Container>
        <Breadcrumbs className="overflow-y-hidden overflow-x-scroll whitespace-nowrap">
          <Link href="/">
            <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
          </Link>
          <Link href="/products">
            <Typography.Paragraph as="span">{t("products.title")}</Typography.Paragraph>
          </Link>
          <Link href={`/products/${productId}`}>
            <Typography.Paragraph as="span">{product?.title}</Typography.Paragraph>
          </Link>
          <Typography.Paragraph
            as="span"
            className="text-gray-800"
          >
            {t("products.downloads_details")}
          </Typography.Paragraph>
        </Breadcrumbs>

        <Datatable
          selectable={false}
          hasPagination={false}
          fetcher={useFetchProductDownloadsQuery}
          fetcherParams={{ productId: product.id }}
          columns={{
            columns: ProductDownloadsCol,
            props: {}
          }}
          toolbar={(instance) => (
            <>
              <Button
                icon={
                  <Icon
                    size="sm"
                    children={<ArrowDownTrayIcon />}
                  />
                }
                onClick={() => handleExport(instance)}
                variant="default"
                size="md"
                className="ltr:mr-4 rtl:ml-4"
              >
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                  children={t("export")}
                />
              </Button>
            </>
          )}
        />
      </Layout.Container>
    </Layout>
  );
}
