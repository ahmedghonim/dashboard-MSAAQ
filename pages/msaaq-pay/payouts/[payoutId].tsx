import { useContext, useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { saveAs } from "file-saver";
import { isEmpty } from "lodash";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout, Time } from "@/components";
import { useToast } from "@/components/toast";
import { AppContext } from "@/contextes";
import { useFormatPrice } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchEntityQuery } from "@/store/slices/api/entitySlice";
import { useFetchPayoutQuery } from "@/store/slices/api/msaaq-pay/payoutsSlice";
import { Payout, PayoutStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { Alert, Badge, Button, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function OrderShowPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPrice, setCurrency } = useFormatPrice();
  const { data: payout = {} as Payout } = useFetchPayoutQuery(router.query.payoutId as any);
  const { data: entity = {} } = useFetchEntityQuery();

  useEffect(() => {
    if (payout.currency) {
      setCurrency(payout.currency);
    }
  }, [payout]);

  const [toast] = useToast();
  const { setIsLoading } = useContext(AppContext);

  const downloadReceipt = async () => {
    const data = await axios
      .get(`/msaaqpay/payouts/${payout.id}/receipt`, {
        responseType: "blob"
      })
      .then((res) => res.data)
      .catch(() => {
        setIsLoading(false);

        toast.error({
          message: t("msaaq_pay.payouts.receipt_download_error")
        });
      });

    if (data) {
      saveAs(data, `payouts-receipt-${payout.id}.${data.type.split("/")[1]}`);
    }
  };

  return (
    <Layout title={t("msaaq_pay.payouts.payout_details")}>
      <Layout.Container>
        <Layout.FormGrid
          sidebar={
            <Layout.FormGrid.DefaultSidebar>
              <div className="flex flex-col gap-4">
                <Card label={t("msaaq_pay.payouts.financial_details")}>
                  <Card.Body className="flex flex-col gap-2">
                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(payout.amount)}
                      subtitle={t("msaaq_pay.payouts.amount")}
                    />

                    {!isEmpty(payout.processing_fees) && (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={payout.processing_fees ? formatPrice(payout.processing_fees) : "-"}
                        subtitle={t("msaaq_pay.payouts.processing_fees")}
                      />
                    )}

                    {!isEmpty(payout.exchange_rate_difference) && (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={payout.exchange_rate_difference ? formatPrice(payout.exchange_rate_difference) : "-"}
                        subtitle={t("msaaq_pay.payouts.processing_fees")}
                      />
                    )}
                  </Card.Body>

                  <Card.Actions>
                    <Title
                      reverse
                      className="w-full [&>*]:flex-row-reverse [&>*]:justify-between"
                      title={
                        payout.status == PayoutStatus.APPROVED
                          ? formatPrice(
                              payout.amount - (payout.processing_fees ?? 0) - (payout.exchange_rate_difference ?? 0)
                            )
                          : "—"
                      }
                      subtitle={
                        <span
                          className="font-bold text-gray-950"
                          children={t("msaaq_pay.payouts.net_amount")}
                        />
                      }
                    />
                  </Card.Actions>
                </Card>

                <Card
                  className="!border-0"
                  label={t("msaaq_pay.payouts.history")}
                >
                  {payout.declined_reason && payout.status === PayoutStatus.DECLINED && (
                    <Alert
                      variant="danger"
                      children={payout.declined_reason}
                    />
                  )}

                  {payout.status === PayoutStatus.PENDING && (
                    <Alert
                      variant="info"
                      children={
                        entity?.data?.country_code == "SA"
                          ? t("msaaq_pay.payouts.pending_alert_message")
                          : t("msaaq_pay.payouts.pending_alert_message_non_saudi")
                      }
                    />
                  )}

                  {payout.status === PayoutStatus.APPROVED && (
                    <Alert
                      variant="success"
                      children={t("msaaq_pay.payouts.approved_alert_message")}
                    />
                  )}
                </Card>
              </div>
            </Layout.FormGrid.DefaultSidebar>
          }
        >
          <div className="flex flex-col gap-4">
            <Card label={t("msaaq_pay.payouts.payout_details")}>
              <Card.Body className="flex justify-between py-6">
                <div className="flex items-center gap-2">
                  <Typography.Subtitle
                    size="lg"
                    children={formatPrice(payout.amount)}
                  />

                  <Badge
                    size="sm"
                    variant={getStatusColor(payout.status)}
                    children={<Trans i18nKey={`msaaq_pay.payouts.statuses.${payout.status}`} />}
                    rounded
                    soft
                  />
                </div>

                {payout.status === PayoutStatus.APPROVED && (
                  <Button
                    variant="default"
                    onClick={downloadReceipt}
                    children={t("msaaq_pay.payouts.receipt_url")}
                  />
                )}
              </Card.Body>
              <Card.Actions className="grid grid-cols-2">
                <Title
                  reverse
                  title={payout.id}
                  subtitle={t("msaaq_pay.payouts.id")}
                />

                <Title
                  reverse
                  title={<Time date={payout.created_at} />}
                  subtitle={t("msaaq_pay.payouts.created_at")}
                />
              </Card.Actions>

              {payout.bank && (
                <Card.Actions className="grid grid-cols-2 gap-4">
                  <Title
                    reverse
                    title={payout.bank.bank_name}
                    subtitle={t("bank_info.bank_name")}
                  />

                  <Title
                    reverse
                    title={payout.bank.account_number}
                    subtitle={t("bank_info.account_number")}
                  />

                  <Title
                    reverse
                    title={payout.bank.account_name}
                    subtitle={t("bank_info.account_owner_name")}
                  />

                  <Title
                    reverse
                    title={payout.bank.iban}
                    subtitle={t("bank_info.iban")}
                  />
                </Card.Actions>
              )}
            </Card>
          </div>
        </Layout.FormGrid>
      </Layout.Container>
    </Layout>
  );
}
