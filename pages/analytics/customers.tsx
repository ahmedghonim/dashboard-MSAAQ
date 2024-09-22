import { useCallback, useEffect, useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import analyticsCustomersCol from "@/columns/analyticsCustomers";
import { Card, Datatable, EmptyStateTable, Layout, LineChart, RangeDateInput } from "@/components";
import MapChart from "@/components/charts/MapChart";
import { PriceWithShortCurrency } from "@/components/priceWithShortCurrency";
import AnalyticsTabs from "@/components/shared/AnalyticsTabs";
import { useDataExport, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchCustomersDataChartQuery,
  useFetchCustomersStatsQuery,
  useFetchMembersCountryQuery,
  useFetchMostMembersQuery
} from "@/store/slices/api/analyticsCutomersSlice";
import { DateRangeType, MemberDataChart } from "@/types";

import { ArrowDownTrayIcon, PencilIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
    }
  };
};

export interface Course {
  aggregate: number;
  date: string;
}

export interface Product {
  aggregate: number;
  date: string;
}
export interface DataObject {
  date: string;

  [key: string]: any;
}

export interface OptionsShape {
  data: DataObject[];
  hasPositiveAggregate: boolean;
}

export default function Customers() {
  const { t } = useTranslation();
  const [exportCustomers] = useDataExport();
  const defaultRangeValue = {
    from: dayjs().subtract(6, "day").toDate(),
    formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    to: dayjs().toDate(),
    formatted_to: dayjs().format("YYYY-MM-DD")
  };
  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);
  const [chartOptions, setChartOptions] = useState<OptionsShape>({} as OptionsShape);
  const { formatRawPriceWithoutCurrency, currentCurrencyLocalizeSymbol } = useFormatPrice();
  const handleExport = async () => {
    exportCustomers({
      endpoint: "/dashboards/reports/customers/export",
      name: "customers",
      ids: [],
      payload: {
        from_date: range?.formatted_from,
        to_date: range?.formatted_to
      }
    });
  };

  const { data: countriesData, isFetching: countryDataFetching } = useFetchMembersCountryQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: statsData } = useFetchCustomersStatsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: chartData, isFetching } = useFetchCustomersDataChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const makeDataObject = useCallback(
    (membersData?: MemberDataChart): DataObject => ({
      date: membersData
        ? `${dayjs(membersData.date).format("DD")} ${dayjs(membersData.date).format("MMMM")} ${dayjs(
            membersData.date
          ).format("YYYY")}`
        : "",
      date_without_year: membersData
        ? `${dayjs(membersData.date).format("DD")} ${dayjs(membersData.date).format("MMMM")}`
        : "",
      [t("analytics.customers.total_customers")]: membersData ? membersData.aggregate : 0
    }),
    []
  );

  const makeDataArray = useCallback(
    (members: MemberDataChart[]): OptionsShape => {
      const maxLength = Math.max(members.length);
      const hasPositiveAggregate = members.some((member) => member.aggregate > 0);

      return {
        data: Array.from({ length: maxLength }, (_, i) => makeDataObject(members[i])),
        hasPositiveAggregate
      };
    },
    [makeDataObject]
  );

  useEffect(() => {
    if (!isFetching && chartData?.data) {
      setChartOptions(makeDataArray(chartData.data.members));
    }
  }, [isFetching, range]);

  return (
    <Layout title={t("analytics.customers.main")}>
      <AnalyticsTabs />

      <Layout.Container>
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
              columns={{
                sm: 1,
                md: 2,
                lg: 3
              }}
              gap={{
                xs: "1rem",
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
                    children={t("analytics.customers.new_customers")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data?.enrollments ?? 0)}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t("client")}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.customers.total_students")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data?.students ?? 0)}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t("student")}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.customers.new_customers_from_coupons")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data?.members_coupon ?? 0)}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t("client")}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.customers.customer_satisfaction_rate")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data?.rating ?? 0)}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t("analytics.customers.stars")}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.customers.average_totals")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {<PriceWithShortCurrency price={Number(statsData?.data?.average_totals)} />}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.customers.average_orders")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data?.average_orders ?? 0)}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t("order")}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
            </Grid>
          </Grid.Cell>
          <Grid.Cell className="flex flex-col">
            <Title
              className="mb-2"
              title={t("analytics.customers.total_customers_map")}
            />
            <Card>
              <Card.Body>
                <MapChart data={countriesData?.data?.countries_data} />
              </Card.Body>
            </Card>
          </Grid.Cell>
          <Grid.Cell className="flex flex-col">
            <Title
              className="mb-2"
              title={t("analytics.customers.total_customers")}
            />
            <Card>
              <Card.Body>
                <LineChart
                  className="mt-6"
                  data={chartOptions.data}
                  dataKey="date"
                  xAxisDataKey="date_without_year"
                  minValue={chartOptions.hasPositiveAggregate ? undefined : 1000}
                  maxValue={chartOptions.hasPositiveAggregate ? undefined : 2000}
                  categories={[t("analytics.customers.total_customers")]}
                  valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                  showLegend={false}
                  yAxisWidth={40}
                  colors={["primary", "purple"]}
                />
              </Card.Body>
            </Card>
          </Grid.Cell>
          <Grid.Cell className="flex flex-col">
            <Title
              className="mb-2"
              title={t("analytics.customers.total_customers")}
            />
            <Card>
              <Card.Body>
                <LineChart
                  className="mt-6"
                  data={chartOptions.data}
                  dataKey="date"
                  xAxisDataKey="date_without_year"
                  minValue={chartOptions.hasPositiveAggregate ? undefined : 1000}
                  maxValue={chartOptions.hasPositiveAggregate ? undefined : 2000}
                  categories={[t("analytics.customers.total_customers")]}
                  valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                  showLegend={false}
                  yAxisWidth={40}
                  colors={["primary", "purple"]}
                />
              </Card.Body>
            </Card>
          </Grid.Cell>
          <Grid.Cell>
            <Typography.Paragraph
              as="span"
              size="md"
              weight="medium"
              className="mb-3 block"
              children={t("analytics.customers.most_demanding_clients")}
            />
            <Datatable
              columns={{
                columns: analyticsCustomersCol
              }}
              fetcher={useFetchMostMembersQuery}
              hasSearch={false}
              selectable={false}
              params={{
                from_date: range?.formatted_from,
                to_date: range?.formatted_to
              }}
              emptyState={
                <EmptyStateTable
                  title={t("empty_state.no_data_title")}
                  content={t("empty_state.no_statistics_at_this_time")}
                  icon={<PencilIcon />}
                />
              }
            />
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
