import { useEffect, useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProductDownloadsCol from "@/columns/productDownloadsCol";
import { Layout } from "@/components";
import ProductDetailsCard from "@/components/cards/ProductDetailsCard";
import ProductStatsCard from "@/components/cards/ProductStatsCard";
import { Datatable } from "@/components/datatable";
import ProductReviewsSection from "@/components/shared/products/ProductReviewsSection";
import { useAppDispatch, useFormatPrice } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchProductDownloadsQuery,
  useFetchProductQuery,
  useFetchProductStatsQuery
} from "@/store/slices/api/productsSlice";
import { Course, Product, ProductStats } from "@/types";

import { ArrowDownTrayIcon, CurrencyDollarIcon, StarIcon } from "@heroicons/react/24/outline";

import { Alert, Breadcrumbs, Button, Grid, Typography } from "@msaaqcom/abjad";

type CourseData = Array<Course> & {
  subRows?: CourseData[];
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});
export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency, formatPriceWithoutCurrency } = useFormatPrice();
  const [isTableEmpty, setIsTableEmpty] = useState<boolean>(false);
  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product } = useFetchProductQuery(productId as string);

  const { data: productStats = {} as ProductStats } = useFetchProductStatsQuery(productId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/products` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  return (
    <Layout title={product?.title}>
      <Layout.Container>
        <div className="mb-2 flex items-center justify-between pb-4">
          <Breadcrumbs className="overflow-y-hidden overflow-x-scroll whitespace-nowrap">
            <Link href="/">
              <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
            </Link>
            <Link href="/products">
              <Typography.Paragraph as="span">{t("products.title")}</Typography.Paragraph>
            </Link>
            <Typography.Paragraph
              as="span"
              className="text-gray-800"
            >
              {product?.title}
            </Typography.Paragraph>
          </Breadcrumbs>
          <Button
            as={Link}
            href={{
              pathname: "/products/[productId]/edit",
              query: { productId }
            }}
            variant="primary"
            children={t("products.edit_product")}
          />
        </div>
        <Grid
          columns={{
            lg: 3
          }}
        >
          <Grid.Cell
            columnSpan={{
              lg: 2
            }}
          >
            <Alert
              variant="info"
              dismissible
              actions={
                <>
                  <div className="flex items-center">
                    <Button
                      as="a"
                      target="_blank"
                      href="https://msaaq.com/%D8%AA%D8%B3%D9%88%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA-%D8%A7%D9%84%D8%B1%D9%82%D9%85%D9%8A%D8%A9/"
                      variant={"info"}
                      size="sm"
                      className={"ltr:mr-2 rtl:ml-2"}
                      children={t("read_this_guide")}
                    />
                    <Typography.Paragraph
                      size="md"
                      weight="normal"
                      children={t("learn_how_you_can_market_edu_content")}
                    />
                  </div>
                </>
              }
              className="mb-8 !border-gray !bg-white"
              title={t("products.alerts.how_to_market.title")}
              children={t("products.alerts.how_to_market.content")}
            />
            <ProductReviewsSection
              productId={productId as string}
              filters={{
                product_id: productId as string,
                has_replies: 0
              }}
              basePath="products"
            />
            <div className="mt-8 flex flex-col">
              <div className="flex flex-row items-center justify-between">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  size="md"
                  className="mb-2"
                >
                  {t("products.product_downloads")}
                </Typography.Paragraph>
                {isTableEmpty && (
                  <Button
                    as={Link}
                    href={`/products/${product.id}/downloads`}
                    variant="link"
                    size="sm"
                    children={t("products.product_downloads")}
                  />
                )}
              </div>
              <Datatable
                selectable={false}
                hasPagination={false}
                fetcher={useFetchProductDownloadsQuery}
                params={{
                  productId: product.id,
                  limit: 4
                }}
                setIsTableEmpty={setIsTableEmpty}
                columns={{
                  columns: ProductDownloadsCol,
                  props: {
                    sortables: [],
                    showRowActions: false
                  }
                }}
              />
            </div>
          </Grid.Cell>
          <Grid.Cell
            columnSpan={{
              lg: 1
            }}
          >
            <ProductDetailsCard product={product} />
            <ProductStatsCard
              className="mt-4"
              stats={productStats}
              statsItems={[
                {
                  icon: <CurrencyDollarIcon />,
                  title: t("earnings"),
                  data: {
                    key: formatCurrency(),
                    value: formatPriceWithoutCurrency(product.earnings)
                  }
                },
                {
                  icon: <ArrowDownTrayIcon />,
                  title: t("downloads"),
                  data: {
                    key: t("download"),
                    value: productStats?.downloads
                  }
                },
                {
                  icon: <StarIcon />,
                  title: t("reviews"),
                  data: {
                    key: t("review"),
                    value: productStats?.reviews
                  }
                }
              ]}
            />
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
