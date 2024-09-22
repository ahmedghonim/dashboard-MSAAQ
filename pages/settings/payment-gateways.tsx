import { useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import VerifyAcademyToEnableMsaaqPayAlert from "@/components/Alerts/VerifyAcademyToEnableMsaaqPayAlert";
import AppCard from "@/components/apps/AppCard";
import ActivateMsaaqPayCard from "@/components/cards/ActivateMsaaqPayCard";
import BanksModal from "@/components/modals/BanksModal";
import InstallAppModal from "@/components/modals/InstallAppModal";
import { useAppSelector } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchAppsQuery, useInstallAppMutation, useUninstallAppMutation } from "@/store/slices/api/appsSlice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIResponse, App } from "@/types";

import { Alert, Button, Grid, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  const [showAllPaymentApps, setShowAllPaymentApps] = useState<boolean>(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState<boolean>(false);

  const {
    current_academy: { is_verified }
  } = useAppSelector<AuthSliceStateType>((state) => state.auth);

  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const { data: paymentGateways = {} as APIResponse<App> } = useFetchAppsQuery({
    filters: {
      category: ["payment"]
    }
  });

  return (
    <Layout title={t("apps_marketplace.payment_gateways")}>
      <Layout.Container>
        {!is_verified && <VerifyAcademyToEnableMsaaqPayAlert />}
        <ActivateMsaaqPayCard />
        <div className="mb-6 flex flex-col space-y-2">
          <Typography.Paragraph
            as={"h3"}
            weight="medium"
            children={t("apps_marketplace.payment_gateways_with_msaaqpay")}
          />
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
            {paymentGateways?.data
              ?.filter((app) => app.slug !== "msaaqpay" && app.with_msaaqpay)
              .map((paymentGateway, index) => (
                <Grid.Cell
                  key={index}
                  columnSpan={{
                    lg: 4
                  }}
                >
                  <AppCard
                    app={paymentGateway}
                    appUninstallMutation={useUninstallAppMutation}
                    actionText={t("apps_marketplace.activate")}
                    cardActionClickHandler={() => {
                      setSelectedApp(paymentGateway);
                      if (paymentGateway.slug === "bank-transfer") {
                        setShowBankTransferModal(true);
                      } else {
                        setShow(true);
                      }
                    }}
                  />
                </Grid.Cell>
              ))}
          </Grid>
        </div>
        <div className="flex flex-col space-y-2">
          {!showAllPaymentApps && (
            <Button
              ghost
              children={t("apps_marketplace.show_all_payment_gateways")}
              className="mx-auto"
              onClick={() => setShowAllPaymentApps(true)}
            />
          )}
          {showAllPaymentApps && (
            <>
              <Typography.Paragraph
                as={"h3"}
                weight="medium"
                className="mb-2"
                children={t("apps_marketplace.all_available_payment_gateways")}
              />
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
                {paymentGateways?.data
                  ?.filter((app) => app.slug !== "msaaqpay" && !app.with_msaaqpay)
                  .map((paymentGateway, index) => (
                    <Grid.Cell
                      key={index}
                      columnSpan={{
                        lg: 4
                      }}
                    >
                      <AppCard
                        app={paymentGateway}
                        appUninstallMutation={useUninstallAppMutation}
                        actionText={t("apps_marketplace.activate")}
                        cardActionClickHandler={() => {
                          setSelectedApp(paymentGateway);
                          setShow(true);
                        }}
                      />
                    </Grid.Cell>
                  ))}
              </Grid>
            </>
          )}
        </div>
        <BanksModal
          app={selectedApp}
          open={showBankTransferModal}
          onDismiss={() => {
            setSelectedApp(null);
            setShowBankTransferModal(false);
          }}
        />
        <InstallAppModal
          appInstallMutation={useInstallAppMutation}
          instructionsText={t("apps_marketplace.how_to_activate_payment_gateway")}
          titleI18Key={"apps_marketplace.active_payment_gateway"}
          actionText={t("apps_marketplace.activate")}
          open={show}
          app={selectedApp}
          onDismiss={() => {
            setSelectedApp(null);
            setShow(false);
          }}
        >
          <Alert
            variant="warning"
            children={t("apps_marketplace.payment_gateway_support_alert")}
          />
        </InstallAppModal>
      </Layout.Container>
    </Layout>
  );
}
