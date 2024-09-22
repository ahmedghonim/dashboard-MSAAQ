import React from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import OrdersCols from "@/columns/orders";
import { EmptyStateTable, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import OrdersIndexTabs from "@/components/shared/orders/OrdersIndexTabs";
import { useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchOrdersQuery } from "@/store/slices/api/ordersSlice";

import { PencilIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();

  const [exportOrders] = useDataExport();

  const handleExport = async (tableInstance: any) => {
    exportOrders({
      endpoint: "/orders/export",
      name: "orders",
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
    <Layout title={t("sidebar.orders.title")}>
      <OrdersIndexTabs />

      <Layout.Container>
        <Datatable
          columns={{
            columns: OrdersCols
          }}
          fetcher={useFetchOrdersQuery}
          toolbar={(instance) => <ToolbarButton instance={instance} />}
          hasSearch={true}
          params={{
            only_with: ["member"]
          }}
          emptyState={
            <EmptyStateTable
              title={t("orders.empty_state.title")}
              content={t("orders.empty_state.description")}
              icon={<PencilIcon />}
            />
          }
        />
      </Layout.Container>
    </Layout>
  );
}
