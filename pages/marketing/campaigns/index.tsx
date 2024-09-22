import { useContext, useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CampaignCols from "@/columns/campaigns";
import { CreateNewModal, Datatable, EmptyStateTable, Layout } from "@/components";
import PlanBanner from "@/components/campaigns/PlanBanner";
import FilterGroup from "@/components/filter-group";
import ProgressRing from "@/components/progress/ProgressRing";
import { SubscriptionContext } from "@/contextes";
import { GTM_EVENTS, useDataExport, useGTM, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useCreateCampaignMutation, useFetchCampaignsQuery } from "@/store/slices/api/campaignsSlice";
import { APIActionResponse, Campaign, CampaignStatus } from "@/types";

import { ArrowDownTrayIcon, EllipsisHorizontalIcon, StarIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Campaigns({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendGTMEvent } = useGTM();
  const { getAddon, isAddonAvailable, subscription } = useContext(SubscriptionContext);
  let nf = new Intl.NumberFormat("en-US");
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState(CampaignStatus.PUBLISHED);
  const [isDirty, setIsDirty] = useState(false);
  const endsAt = subscription?.next_payment?.date ?? subscription?.ends_at ?? subscription?.paused_from;
  const { displayErrors } = useResponseToastHandler({});

  const [exportCampaigns] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportCampaigns({
      endpoint: "/campaigns/export",
      name: "campaigns",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [createCampaign] = useCreateCampaignMutation();

  const handleCampaignCreation = async (title: string, type?: string) => {
    if (!title?.trim()) {
      return;
    }

    const campaign = (await createCampaign({
      name: title,
      status: CampaignStatus.DRAFT
    })) as APIActionResponse<Campaign>;

    if (!displayErrors(campaign)) {
      setShow(false);

      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: "campaign",
        product_title: title,
        product_id: campaign?.data.data.id
      });

      await router.push(`/marketing/campaigns/${campaign?.data.data.id}/edit`);
    }
  };

  return (
    <Layout title={t("marketing.campaigns.title")}>
      <Layout.Container>
        {isAddonAvailable("emails") && !isEmpty(getAddon("emails")) ? (
          <>
            <div className="mb-6 rounded-xl border border-gray-300 bg-white px-4 py-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <ProgressRing
                    color={"success"}
                    value={
                      ((Number(getAddon("emails")?.limit ?? 0) - Number(getAddon("emails")?.usage ?? 0)) /
                        Number(getAddon("emails")?.limit ?? 0)) *
                      100
                    }
                    width={15}
                    size={60}
                  />
                </div>
                <div className="flex h-full flex-col gap-4">
                  <div className="flex gap-1 !font-medium text-gray-900">
                    <span>{t("marketing.campaigns.current_package")}</span>
                    <span className="!font-normal !text-gray-800">
                      {Number(getAddon("emails")?.limit) == 100
                        ? t("marketing.campaigns.current_package_will_end_at", {
                            date: dayjs(endsAt).format("DD/MM/YYYY")
                          })
                        : t("marketing.campaigns.current_package_subtitle", {
                            date: dayjs(endsAt).format("DD/MM/YYYY")
                          })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xl !font-medium text-gray-900">
                    <span>{nf.format(Number(getAddon("emails")?.limit) - Number(getAddon("emails")?.usage ?? 0))}</span>
                    <span className="!font-normal !text-gray-800">/{nf.format(Number(getAddon("emails")?.limit))}</span>
                    <span className="text-sm !font-normal !text-gray-800">{t("marketing.campaigns.message")}</span>
                  </div>
                </div>
                <Button
                  className="mr-auto"
                  children={t("marketing.campaigns.upgrade_button")}
                  as={Link}
                  href={"/settings/billing/email-bundles"}
                  variant={"gradient"}
                />
              </div>
            </div>
            <Datatable
              onDataLoaded={(data) => {
                if (!isDirty) {
                  if (data.data) {
                    if (data.data.length > 0) {
                      setFilter(CampaignStatus.PUBLISHED);
                      setIsDirty(true);
                    } else {
                      setFilter(CampaignStatus.IN_PROGRESS);
                      setIsDirty(true);
                    }
                  }
                }
              }}
              fetcher={useFetchCampaignsQuery}
              columns={{
                columns: CampaignCols,
                props: {
                  filter: filter == CampaignStatus.PUBLISHED ? CampaignStatus.PUBLISHED : CampaignStatus.UNPUBLISHED
                }
              }}
              params={{
                filters: {
                  status:
                    filter == CampaignStatus.PUBLISHED
                      ? [CampaignStatus.PUBLISHED]
                      : [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED]
                }
              }}
              emptyState={
                <EmptyStateTable
                  title={t("marketing.campaigns.empty_state.title")}
                  content={t("marketing.campaigns.empty_state.description")}
                  icon={<StarIcon />}
                />
              }
              toolbarClassName="w-full"
              toolbar={(instance) => (
                <div className="flex flex-col">
                  <div className="mb-4 flex items-center gap-4">
                    <Typography.Paragraph className="ml-auto text-xl !font-semibold">
                      {t("marketing.campaigns.title")}
                    </Typography.Paragraph>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setShow(true)}
                      children={t("marketing.campaigns.add_new_campaign")}
                      icon={
                        <Icon
                          size="sm"
                          children={<PlusIcon />}
                        />
                      }
                    />
                    <Dropdown>
                      <Dropdown.Trigger>
                        <Button
                          variant="default"
                          icon={
                            <Icon
                              size="md"
                              children={<EllipsisHorizontalIcon />}
                            />
                          }
                        />
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleExport(instance)}
                          children={t("export")}
                          iconAlign="end"
                          icon={
                            <Icon
                              size="sm"
                              children={<ArrowDownTrayIcon />}
                            />
                          }
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FilterGroup
                      current_value={filter}
                      filters={[
                        {
                          key: CampaignStatus.PUBLISHED,
                          title: t(`marketing.campaigns.published`),
                          actions: {
                            onClick: () => {
                              setIsDirty(true);
                              setFilter(CampaignStatus.PUBLISHED);
                            }
                          }
                        },
                        {
                          key: CampaignStatus.IN_PROGRESS,
                          title: t(`marketing.campaigns.in_progress`),
                          actions: {
                            onClick: () => {
                              setIsDirty(true);
                              setFilter(CampaignStatus.IN_PROGRESS);
                            }
                          }
                        }
                      ]}
                    />
                  </div>
                </div>
              )}
            />
            <CreateNewModal
              title={t("marketing.campaigns.add_new_campaign")}
              type="campaign"
              inputLabel={t("marketing.campaigns.name")}
              inputPlaceholder={t("marketing.campaigns.name_placeholder")}
              createAction={handleCampaignCreation}
              submitButtonText={t("add_new")}
              open={show}
              onDismiss={() => {
                setShow(false);
              }}
            />
          </>
        ) : (
          <PlanBanner />
        )}
      </Layout.Container>
    </Layout>
  );
}
