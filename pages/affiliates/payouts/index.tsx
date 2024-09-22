import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import MsaaqAffiliatePayout from "@/columns/msaaqAffilatePayouts";
import { EmptyStateTable, Layout } from "@/components";
import EmptyDataIcon from "@/components/Icons/EmptyDataIcon";
import { Datatable } from "@/components/datatable";
import MsaaqAffiliatePayoutModal from "@/components/modals/MsaaqAffiliatePayoutModal";
import UserBankModal from "@/components/modals/UserBankModal";
import AffiliatesIndexTabs from "@/components/shared/affiliates/AffiliatesIndexTabs";
import { useAppSelector } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchUserBankQuery } from "@/store/slices/api/bankSlice";
import { useFetchAffiliatesSettingsQuery } from "@/store/slices/api/msaaq-affiliates/affiliateSettingsSlice";
import { useFetchAffiliatePayoutsQuery } from "@/store/slices/api/msaaq-affiliates/payoutsSlice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { Bank, Payout, PayoutStatus } from "@/types";
import { MsaaqAffiliateSettings } from "@/types/models/msaaqAffiliateSettings";

import { Button } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBankModal, setShowBankModal] = useState<boolean>(false);

  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const { user } = auth;
  const { data: userBank, isLoading } = useFetchUserBankQuery({ user_id: user.id });
  const [bank, setBank] = useState<Bank | undefined>(undefined);

  useEffect(() => {
    if (userBank && !isLoading) {
      setBank(userBank.data);
    }
  }, [userBank]);

  const handleToggle = (data: boolean) => {
    setShowBankModal(data);
    setShowModal(!data);
  };

  const handleBankChange = (data: Bank) => {
    setBank(data);
  };
  const {
    data: affiliateSettings = {
      setting: { payouts_min_amount: 10 },
      balance: {
        available_balance: 0
      }
    } as MsaaqAffiliateSettings
  } = useFetchAffiliatesSettingsQuery();

  return (
    <Layout title={t("sidebar.affiliates.payouts")}>
      <AffiliatesIndexTabs />
      <Layout.Container>
        <Datatable
          columns={{
            columns: MsaaqAffiliatePayout
          }}
          hasFilter={false}
          fetcher={useFetchAffiliatePayoutsQuery}
          toolbar={(instance) => {
            const item = instance.data.filter((item: Payout) => item.status === PayoutStatus.PENDING);
            return (
              <Button
                onClick={item.length > 0 ? undefined : () => setShowModal(true)}
                variant="primary"
                disabled={
                  affiliateSettings?.balance?.available_balance < affiliateSettings?.setting?.payouts_min_amount ||
                  item.length > 0
                }
                size="md"
                children={t("affiliates.payouts.create_payout_request")}
              />
            );
          }}
          emptyState={
            <EmptyStateTable
              title={t("affiliates.payouts.empty_state.title")}
              content={t("affiliates.payouts.empty_state.description")}
              icon={<EmptyDataIcon />}
            />
          }
        />
        <UserBankModal
          onDismiss={() => {
            setShowBankModal(false);
            setShowModal(true);
          }}
          open={showBankModal}
          onToggleBankModal={handleToggle}
          onBankDataChange={handleBankChange}
        />
        <MsaaqAffiliatePayoutModal
          onDismiss={() => {
            setShowModal(false);
          }}
          open={showModal}
          affiliateSettings={affiliateSettings}
          onToggleBankModal={handleToggle}
          userBank={bank}
        />
      </Layout.Container>
    </Layout>
  );
}
