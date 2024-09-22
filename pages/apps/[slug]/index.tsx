import { useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import InstalledAppCard from "@/components/apps/InstalledAppCard";
import InstallAppModal from "@/components/modals/InstallAppModal";
import i18nextConfig from "@/next-i18next.config";
import { LoadingCard } from "@/pages/apps";
import {
  useFetchAppQuery,
  useFetchPropertiesQuery,
  useInstallAppMutation,
  useUninstallAppMutation
} from "@/store/slices/api/appsSlice";
import { App } from "@/types";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function ShowApp() {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const { query } = useRouter();

  const { data: app = {} as App, isLoading, refetch } = useFetchAppQuery(query.slug as string);
  const { data: properties } = useFetchPropertiesQuery();

  return (
    <Layout title={t("apps_marketplace.title")}>
      <Layout.Container>
        {!isLoading ? (
          <div className="m-auto w-full lg:w-3/4 lg:pt-32">
            <InstalledAppCard
              refetch={refetch}
              app={app}
              properties={properties}
              appUninstallMutation={useUninstallAppMutation}
              actionText={t("apps_marketplace.install")}
              cardActionClickHandler={() => {
                setSelectedApp(app);
                setShow(true);
              }}
            />
          </div>
        ) : (
          <LoadingCard />
        )}

        <InstallAppModal
          instructionsText={t("apps_marketplace.how_to_install_app")}
          titleI18Key={"apps_marketplace.install_app"}
          actionText={t("apps_marketplace.install")}
          open={show}
          refetch={refetch}
          app={selectedApp}
          appInstallMutation={useInstallAppMutation}
          onDismiss={() => {
            setSelectedApp(null);
            setShow(false);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
