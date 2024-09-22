import { useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout, RangeDateInput } from "@/components";
import AnalyticsTabs from "@/components/shared/AnalyticsTabs";
import { useDataExport } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCampaignsStatsQuery } from "@/store/slices/api/analyticsCampaigns";
import { DateRangeType } from "@/types";

import { ArrowDownTrayIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

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

  const handleExport = async () => {
    exportCustomers({
      endpoint: "/dashboards/reports/campaigns/export",
      name: "campaigns",
      ids: [],
      payload: {
        from_date: range?.formatted_from,
        to_date: range?.formatted_to
      }
    });
  };

  const { data: statsData } = useFetchCampaignsStatsQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  return (
    <Layout title={t("analytics.campaigns.main")}>
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
              className="mb-4"
              columns={{
                sm: 1,
                md: 1,
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
                    children={t(`analytics.campaigns.newsletter_subscribed_count`)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {statsData?.data.newsletter_subscribed_count}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.newsletter_subscribed_count_label`)}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.newsletter_unsubscribed_count`)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {statsData?.data.newsletter_unsubscribed_count}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.newsletter_unsubscribed_count_label`)}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.sent_campaigns_count`)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                  >
                    {statsData?.data.sent_campaigns_count}
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.sent_campaigns_count_label`)}
                    />
                  </Typography.Heading>
                </div>
              </Grid.Cell>
            </Grid>
            <Grid
              columns={{
                sm: 1,
                md: 2,
                lg: 4
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
                <div className="mb-6 flex items-center gap-2">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.open_rate`)}
                  />
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon>
                        <ExclamationCircleIcon className="text-gray-600" />
                      </Icon>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t(`analytics.campaigns.open_rate_tooltip`)}</Tooltip.Content>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                    className="flex flex-row-reverse items-center"
                  >
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.open_rate_label`)}
                    />
                    {statsData?.data?.open_rate ? Number(statsData?.data?.open_rate) / 100 : "ــــــ"}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.click_rate`)}
                  />
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon>
                        <ExclamationCircleIcon className="text-gray-600" />
                      </Icon>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t(`analytics.campaigns.click_rate_tooltip`)}</Tooltip.Content>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                    className="flex flex-row-reverse items-center"
                  >
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.click_rate_label`)}
                    />
                    {statsData?.data?.click_rate ? Number(statsData?.data?.click_rate) / 100 : "ــــــ"}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.rate`)}
                  />
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon>
                        <ExclamationCircleIcon className="text-gray-600" />
                      </Icon>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t(`analytics.campaigns.rate_tooltip`)}</Tooltip.Content>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                    className="flex flex-row-reverse items-center"
                  >
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.rate_label`)}
                    />
                    {statsData?.data?.unsubscribe_rate ? Number(statsData?.data?.unsubscribe_rate) / 100 : "ــــــ"}
                  </Typography.Heading>
                </div>
              </Grid.Cell>

              <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    children={t(`analytics.campaigns.bounce_rate`)}
                  />
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon>
                        <ExclamationCircleIcon className="text-gray-600" />
                      </Icon>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t(`analytics.campaigns.bounce_rate_tooltip`)}</Tooltip.Content>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-between">
                  <Typography.Heading
                    as="h3"
                    size="sm"
                    weight="bold"
                    className="flex flex-row-reverse items-center"
                  >
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      className="mr-2.5 text-gray-700"
                      children={t(`analytics.campaigns.bounce_rate_label`)}
                    />
                    {statsData?.data?.bounce_rate ? Number(statsData?.data?.bounce_rate) / 100 : "ــــــ"}
                  </Typography.Heading>
                </div>
              </Grid.Cell>
            </Grid>
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
