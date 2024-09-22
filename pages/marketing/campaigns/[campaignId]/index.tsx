import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SendCols from "@/columns/sends";
import { Datatable, Layout } from "@/components";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCampaignQuery, useFetchSendsQuery } from "@/store/slices/api/campaignsSlice";
import { Campaign } from "@/types";
import { classNames } from "@/utils";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Grid, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Edit() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    query: { campaignId }
  } = router;
  const { data: campaign = {} as Campaign, isLoading } = useFetchCampaignQuery(campaignId as string);
  return (
    <Layout title={campaign?.name}>
      <Layout.Container>
        <Typography.Paragraph
          className="mb-4 !text-xl !font-semibold"
          children={t("marketing.campaigns.campaign_data")}
        />
        <Grid
          className="mb-6"
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
                children={t(`analytics.campaigns.recipient_count`)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Typography.Heading
                as="h3"
                size="sm"
                weight="bold"
              >
                {campaign?.recipient_count ?? 0}
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.recipient_count_label`)}
                />
              </Typography.Heading>
            </div>
          </Grid.Cell>
          <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
            <div className="mb-6">
              <Typography.Paragraph
                as="span"
                size="md"
                children={t(`analytics.campaigns.field_count`)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Typography.Heading
                as="h3"
                size="sm"
                weight="bold"
              >
                {campaign?.failed_count ?? 0}
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.field_count_label`)}
                />
              </Typography.Heading>
            </div>
          </Grid.Cell>
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
                className={classNames("flex flex-row-reverse items-center")}
              >
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.open_rate_label`)}
                />
                {campaign?.open_rate ? Number(campaign?.open_rate) / 100 : "ــــــ"}
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
                className={classNames("flex flex-row-reverse items-center")}
              >
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.click_rate_label`)}
                />
                {campaign?.click_rate ? Number(campaign?.click_rate) / 100 : "ــــــ"}
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
                className={classNames("flex flex-row-reverse items-center")}
              >
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.bounce_rate_label`)}
                />
                {campaign?.bounce_rate ? Number(campaign?.bounce_rate) / 100 : "ــــــ"}
              </Typography.Heading>
            </div>
          </Grid.Cell>
          <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <Typography.Paragraph
                as="span"
                size="md"
                children={t(`analytics.campaigns.unsubscribe_rate`)}
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
                className={classNames("flex flex-row-reverse items-center")}
              >
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  className="mr-2.5 text-gray-700"
                  children={t(`analytics.campaigns.rate_label`)}
                />
                {campaign?.unsubscribe_rate ? Number(campaign?.unsubscribe_rate) / 100 : "ــــــ"}
              </Typography.Heading>
            </div>
          </Grid.Cell>
        </Grid>
        <Datatable
          hasSearch
          hasFilter
          fetcher={useFetchSendsQuery}
          columns={{
            columns: SendCols,
            props: {
              campaignId: campaignId
            }
          }}
          toolbarTitle={
            <Typography.Paragraph className="ml-1 text-xl !font-semibold">
              {t("marketing.campaigns.sends.clients")}
            </Typography.Paragraph>
          }
          toolbar={() => {}}
        />
      </Layout.Container>
    </Layout>
  );
}
