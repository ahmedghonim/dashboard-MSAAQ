import { useContext, useEffect } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import ProductDetailsCard from "@/components/cards/ProductDetailsCard";
import ProductStatsCard from "@/components/cards/ProductStatsCard";
import ProductReviewsSection from "@/components/shared/products/ProductReviewsSection";
import { AuthContext } from "@/contextes";
import { durationParser, useAppDispatch, useFormatPrice } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useFetchProductStatsQuery } from "@/store/slices/api/productsSlice";
import { Product, ProductStats } from "@/types";
import { Permissions } from "@/types/models/permission";

import { ClockIcon, CurrencyDollarIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";

import { Alert, Breadcrumbs, Button, Grid, Typography } from "@msaaqcom/abjad";

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

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product } = useFetchProductQuery(productId as string);
  const { data: productStats = {} as ProductStats } = useFetchProductStatsQuery(productId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/coaching-sessions` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  const { hasPermission } = useContext(AuthContext);

  return (
    <Layout title={product?.title}>
      <Layout.Container>
        <div className="mb-2 flex items-center justify-between pb-4">
          <Breadcrumbs className="overflow-y-hidden overflow-x-scroll whitespace-nowrap">
            <Link href="/">
              <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
            </Link>
            <Link href="/coaching-sessions">
              <Typography.Paragraph as="span">{t("coaching_sessions.title")}</Typography.Paragraph>
            </Link>
            <Typography.Paragraph
              as="span"
              className="text-gray-800"
            >
              {product?.title}
            </Typography.Paragraph>
          </Breadcrumbs>
          {hasPermission(Permissions.COACHING_SESSIONS.UPDATE) && (
            <Button
              as={Link}
              href={{
                pathname: "/coaching-sessions/[productId]/edit",
                query: { productId }
              }}
              variant="primary"
              children={t("coaching_sessions.edit_session")}
            />
          )}
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
              title={t("coaching_sessions.alerts.how_to_market.title")}
              children={t("coaching_sessions.alerts.how_to_market.content")}
            />
            <ProductReviewsSection
              filters={{
                product_id: productId as string,
                has_replies: 0
              }}
              productId={productId as string}
              basePath="coaching-sessions"
            />
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
                  icon: <UserIcon />,
                  title: t("coaching_sessions.bookings_count"),
                  data: {
                    key: t("coaching_sessions.booking_singular"),
                    value: productStats?.appointments
                  }
                },
                {
                  icon: <StarIcon />,
                  title: t("reviews"),
                  data: {
                    key: t("review"),
                    value: productStats?.reviews
                  }
                },
                {
                  icon: <ClockIcon />,
                  title: t("coaching_sessions.coaching_duration"),
                  data: {
                    key: t("coaching_sessions.minute"),
                    value: durationParser(Number(product?.options?.duration), "minute")
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
