import { useCallback, useContext, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Image from "next/image";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import {
  AddonController,
  BarChart,
  Card,
  DonutChart,
  EmptyStateTable,
  Layout,
  LineChart,
  RangeDateInput
} from "@/components";
import { PriceWithShortCurrency } from "@/components/priceWithShortCurrency";
import AnalyticsTabs from "@/components/shared/AnalyticsTabs";
import { AuthContext } from "@/contextes";
import { useDataExport, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchEarningsStatsQuery,
  useFetchOrdersDataChartQuery,
  useFetchSalesDataChartQuery,
  useFetchTopDaysChartQuery,
  useFetchTopSourcesChartQuery
} from "@/store/slices/api/analyticsEarningsSlice";
import { DateRangeType, OrderChart } from "@/types";

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

export default function Earnings() {
  const { t } = useTranslation();
  const [exportOrders] = useDataExport();
  const defaultRangeValue = {
    from: dayjs().subtract(6, "day").toDate(),
    formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    to: dayjs().toDate(),
    formatted_to: dayjs().format("YYYY-MM-DD")
  };
  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);
  const [salesChartOptions, setSalesChartOptions] = useState<OptionsShape>({} as OptionsShape);
  const [ordersChartOptions, setOrdersChartOptions] = useState<OptionsShape>({} as OptionsShape);
  const { formatPriceWithoutCurrency, formatRawPriceWithoutCurrency, currentCurrencyLocalizeSymbol } = useFormatPrice();
  const [barChartData, setBarChartData] = useState<any[] | undefined>([]);

  const { current_academy } = useContext(AuthContext);
  const handleExport = async () => {
    exportOrders({
      endpoint: "/dashboards/reports/orders/export",
      name: "orders",
      ids: [],
      payload: {
        from_date: range?.formatted_from,
        to_date: range?.formatted_to
      }
    });
  };

  const { data: statsData } = useFetchEarningsStatsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: salesChartData, isFetching: salesIsFetching } = useFetchSalesDataChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: ordersChartData, isFetching: ordersIsFetching } = useFetchOrdersDataChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: topDaysChartData, isFetching: topDaysIsFetching } = useFetchTopDaysChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { data: topSourcesChartData, isFetching: topSourseIsFetching } = useFetchTopSourcesChartQuery({
    limit: 4,
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });
  const makeDataObject = useCallback(
    (coursesData?: Course, productsData?: Product, ordersData?: OrderChart): DataObject => ({
      date: coursesData
        ? `${dayjs(coursesData.date).format("DD")} ${dayjs(coursesData.date).format("MMMM")} ${dayjs(
            coursesData.date
          ).format("YYYY")}`
        : productsData
        ? `${dayjs(productsData.date).format("DD")} ${dayjs(productsData.date).format("MMMM")} ${dayjs(
            productsData.date
          ).format("YYYY")} `
        : `${dayjs(ordersData?.date).format("DD")} ${dayjs(ordersData!.date).format("MMMM")} ${dayjs(
            ordersData?.date
          ).format("YYYY")}`,
      date_without_year: coursesData
        ? `${dayjs(coursesData.date).format("DD")} ${dayjs(coursesData.date).format("MMMM")}`
        : productsData
        ? `${dayjs(productsData.date).format("DD")} ${dayjs(productsData.date).format("MMMM")}`
        : `${dayjs(ordersData?.date).format("DD")} ${dayjs(ordersData?.date).format("MMMM")}`,
      [t("products.title")]: productsData ? productsData.aggregate * 0.01 : 0,
      [t("courses.title")]: coursesData ? coursesData.aggregate * 0.01 : 0,
      [t("analytics.earnings.orders_statistics")]: ordersData ? ordersData.aggregate : 0
    }),
    []
  );

  const makeDataArray = useCallback(
    (courses: Course[], products: Product[], orders: OrderChart[]): OptionsShape => {
      const maxLength = Math.max(courses.length, products.length, orders.length);
      const hasPositiveAggregate =
        courses.some((course) => course.aggregate > 0) ||
        products.some((product) => product.aggregate > 0) ||
        orders.some((order) => order.aggregate > 0);

      return {
        data: Array.from({ length: maxLength }, (_, i) => makeDataObject(courses[i], products[i], orders[i])),
        hasPositiveAggregate
      };
    },
    [makeDataObject]
  );

  const formatBarChartDataArray = useCallback(() => {
    const weekDays: { count: number; day: string }[] = [
      {
        count: 0,
        day: "Friday"
      },
      {
        count: 0,
        day: "Thursday"
      },
      {
        count: 0,
        day: "Wednesday"
      },
      {
        count: 0,
        day: "Tuesday"
      },
      {
        count: 0,
        day: "Monday"
      },
      {
        count: 0,
        day: "Sunday"
      },
      {
        count: 0,
        day: "Saturday"
      }
    ];
    const mergedArray = weekDays.map((dayObj) => {
      const matchingData = topDaysChartData?.data.find((item) => item.day === dayObj.day);
      for (const key in dayObj) {
        return {
          ...dayObj,
          [t(`analytics.earnings.${key}`)]: matchingData?.count,
          day: t(`weekdays.${dayObj.day}`)
        };
      }
    });

    return mergedArray;
  }, [topDaysChartData]);

  useEffect(() => {
    if (!salesIsFetching && salesChartData?.data) {
      setSalesChartOptions(makeDataArray(salesChartData.data.courses, salesChartData.data.products, []));
    }
    if (!ordersIsFetching && ordersChartData?.data) {
      setOrdersChartOptions(makeDataArray([], [], ordersChartData.data.orders));
    }
    if (!topDaysIsFetching && topDaysChartData?.data) {
      setBarChartData(formatBarChartDataArray);
    }
  }, [salesIsFetching, range, ordersIsFetching, topDaysIsFetching]);

  useEffect(() => {
    setBarChartData(formatBarChartDataArray);
  }, [topDaysChartData]);
  return (
    <Layout title={t("analytics.earnings.main")}>
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
            >
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.earnings.total_orders")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {formatRawPriceWithoutCurrency(statsData?.data.orders ?? 0)}
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
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.earnings.total_sales")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {<PriceWithShortCurrency price={Number(statsData?.data?.earnings)} />}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t("analytics.earnings.average_cart")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {<PriceWithShortCurrency price={Number(statsData?.data?.average_orders)} />}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
            </Grid>
          </Grid.Cell>
          <Grid
            columns={{
              sm: 1,
              md: 2,
              lg: 2
            }}
          >
            <Grid.Cell>
              <div className="flex h-full w-full flex-col">
                <Title
                  className="mb-2"
                  title={t("analytics.earnings.payment_methods_selling")}
                />
                {statsData?.data && statsData?.data.payment_methods?.length > 0 ? (
                  <Card className="h-full">
                    <AddonController
                      addon={"analytics.source"}
                      className="!mb-0"
                    >
                      <Card.Body>
                        <DonutChart
                          data={statsData?.data.payment_methods.map((item) => ({
                            label: (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex-shrink-0">{t(`payment_methods.${item.label}`)}</span>
                                {item.label == "Card" && (
                                  <Image
                                    src={"/images/cards.svg"}
                                    width={80}
                                    height={50}
                                    alt="cards"
                                  />
                                )}
                                {item.label == "Bank Transfer" && (
                                  <Image
                                    src={"/images/transfer.svg"}
                                    width={16}
                                    height={16}
                                    alt="transfer"
                                  />
                                )}
                                {item.label == "Paypal" && (
                                  <Image
                                    src={"/images/paypal.png"}
                                    width={16}
                                    height={16}
                                    alt="paypal"
                                  />
                                )}
                              </div>
                            ),
                            value: item.value
                          }))}
                          category="value"
                          dataKey="label"
                          variant="donut"
                          chartText={t("analytics.earnings.total")}
                        />
                      </Card.Body>
                    </AddonController>
                  </Card>
                ) : (
                  <EmptyStateTable
                    title={t("empty_state.no_data_title")}
                    content={t("empty_state.no_statistics_at_this_time")}
                    icon={<PencilIcon />}
                    className="py-9"
                  />
                )}
              </div>
            </Grid.Cell>
            <Grid.Cell>
              <div className="flex h-full w-full flex-col gap-4">
                <Card>
                  <Card.Body>
                    <div className="mb-6">
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        children={t("analytics.earnings.average_orders")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography.Heading
                        as="h3"
                        size="sm"
                        weight="bold"
                      >
                        {formatRawPriceWithoutCurrency(statsData?.data.average_items ?? 0)}
                        <Typography.Paragraph
                          as="span"
                          size="md"
                          weight="medium"
                          className="mr-2.5 text-gray-700"
                          children={t("order")}
                        />
                      </Typography.Heading>
                    </div>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <div className="mb-6">
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        children={t("analytics.earnings.average_coupons")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography.Heading
                        as="h3"
                        size="sm"
                        weight="bold"
                      >
                        {statsData?.data.coupons ?? 0}
                        <Typography.Paragraph
                          as="span"
                          size="md"
                          weight="medium"
                          className="mr-2.5 text-gray-700"
                          children={t("analytics.earnings.coupon")}
                        />
                      </Typography.Heading>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Grid.Cell>
          </Grid>
          <Grid.Cell className="flex h-full flex-col">
            <Title
              className="mb-2"
              title={`${t("analytics.earnings.sales_statistics", { academy_currency: current_academy.currency })}`}
            />
            <Card>
              <Card.Body>
                <LineChart
                  className="mt-6"
                  data={salesChartOptions.data}
                  dataKey="date"
                  xAxisDataKey="date_without_year"
                  minValue={salesChartOptions.hasPositiveAggregate ? undefined : 1000}
                  maxValue={salesChartOptions.hasPositiveAggregate ? undefined : 2000}
                  categories={[t("analytics.earnings.courses"), t("analytics.earnings.digital_products")]}
                  valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                  yAxisWidth={40}
                  colors={["success", "purple"]}
                />
              </Card.Body>
            </Card>
          </Grid.Cell>

          <Grid.Cell>
            <Grid
              columns={{
                lg: 2,
                md: 1
              }}
            >
              <Grid.Cell>
                <Title
                  className="mb-2"
                  title={t("analytics.earnings.the_most_requested_days")}
                />
                {topDaysChartData?.data && topDaysChartData?.data?.length > 0 ? (
                  <Card>
                    <AddonController
                      addon={"analytics.most-ordering-days"}
                      className="!mb-0"
                    >
                      <Card.Body className="py-0">
                        <BarChart
                          className="w-full pb-3"
                          data={barChartData as any[]}
                          dataKey="day"
                          categories={[t("analytics.earnings.count")]}
                          showLegend={false}
                          showTooltip={true}
                          showGridLines={false}
                          maxValue={Math.max(...topDaysChartData.data.map((item) => item.count)) < 4 ? 4 : undefined}
                          valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                          stack={true}
                          radius={3}
                          colors={["purple"]}
                        />
                      </Card.Body>
                    </AddonController>
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
                  title={t("analytics.earnings.selling_sources")}
                />
                {topSourcesChartData?.data && topSourcesChartData?.data?.length > 0 ? (
                  <Card>
                    <AddonController
                      addon={"analytics.source"}
                      className="!mb-0"
                    >
                      <Card.Body>
                        <DonutChart
                          data={topSourcesChartData?.data}
                          category="value"
                          dataKey="label"
                          variant="donut"
                          chartText={t("analytics.earnings.referrals_total")}
                          valueSuffix={t("analytics.earnings.referral")}
                          valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                        />
                      </Card.Body>
                    </AddonController>
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
          </Grid.Cell>
          <Grid.Cell className="flex flex-col">
            <Title
              className="mb-2"
              title={t("analytics.earnings.orders_statistics")}
            />
            <Card>
              <Card.Body>
                <LineChart
                  className="mt-6"
                  data={ordersChartOptions.data}
                  dataKey="date"
                  xAxisDataKey="date_without_year"
                  minValue={ordersChartOptions.hasPositiveAggregate ? undefined : 1000}
                  maxValue={ordersChartOptions.hasPositiveAggregate ? undefined : 2000}
                  categories={[t("analytics.earnings.orders_statistics")]}
                  valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                  showLegend={false}
                  colors={["orange"]}
                />
              </Card.Body>
            </Card>
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
