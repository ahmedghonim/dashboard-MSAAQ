import { useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ReceiptsCols from "@/columns/reciptes";
import { Datatable, Layout } from "@/components";
import BillingTabs from "@/components/settings/BillingTabs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchReceiptsQuery } from "@/store/slices/api/billing/receiptsSlice";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Invoices() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<any>(null);
  const [meta, setMeta] = useState<any>({
    has_more: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Layout title={t("sidebar.settings.billing.invoices")}>
      <BillingTabs />

      <Layout.Container>
        <Datatable
          selectable={false}
          params={{
            per_page: 1,
            ...(filter?.starting_after && {
              starting_after: filter?.starting_after
            }),
            ...(filter?.ending_before && {
              ending_before: filter?.ending_before
            })
          }}
          columns={{
            columns: ReceiptsCols
          }}
          fetcher={useFetchReceiptsQuery}
          onMetaLoaded={(value) => setMeta(value)}
          onIsLoading={(value) => setIsLoading(value)}
          toolbar={(instance) => {
            if (instance.data && meta)
              return (
                <div className="flex w-full gap-4">
                  <Button
                    variant="default"
                    isLoading={isLoading && filter?.ending_before}
                    disabled={!filter || (filter?.ending_before && !meta.has_more)}
                    onClick={() => {
                      setIsLoading(true);
                      setFilter({
                        ending_before: instance.data[0].id
                      });
                    }}
                    children={<Icon children={<ArrowRightIcon />} />}
                  />
                  <Button
                    variant="default"
                    isLoading={isLoading && filter?.starting_after}
                    disabled={!meta.has_more && (!filter || filter?.starting_after)}
                    onClick={() => {
                      setIsLoading(true);
                      setFilter({
                        starting_after: instance.data.at(-1).id
                      });
                    }}
                    children={<Icon children={<ArrowLeftIcon />} />}
                  />
                </div>
              );
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
