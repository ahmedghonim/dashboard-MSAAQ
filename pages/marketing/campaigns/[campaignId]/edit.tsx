import { useEffect } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CampaignForm from "@/components/campaigns/CampaignForm";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCampaignQuery } from "@/store/slices/api/campaignsSlice";
import { Campaign } from "@/types";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Edit() {
  const router = useRouter();

  const {
    query: { campaignId }
  } = router;
  const { data: campaign = {} as Campaign, isLoading } = useFetchCampaignQuery(campaignId as string);

  useEffect(() => {
    if (campaign && campaign.status == "published") {
      setTimeout(() => {
        router.push(`/marketing/campaigns/${campaignId}`);
      }, 1500);
    }
  }, [campaign]);
  return !isLoading && <CampaignForm campaign={campaign} />;
}
