import { useEffect } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CouponUsesCols from "@/columns/couponUses";
import { Datatable, Layout } from "@/components";
import { useAppDispatch, useDataExport, useFormatPrice } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchCouponQuery,
  useFetchCouponStatsQuery,
  useFetchCouponUsesQuery
} from "@/store/slices/api/couponsSlice";
import { Coupon } from "@/types/models/coupon";

import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const router = useRouter();
  const {
    query: { couponId }
  } = router;

  const { data: coupon = {} as Coupon } = useFetchCouponQuery(couponId as string);
  const {
    data: statsData = {
      data: {
        members_count: 0,
        uses_count: 0,
        sales: 0
      }
    }
  } = useFetchCouponStatsQuery({
    couponId: couponId as string
  });
  const { formatPriceWithoutCurrency, currentCurrencyLocalizeSymbol } = useFormatPrice();

  const [exportCouponUses] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportCouponUses({
      endpoint: `/coupons/${couponId}/uses/export`,
      name: `coupon-stats-${coupon.id}`,
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/marketing/coupons` });
    dispatch({ type: "app/setTitle", payload: t("marketing.coupons.stats.title", { code: coupon?.code }) });
  }, [coupon]);

  return (
    <Layout title={t("marketing.coupons.stats.title", { code: coupon?.code })}>
      <Layout.Container>
        <Grid
          className="mb-6"
          columns={{
            sm: 1,
            md: 2,
            lg: 3
          }}
        >
          <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
            <div className="mb-6">
              <Typography.Paragraph
                as="span"
                size="md"
                children={t("marketing.coupons.total_customers")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Typography.Heading
                as="h3"
                size="sm"
                weight="bold"
              >
                {statsData?.data?.members_count > 0 ? statsData?.data?.members_count : "-"}
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t("marketing.coupons.customer")}
                />
              </Typography.Heading>
            </div>
          </Grid.Cell>
          <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
            <div className="mb-6">
              <Typography.Paragraph
                as="span"
                size="md"
                children={t("marketing.coupons.total_uses")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Typography.Heading
                as="h3"
                size="sm"
                weight="bold"
              >
                {statsData?.data?.uses_count > 0 ? statsData?.data?.uses_count : "-"}

                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t("marketing.coupons.times")}
                />
              </Typography.Heading>
            </div>
          </Grid.Cell>
          <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
            <div className="mb-6">
              <Typography.Paragraph
                as="span"
                size="md"
                children={t("marketing.coupons.coupon_sales")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Typography.Heading
                as="h3"
                size="sm"
                weight="bold"
              >
                {statsData?.data.sales > 0 ? formatPriceWithoutCurrency(statsData?.data.sales as number) : "-"}

                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={currentCurrencyLocalizeSymbol}
                />
              </Typography.Heading>
            </div>
          </Grid.Cell>
        </Grid>
        <Datatable
          fetcher={useFetchCouponUsesQuery}
          columns={{
            columns: CouponUsesCols,
            props: {
              couponId
            }
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
              <Button
                variant="primary"
                outline
                size="md"
                onClick={() => {
                  router.push(`/marketing/coupons/${couponId}/edit`);
                }}
              >
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                >
                  <Trans i18nKey="marketing.coupons.edit_coupon">Edit Coupon</Trans>
                </Typography.Paragraph>
              </Button>
            </>
          )}
        />
      </Layout.Container>
    </Layout>
  );
}
