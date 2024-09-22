import { useCallback, useContext, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { getCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import bestSellingCoursesColumns from "@/columns/bestSellingCourses";
import OrdersCols from "@/columns/orders";
import { Card, Datatable, EmptyStateTable, Layout, LineChart, RangeDateInput } from "@/components";
import Ksa93Banner from "@/components/Ksa93Banner";
import { AuthContext } from "@/contextes";
import { useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchBestSellingProductsQuery,
  useFetchSalesDataChartQuery,
  useFetchStatsQuery
} from "@/store/slices/api/mainDashboardStatsSlice";
import { useFetchOrdersQuery } from "@/store/slices/api/ordersSlice";
import { Chart, DateRangeType, Stats } from "@/types";

import { CurrencyDollarIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { BanknotesIcon, ChatBubbleBottomCenterTextIcon, UserGroupIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
    }
  };
};

interface Course {
  aggregate: number;
  date: string;
}

interface Product {
  aggregate: number;
  date: string;
}

interface DataObject {
  date: string;

  [key: string]: any;
}

interface OptionsShape {
  data: DataObject[];
  hasPositiveAggregate: boolean;
}

const defaultRangeValue = {
  from: dayjs().subtract(6, "day").toDate(),
  formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  to: dayjs().toDate(),
  formatted_to: dayjs().format("YYYY-MM-DD")
};
export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const { hasPermission, user, current_academy } = useContext(AuthContext);
  const [isOrdersTableEmpty, setIsOrdersTableEmpty] = useState<boolean>(false);
  const [isBestSellingProductsTableEmpty, setIsBestSellingProductsTableEmpty] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionsShape>({} as OptionsShape);

  const { formatPriceWithoutCurrency, formatRawPriceWithoutCurrency, currentCurrencyLocalizeSymbol } = useFormatPrice();

  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);

  const {
    data: chartData = {} as {
      data: Chart;
    },
    isLoading,
    isFetching
  } = useFetchSalesDataChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const {
    data: statsData = {} as {
      data: Stats;
    }
  } = useFetchStatsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const makeDataObject = useCallback(
    (coursesData?: Course, productsData?: Product): DataObject => ({
      date: coursesData ? coursesData.date : productsData!.date,
      [t("products.title")]: productsData ? productsData.aggregate : 0,
      [t("courses.title")]: coursesData ? coursesData.aggregate : 0
    }),
    []
  );

  const makeDataArray = useCallback(
    (courses: Course[], products: Product[]): OptionsShape => {
      const maxLength = Math.max(courses.length, products.length);
      const hasPositiveAggregate =
        courses.some((course) => course.aggregate > 0) || products.some((product) => product.aggregate > 0);

      return {
        data: Array.from({ length: maxLength }, (_, i) => makeDataObject(courses[i], products[i])),
        hasPositiveAggregate
      };
    },
    [makeDataObject]
  );

  useEffect(() => {
    if (!isFetching && chartData.data) {
      setOptions(makeDataArray(chartData.data.courses, chartData.data.products));
    }
  }, [isFetching, range]);

  useEffect(() => {
    if (current_academy && current_academy.onboarding_tasks_status == "in_progress" && !getCookie("is_onboarding")) {
      router.push("/checklist");
    }
  }, []);

  return (
    <Layout title={t("sidebar.main")}>
      <Layout.Container>
        <Ksa93Banner />

        <Grid>
          <Grid.Cell>
            <RangeDateInput
              defaultValue={defaultRangeValue}
              onChange={setRange}
            />
            <div className="flex flex-col">
              <Grid
                columns={{
                  md: 3,
                  lg: 4,
                  sm: 2
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
                  <div className="mb-6 flex items-center justify-between">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      children={t("orders.title")}
                    />
                    <Icon
                      size="lg"
                      className="text-orange-500"
                    >
                      <CurrencyDollarIcon />
                    </Icon>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(statsData?.data?.orders)}
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
                  <div className="mb-6 flex items-center justify-between">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      children={t("students.title")}
                    />
                    <Icon
                      size="lg"
                      className="text-orange-500"
                    >
                      <UserGroupIcon />
                    </Icon>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(statsData?.data?.members)}
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

                {user.roles &&
                  user.roles.some((r) => ["super-admin", "general_manager", "financial_manager"].includes(r.name)) && (
                    <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <Typography.Paragraph
                          as="span"
                          size="md"
                          weight="medium"
                          children={t("profits")}
                        />
                        <Icon
                          size="lg"
                          className="text-orange-500"
                        >
                          <BanknotesIcon />
                        </Icon>
                      </div>
                      <div className="flex items-center justify-between">
                        <Typography.Heading
                          as="h3"
                          size="sm"
                          weight="bold"
                        >
                          {formatPriceWithoutCurrency(statsData?.data?.revenue)}
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
                  )}

                <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      children={t("comments")}
                    />
                    <Icon
                      size="lg"
                      className="text-orange-500"
                    >
                      <ChatBubbleBottomCenterTextIcon />
                    </Icon>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography.Heading
                      as="h3"
                      size="sm"
                      weight="bold"
                    >
                      {formatRawPriceWithoutCurrency(statsData?.data?.comments)}
                      <Typography.Paragraph
                        as="span"
                        size="md"
                        weight="medium"
                        className="mr-2.5 text-gray-700"
                        children={t("comment")}
                      />
                    </Typography.Heading>
                  </div>
                </Grid.Cell>
              </Grid>
            </div>
          </Grid.Cell>
          <Grid.Cell className="flex flex-col">
            <Card>
              <Card.Body>
                {!isLoading && (
                  <LineChart
                    data={options.data}
                    dataKey="date"
                    minValue={options.hasPositiveAggregate ? undefined : 1000}
                    maxValue={options.hasPositiveAggregate ? undefined : 2000}
                    valueFormatter={(value) => {
                      return formatPriceWithoutCurrency(value);
                    }}
                    categories={[t("courses.title"), t("products.title")]}
                    colors={["orange", "purple"]}
                  />
                )}
              </Card.Body>
            </Card>
          </Grid.Cell>
          <Grid.Cell>
            <Grid
              columns={{
                md: hasPermission("orders.view") ? 2 : 1,
                sm: 1
              }}
              gap={{
                xs: "1rem"
              }}
            >
              <Grid.Cell className="flex flex-col">
                <div className="mb-2 flex flex-row items-center justify-between">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    weight="medium"
                    children={t("courses.best_selling")}
                  />
                  {isBestSellingProductsTableEmpty && (
                    <Button
                      as={Link}
                      href={`/courses`}
                      variant="link"
                      size="sm"
                      children={t("courses.view_all_courses")}
                    />
                  )}
                </div>
                <Datatable
                  columns={{
                    columns: bestSellingCoursesColumns,
                    props: {
                      columns: ["title", "price"]
                    }
                  }}
                  fetcher={useFetchBestSellingProductsQuery}
                  hasSearch={false}
                  hasFilter={false}
                  selectable={false}
                  hasPagination={false}
                  setIsTableEmpty={setIsBestSellingProductsTableEmpty}
                  params={{
                    type: "course",
                    limit: 4,
                    from_date: range?.formatted_from,
                    to_date: range?.formatted_to
                  }}
                  emptyState={
                    <EmptyStateTable
                      title={t("empty_state.no_data_title")}
                      content={t("empty_state.no_data_description")}
                      icon={<ExclamationTriangleIcon />}
                    />
                  }
                />
              </Grid.Cell>

              {hasPermission("orders.view") && (
                <Grid.Cell className="flex flex-col">
                  <div className="mb-2 flex flex-row items-center justify-between">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      children={t("new_orders")}
                    />
                    {isOrdersTableEmpty && (
                      <Button
                        as={Link}
                        href={`/orders`}
                        variant="link"
                        size="sm"
                        children={t("orders.view_all_orders")}
                      />
                    )}
                  </div>
                  <Datatable
                    columns={{
                      columns: OrdersCols,
                      props: {
                        columns: ["id", "member", "total"]
                      }
                    }}
                    fetcher={useFetchOrdersQuery}
                    hasSearch={false}
                    hasFilter={false}
                    selectable={false}
                    hasPagination={false}
                    setIsTableEmpty={setIsOrdersTableEmpty}
                    params={{
                      only_with: ["member"],
                      per_page: 4,
                      filters: {
                        from_date: range?.formatted_from,
                        to_date: range?.formatted_to
                      }
                    }}
                    emptyState={
                      <EmptyStateTable
                        title={t("empty_state.no_data_title")}
                        content={t("empty_state.no_data_description")}
                        icon={<ExclamationTriangleIcon />}
                      />
                    }
                  />
                </Grid.Cell>
              )}
            </Grid>
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
