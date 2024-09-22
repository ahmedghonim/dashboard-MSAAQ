import { useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, DonutChart, EmptyStateTable, Layout, RangeDateInput } from "@/components";
import AnalyticsTabs from "@/components/shared/AnalyticsTabs";
import { useToast } from "@/components/toast";
import { useAppSelector, useDataExport, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchAnalyticsStatsQuery,
  useFetchMostVisitedQuery,
  useFetchSessionsPerCountryQuery,
  useFetchSessionsPerDeviceQuery,
  useFetchTopReferrersQuery
} from "@/store/slices/api/analyticsVisitsSlice";
import { useFetchAppQuery } from "@/store/slices/api/appsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { App, DateRangeType } from "@/types";

import { PencilIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Grid, Icon, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
    }
  };
};

export default function Visits() {
  const { t } = useTranslation();
  const [exportProducts] = useDataExport();
  const { data: app = {} as App } = useFetchAppQuery("google-analytics" as string);
  const router = useRouter();
  const [toast] = useToast();

  useEffect(() => {
    if (
      app &&
      app.fields?.find((field) => field.name == "property_id") &&
      app.fields?.find((field) => field.name == "property_id")?.value == null
    ) {
      router.push("/apps/google-analytics");
      toast.error({
        message: t("analytics.visits.please_select_property")
      });
    }
  }, [app]);

  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);
  const isGoogleAnalyticsInstalled = useMemo(
    () => installedApps.find((app) => app.slug === "google-analytics"),
    [installedApps]
  );
  const defaultRangeValue = {
    from: dayjs().subtract(6, "day").toDate(),
    formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    to: dayjs().toDate(),
    formatted_to: dayjs().format("YYYY-MM-DD")
  };

  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);

  const { formatRawPriceWithoutCurrency } = useFormatPrice();

  const handleExport = async () => {
    exportProducts({
      endpoint: "/dashboards/reports/analytics/export",
      name: "analytics",
      ids: [],
      payload: {
        from_date: range?.formatted_from,
        to_date: range?.formatted_to
      }
    });
  };

  const { data: statsData } = useFetchAnalyticsStatsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });
  const { data: sessionsPerCountry } = useFetchSessionsPerCountryQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });
  const { data: sessionsPerDevice } = useFetchSessionsPerDeviceQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: mostVisited } = useFetchMostVisitedQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });
  const { data: topReferrers } = useFetchTopReferrersQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  return (
    <Layout>
      <Head>
        <title>{t("analytics.visits.main")}</title>
      </Head>
      <AnalyticsTabs />

      <Layout.Container>
        {isGoogleAnalyticsInstalled?.installed ? (
          <Grid>
            <Grid.Cell>
              <div className="mb-6">
                <Grid
                  columns={{
                    md: 1,
                    lg: 2
                  }}
                  gap={{
                    xs: "1rem",
                    sm: "1rem",
                    md: "1rem",
                    lg: "1rem",
                    xl: "1rem"
                  }}
                >
                  <Grid.Cell>
                    <RangeDateInput
                      defaultValue={defaultRangeValue}
                      onChange={setRange}
                    />
                  </Grid.Cell>
                  <Grid.Cell className="flex ltr:ml-auto rtl:mr-auto print:hidden">
                    <Button
                      icon={
                        <Icon
                          size="sm"
                          children={<ArrowDownTrayIcon />}
                        />
                      }
                      onClick={() => handleExport()}
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
                      size="md"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      <Typography.Paragraph
                        size="md"
                        weight="medium"
                        children={t("print")}
                      />
                    </Button>
                  </Grid.Cell>
                </Grid>
              </div>

              <Grid
                className="mb-6"
                columns={{
                  sm: 1,
                  md: 2,
                  lg: 3
                }}
                gap={{
                  xs: "rem",
                  sm: "1rem",
                  md: "1rem",
                  lg: "1rem",
                  xl: "1rem"
                }}
              >
                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.users")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(Number(statsData?.data?.users ?? 0))}
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={t("user")}
                      />
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.page_views")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(Number(statsData?.data?.page_views ?? 0))}
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={t("once")}
                      />
                    </Typography.Heading>
                  </div>
                </Grid.Cell>

                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.active_users")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(Number(statsData?.data?.active_users ?? 0))}
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={t("user")}
                      />
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.sessions")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(Number(statsData?.data?.sessions ?? 0))}

                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={t("session")}
                      />
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.average_sessions")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {statsData?.data?.average_sessions
                        ? dayjs.duration(Number(statsData?.data?.average_sessions), "seconds").format("HH:mm:ss")
                        : "-"}
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      children={t("analytics.visits.bounce_rate")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={"%"}
                      />
                      {statsData?.data?.bounce_rate ? (Number(statsData?.data?.bounce_rate) * 100).toFixed(2) : "-"}
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
              </Grid>
              <Grid
                className="mb-6"
                columns={{
                  sm: 1,
                  md: 2
                }}
                gap={{
                  xs: "1rem",
                  sm: "1rem",
                  md: "1rem",
                  lg: "1rem",
                  xl: "1rem"
                }}
              >
                <Grid.Cell>
                  <Title
                    className="mb-2"
                    title={t("analytics.visits.sessions_per_country")}
                  />
                  {sessionsPerCountry?.data && sessionsPerCountry?.data?.countries.length > 0 ? (
                    <Card>
                      <Card.Body>
                        <DonutChart
                          data={sessionsPerCountry?.data.countries.slice(0, 4).map((item) => ({
                            label: item.country,
                            value: Number(item.total ?? 0)
                          }))}
                          tooltipMinWidth={320}
                          category="value"
                          dataKey="label"
                          variant="donut"
                          valueFormatter={(value) => formatRawPriceWithoutCurrency(Number(value))}
                          chartText={t("analytics.visits.total_sessions")}
                          valueSuffix={t("session")}
                        />
                      </Card.Body>
                    </Card>
                  ) : (
                    <EmptyStateTable
                      title={t("empty_state.no_data_title")}
                      content={t("empty_state.no_statistics_at_this_time")}
                      icon={<PencilIcon />}
                      className="py-9"
                    />
                  )}
                </Grid.Cell>
                <Grid.Cell>
                  <Title
                    className="mb-2"
                    title={t("analytics.visits.sessions_per_device")}
                  />
                  {sessionsPerDevice?.data && sessionsPerDevice?.data?.devices.length > 0 ? (
                    <Card>
                      <Card.Body>
                        <DonutChart
                          data={sessionsPerDevice?.data.devices.slice(0, 4).map((item) => ({
                            label: item.device,
                            value: Number(item.total ?? 0)
                          }))}
                          category="value"
                          dataKey="label"
                          variant="donut"
                          valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                          chartText={t("analytics.visits.total_sessions")}
                          valueSuffix={t("session")}
                        />
                      </Card.Body>
                    </Card>
                  ) : (
                    <EmptyStateTable
                      title={t("empty_state.no_data_title")}
                      content={t("empty_state.no_statistics_at_this_time")}
                      icon={<PencilIcon />}
                      className="py-9"
                    />
                  )}
                </Grid.Cell>
              </Grid>
              <Grid
                columns={{
                  sm: 1,
                  md: 2,
                  lg: 2
                }}
                gap={{
                  xs: "rem",
                  sm: "1rem",
                  md: "1rem",
                  lg: "1rem",
                  xl: "1rem"
                }}
              >
                {mostVisited?.data && mostVisited?.data?.length > 0 ? (
                  <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                    <div className="mb-4">
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        children={t("analytics.visits.most_visited_pages")}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      {mostVisited?.data.slice(0, 4)?.map((item, index) => (
                        <div
                          key={index}
                          className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4"
                        >
                          <Typography.Paragraph
                            as={"span"}
                            size="md"
                            children={item.most_visited_page}
                          />
                          <Badge
                            variant={"orange"}
                            rounded
                            soft
                            children={formatRawPriceWithoutCurrency(Number(item.total ?? 0))}
                          />
                        </div>
                      ))}
                    </div>
                  </Grid.Cell>
                ) : (
                  <EmptyStateTable
                    title={t("empty_state.no_data_title")}
                    content={t("empty_state.no_statistics_at_this_time")}
                    icon={<PencilIcon />}
                    className="py-9"
                  />
                )}
                {topReferrers?.data && topReferrers?.data?.length > 0 ? (
                  <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                    <div className="mb-4">
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        children={t("analytics.visits.top_referrers")}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      {topReferrers?.data.slice(0, 4)?.map((item, index) => (
                        <div
                          key={index}
                          className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4"
                        >
                          <Typography.Paragraph
                            as={"span"}
                            dir="auto"
                            size="md"
                            children={item.page_referrer == "" ? t("direct_referrer") : item.page_referrer}
                          />
                          <Badge
                            variant={"orange"}
                            rounded
                            soft
                            children={formatRawPriceWithoutCurrency(Number(item.total ?? 0))}
                          />
                        </div>
                      ))}
                    </div>
                  </Grid.Cell>
                ) : (
                  <EmptyStateTable
                    title={t("empty_state.no_data_title")}
                    content={t("empty_state.no_statistics_at_this_time")}
                    icon={<PencilIcon />}
                    className="py-9"
                  />
                )}
              </Grid>
            </Grid.Cell>
          </Grid>
        ) : (
          <EmptyStateTable
            title={t("empty_state.no_data_title")}
            content={t("analytics.visits.google_analytics_not_installed")}
            icon={<PencilIcon />}
            children={
              <Button
                as={Link}
                children={t("analytics.visits.add_google_analytics")}
                href={"/apps/google-analytics"}
              />
            }
            className="py-9"
          />
        )}
      </Layout.Container>
    </Layout>
  );
}
