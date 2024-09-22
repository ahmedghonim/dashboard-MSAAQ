import React from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import BankTransfers from "@/columns/bank-transfers";
import { EmptyStateTable, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import OrdersIndexTabs from "@/components/shared/orders/OrdersIndexTabs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchBankTransfersQuery } from "@/store/slices/api/bankTransfersSlice";
import { BankTransferStatus } from "@/types/models/bank-transfer";

import { BanknotesIcon } from "@heroicons/react/24/outline";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  return (
    <Layout title={t("bank_transfers.title")}>
      <OrdersIndexTabs />

      <Layout.Container>
        <Datatable
          columns={{
            columns: BankTransfers
          }}
          selectable={false}
          fetcher={useFetchBankTransfersQuery}
          params={{
            filters: {
              status: BankTransferStatus.PENDING
            }
          }}
          emptyState={
            <EmptyStateTable
              title={t("bank_transfers.empty_state.title")}
              content={t("bank_transfers.empty_state.description")}
              icon={<BanknotesIcon />}
            />
          }
        />
      </Layout.Container>
    </Layout>
  );
}
