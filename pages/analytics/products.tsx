import { useCallback, useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import analyticsProductsCol from "@/columns/analyticsProducts";
import { Card, Datatable, DonutChart, EmptyStateTable, Layout, RangeDateInput } from "@/components";
import FilterGroup from "@/components/filter-group";
import AnalyticsTabs from "@/components/shared/AnalyticsTabs";
import { useDataExport, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchCoursesAndProductsReportQuery,
  useFetchTopSellingProductsQuery
} from "@/store/slices/api/analyticsProductsSlice";
import { DateRangeType } from "@/types";

import { PencilIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
    }
  };
};

export default function Products() {
  const { t } = useTranslation();
  const [exportProducts] = useDataExport();
  const defaultRangeValue = {
    from: dayjs().subtract(6, "day").toDate(),
    formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    to: dayjs().toDate(),
    formatted_to: dayjs().format("YYYY-MM-DD")
  };

  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);

  const categories = ["courses", "digital", "bundle", "coaching_session"];
  const [filterCategory, setCategory] = useState<string>("courses");
  const { formatRawPriceWithoutCurrency } = useFormatPrice();
  const onCategoryClick = useCallback(async (category: string) => {
    setCategory(category);
  }, []);

  const handleExport = async () => {
    exportProducts({
      endpoint: "/dashboards/reports/products/export",
      name: "products",
      ids: [],
      payload: {
        from_date: range?.formatted_from,
        to_date: range?.formatted_to
      }
    });
  };

  const { data: chartData } = useFetchTopSellingProductsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  return (
    <Layout title={t("analytics.products.main")}>
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
                <Title
                  className="mb-2"
                  title={t("courses.best_selling")}
                />
                {chartData?.courses && chartData.courses.length > 0 ? (
                  <Card>
                    <Card.Body>
                      <DonutChart
                        data={chartData.courses}
                        category="value"
                        dataKey="label"
                        variant="donut"
                        valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                        chartText={t("analytics.products.total_students")}
                        valueSuffix={t("student")}
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
                  title={t("best_selling_products")}
                />
                {chartData?.products && chartData.products.length > 0 ? (
                  <Card>
                    <Card.Body>
                      <DonutChart
                        data={chartData.products}
                        category="value"
                        dataKey="label"
                        variant="donut"
                        valueFormatter={(value) => formatRawPriceWithoutCurrency(value)}
                        chartText={t("analytics.products.total_selling")}
                        valueSuffix={t("order")}
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
          </Grid.Cell>
          <Grid.Cell>
            <div className="mb-4 flex items-center gap-4">
              <Typography.Paragraph
                as="span"
                size="lg"
                weight="medium"
                className="text-xl !font-semibold"
                children={t("analytics.main")}
              />
              <FilterGroup
                current_value={filterCategory}
                filters={categories.map((category, index) => ({
                  key: category,
                  title: t(`analytics.products.tabs.${category}`),
                  actions: {
                    onClick: () => {
                      onCategoryClick(category);
                    }
                  }
                }))}
              />
            </div>
            <Datatable
              columns={{
                columns: analyticsProductsCol
              }}
              fetcher={useFetchCoursesAndProductsReportQuery}
              hasSearch={false}
              selectable={false}
              params={{
                type: filterCategory,
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
              scrollOnRouteChange={false}
            />
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
