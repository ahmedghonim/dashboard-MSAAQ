import React, { useContext } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import PaymentMethodsCols from "@/columns/paymentMethods";
import { Datatable, EmptyStateTable, Layout } from "@/components";
import BillingTabs from "@/components/settings/BillingTabs";
import { StripeContext } from "@/contextes/StripeContext";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCardsQuery } from "@/store/slices/api/billing/paymentMethodsSlice";

import { CreditCardIcon } from "@heroicons/react/24/outline";

import { Button, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export const AddPaymentMethodButton = ({ children, variant = "primary" }: any) => {
  const { toggleAddCard } = useContext(StripeContext);

  return (
    <Button
      variant={variant}
      onClick={() => toggleAddCard()}
      children={children ?? "أضِف طريقة دفع جديدة"}
    />
  );
};

export default function PaymentMethods() {
  const { t } = useTranslation();

  return (
    <Layout title={t("billing.payment_methods.title")}>
      <BillingTabs />

      <Layout.Container>
        <Datatable
          columns={{
            columns: PaymentMethodsCols
          }}
          toolbar={(instance) => (instance.data.length ? <AddPaymentMethodButton /> : null)}
          selectable={false}
          fetcher={useFetchCardsQuery}
          emptyState={
            <EmptyStateTable
              icon={<CreditCardIcon />}
              title={"لا توجد طرق دفع محفوظة!"}
              content={"لا توجد طرق دفع محفوظة في منصتك حاليًا، بإمكانك إضافة واحدة جديدة الآن."}
              children={<AddPaymentMethodButton />}
            />
          }
        />
      </Layout.Container>
    </Layout>
  );
}
