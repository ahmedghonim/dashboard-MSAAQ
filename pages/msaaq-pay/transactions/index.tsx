import React from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import TransactionsCols from "@/columns/transactions";
import { EmptyStateTable, Layout } from "@/components";
import { MsaaqPayIcon } from "@/components/Icons/solid";
import { Datatable } from "@/components/datatable";
import { useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchTransactionsQuery } from "@/store/slices/api/msaaq-pay/transactionsSlice";
import { TransactionType } from "@/types";

import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  const [exportTransactions] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportTransactions({
      endpoint: "/msaaqpay/transactions/export",
      name: "msaaqpay-transactions",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const ToolbarButton = ({ instance }: any) => (
    <Button
      icon={
        <Icon
          size="sm"
          children={<ArrowDownTrayIcon />}
        />
      }
      onClick={() => handleExport(instance)}
      variant="default"
      size="md"
      children={t("export")}
    />
  );

  return (
    <Layout title={t("sidebar.msaaq_pay.transactions")}>
      <Layout.Container>
        <Datatable
          columns={{
            columns: TransactionsCols
          }}
          fetcher={useFetchTransactionsQuery}
          params={{
            filters: {
              type: TransactionType.DEPOSIT
            },
            only_with: ["payer"]
          }}
          toolbar={(instance) => <ToolbarButton instance={instance} />}
          hasSearch={true}
          emptyState={
            <EmptyStateTable
              title={t("msaaq_pay.transactions.empty_state.title")}
              content={t("msaaq_pay.transactions.empty_state.description")}
              icon={<MsaaqPayIcon />}
            />
          }
        />
      </Layout.Container>
    </Layout>
  );
}
