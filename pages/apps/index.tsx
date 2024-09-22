import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, EmptyStateTable, Layout, ManuallyInstallZoomModal } from "@/components";
import AppCard from "@/components/apps/AppCard";
import InstallAppModal from "@/components/modals/InstallAppModal";
import i18nextConfig from "@/next-i18next.config";
import { useFetchAppsQuery, useInstallAppMutation, useUninstallAppMutation } from "@/store/slices/api/appsSlice";
import { APIResponse, App } from "@/types";
import { fuzzySearch } from "@/utils/fuzzySearch";

import { DocumentIcon } from "@heroicons/react/24/outline";

import { Alert, Button, Form, Grid } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export const LoadingCard = () => {
  return (
    <Grid
      columns={{
        lg: 12
      }}
      gap={{
        md: "1rem",
        lg: "1rem",
        xl: "1rem"
      }}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <Grid.Cell
          key={index}
          columnSpan={{
            lg: 4
          }}
          className="h-full"
        >
          <Card className="mx-auto mb-6 w-full">
            <Card.Body className=" animate-pulse">
              <div className="mb-5">
                <div className="mr-auto h-36 w-full rounded bg-gray"></div>
              </div>
              <hr />
              <div className=" mt-5 h-10 w-24 rounded bg-gray"></div>
            </Card.Body>
          </Card>
        </Grid.Cell>
      ))}
    </Grid>
  );
};

const categories = [
  "all_apps",
  "installed_apps",
  "analytics",
  "marketing",
  "email_marketing",
  "customer_support",
  "other"
];

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const [showManuallyInstallZoomModal, setShowManuallyInstallZoomModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [filterCategory, setCategory] = useState<string>("all_apps");
  const [search, setSearch] = useState<string>("");

  const { isLoading, data: appsResponse = {} as APIResponse<App> } = useFetchAppsQuery({
    locale: router.locale
  });

  const [filteredApps, setFilteredApps] = useState<App[]>(
    appsResponse.data?.filter((app) => app.category !== "payment") || []
  );
  const keys: (keyof App)[] = ["title", "description"];

  useEffect(() => {
    if (appsResponse.data) {
      let apps = appsResponse.data.filter((app) => app.category !== "payment") || [];
      apps = fuzzySearch(apps, search, { keys, threshold: 0.7 });

      if (filterCategory && filterCategory !== "all_apps") {
        if (filterCategory === "installed_apps") {
          apps = apps.filter((app) => app.installed);
        } else {
          apps = apps.filter((app) => app.category === filterCategory);
        }
      }

      setFilteredApps(apps);
    }
  }, [appsResponse.data, search, filterCategory]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim());
  };

  const onCategoryClick = useCallback((category: string) => {
    setCategory(category);
  }, []);

  return (
    <Layout title={t("apps_marketplace.title")}>
      <Layout.Container>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row">
          <Form.Group className="mb-0 md:w-4/12">
            <Form.Input
              value={search}
              onChange={handleChange}
              placeholder={t("apps_marketplace.search_input_placeholder")}
            />
          </Form.Group>
          <div className="divide-x-gray flex items-center divide-x divide-x-reverse rounded-md border border-solid border-gray bg-gray-50 p-1">
            {categories.map((category, index) => (
              <React.Fragment key={`${category}-${index}`}>
                <Button
                  variant="default"
                  size="sm"
                  ghost={!filterCategory && category === "all_apps" ? false : category !== filterCategory}
                  onClick={() => onCategoryClick(category)}
                  children={t(`apps_marketplace.category.${category}`)}
                />
                {index < categories.length - 1 ? <div className="mx-1 h-[22px] w-px bg-gray" /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
        {filteredApps.length ? (
          <Grid
            columns={{
              lg: 12
            }}
            gap={{
              md: "1rem",
              lg: "1rem",
              xl: "1rem"
            }}
          >
            {filteredApps.map((app, index) => (
              <Grid.Cell
                key={`app-${app.id}-${index}`}
                columnSpan={{
                  lg: 4
                }}
                className="h-full"
              >
                <AppCard
                  app={app}
                  appUninstallMutation={useUninstallAppMutation}
                  actionText={t("apps_marketplace.install")}
                  cardActionClickHandler={() => {
                    setSelectedApp(app);
                    setShow(true);
                  }}
                />
              </Grid.Cell>
            ))}
          </Grid>
        ) : filterCategory == "installed_apps" && !filteredApps.length ? (
          <Alert
            variant="info"
            title={t("apps_marketplace.no_installed_apps")}
            className="mb-6"
          />
        ) : filteredApps.length == 0 && !isLoading ? (
          <EmptyStateTable
                title={t("empty_state.no_search_data")}
            children={<div className="!mt-0.5 text-center" dangerouslySetInnerHTML={{ __html: t("empty_state.no_search_data_description")}} />}
             icon={<DocumentIcon />}
          />
        ) : (
          <LoadingCard />
        )}
        <InstallAppModal
          instructionsText={t("apps_marketplace.how_to_install_app")}
          titleI18Key={"apps_marketplace.install_app"}
          actionText={t("apps_marketplace.install")}
          open={show}
          app={selectedApp}
          appInstallMutation={useInstallAppMutation}
          onDismiss={() => {
            setSelectedApp(null);
            setShow(false);
          }}
        />
        <ManuallyInstallZoomModal
          onDismiss={() => setShowManuallyInstallZoomModal(false)}
          open={showManuallyInstallZoomModal}
        />
      </Layout.Container>
    </Layout>
  );
}
