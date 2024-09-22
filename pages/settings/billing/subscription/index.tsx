import React, { useContext } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ReceiptsCols from "@/columns/reciptes";
import { Card, Datatable, Layout, Price, Time } from "@/components";
import TrialAlert from "@/components/Alerts/TrialAlert";
import Ksa93Banner from "@/components/Ksa93Banner";
import BillingTabs from "@/components/settings/BillingTabs";
import { Plan } from "@/components/shared/plans/Plan";
import { Plans } from "@/components/shared/plans/Plans";
import { AuthContext, SubscriptionContext } from "@/contextes";
import { useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchPlansQuery } from "@/store/slices/api/billing/plansSlice";
import { useFetchReceiptsQuery } from "@/store/slices/api/billing/receiptsSlice";
import { Subscription, SubscriptionStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { Alert, Badge, Button, Grid, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

const ProgressBar = ({ value = 0, color = "primary" }) => {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-300">
      <div
        className={`bg-${color}-500 h-1.5 max-w-full rounded-full bg-${value >= 75 ? "danger" : color}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
export default function SubscriptionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPrice } = useFormatPrice();
  const { data: plans } = useFetchPlansQuery({
    locale: router.locale
  });
  const { current_academy } = useContext(AuthContext);

  const addons = current_academy?.addons;
  const subscription = current_academy.subscription ?? ({} as Subscription);
  const endsAt = subscription.next_payment?.date ?? subscription.ends_at ?? subscription.paused_from;

  return (
    <Layout title={t("sidebar.settings.billing.title")}>
      <BillingTabs />

      <Layout.Container>
        <Ksa93Banner />

        {!isEmpty(subscription) && subscription.status !== SubscriptionStatus.CANCELLED ? (
          <Grid
            columns={{
              xs: 1,
              md: 3
            }}
          >
            <Grid.Cell
              columnSpan={{
                md: 1
              }}
            >
              <Plan
                // @ts-ignore
                plan={subscription.plan}
                interval={subscription?.price?.interval}
                manageSubscription={true}
              />
            </Grid.Cell>

            <Grid.Cell
              columnSpan={{
                md: 2
              }}
            >
              <Card className="h-full">
                <Card.Header>
                  <Typography.Paragraph
                    children={t("billing.subscriptions.details")}
                    weight="medium"
                  />
                </Card.Header>

                {(SubscriptionStatus.PAST_DUE == subscription.status || subscription.on_grace_period) && (
                  <Card.Body>
                    <Alert
                      variant={SubscriptionStatus.PAST_DUE === subscription.status ? "warning" : "info"}
                      title={t(
                        `billing.subscriptions.alerts.${subscription.payment_intent ? "past_due" : "paused"}.title`
                      )}
                    >
                      {t(
                        `billing.subscriptions.alerts.${
                          subscription.payment_intent ? "past_due" : "paused"
                        }.description`
                      )}

                      {SubscriptionStatus.PAST_DUE === subscription.status && (
                        <div className="mt-4">
                          {t(`billing.subscriptions.alerts.past_due.grace_period_note`, {
                            next_retry_at: subscription.next_payment?.date
                              ? dayjs(subscription.next_payment?.date).format("DD MMMM YYYY")
                              : "-"
                          })}
                        </div>
                      )}
                    </Alert>
                  </Card.Body>
                )}

                <Card.Body className="card-divide-x grid grid-cols-3">
                  <Title
                    className="!items-start"
                    reverse
                    title={
                      <Badge
                        children={t(`billing.subscriptions.statuses.${subscription.status}`)}
                        variant={getStatusColor(subscription.status)}
                        size="sm"
                        soft
                        rounded
                      />
                    }
                    subtitle={t("billing.subscriptions.status")}
                  />

                  <Title
                    className="!items-start"
                    reverse
                    subtitle={t("billing.subscriptions.started_at")}
                    title={
                      <Time
                        date={subscription.created_at}
                        format={"DD MMMM YYYY"}
                      />
                    }
                  />

                  <Title
                    reverse
                    title={
                      formatPrice(subscription.price.price, subscription.price.currency) +
                      " " +
                      t(`billing.plans.intervals.${subscription.price.interval}`)
                    }
                    subtitle={"سعر الاشتراك"}
                  />
                </Card.Body>

                <Card.Body children={<hr />} />

                <Card.Body className="card-divide-x grid grid-cols-3">
                  <Title
                    className="!items-start"
                    reverse
                    subtitle={"كود الخصم"}
                    title={
                      subscription?.coupon ? (
                        <Badge
                          children={subscription?.coupon?.name ?? "-"}
                          variant={subscription?.coupon?.valid ? "success" : "danger"}
                          size="sm"
                          soft
                          rounded
                        />
                      ) : (
                        "-"
                      )
                    }
                  />

                  <Title
                    className="!items-start"
                    reverse
                    subtitle={t("billing.subscriptions.next_payment_date")}
                    title={
                      subscription?.next_payment ? (
                        <Time
                          date={subscription?.next_payment.date}
                          format={"DD MMMM YYYY"}
                        />
                      ) : (
                        "-"
                      )
                    }
                  />

                  <Title
                    className="!items-start"
                    reverse
                    subtitle={"الدفعة القادمة"}
                    title={
                      subscription?.next_payment ? (
                        <Price
                          price={subscription?.next_payment.amount}
                          currency={subscription?.next_payment.currency}
                        />
                      ) : (
                        "-"
                      )
                    }
                  />
                </Card.Body>

                <Card.Body children={<hr />} />

                <Card.Body className="mt-auto">
                  <div className="mb-2 flex items-center justify-between">
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                      children={t("billing.invoices.recent_invoices")}
                    />
                    <Button
                      as={Link}
                      href={"/settings/billing/invoices"}
                      variant="link"
                      size="sm"
                      children={t("billing.invoices.see_all_invoices")}
                    />
                  </div>

                  <Datatable
                    defaultPerPage={1}
                    hasPagination={false}
                    selectable={false}
                    fetcher={useFetchReceiptsQuery}
                    columns={{
                      columns: ReceiptsCols
                    }}
                    params={{
                      per_page: 1
                    }}
                  />
                </Card.Body>
              </Card>
            </Grid.Cell>
          </Grid>
        ) : (
          <>
            <TrialAlert />

            {plans && (
              <Plans
                plans={plans}
                title={t("billing.plans.plans_and_pricing_description")}
              />
            )}
          </>
        )}

        {!isEmpty(addons) ? (
          <Card className="mt-8 h-full">
            <Card.Header>
              <Typography.Paragraph
                children={t("billing.subscriptions.details")}
                weight="medium"
              />
            </Card.Header>

            <Card.Body className="flex flex-col gap-6">
              {addons
                .filter((addon) => addon.limit_type == "integer")
                .map((addon, i) => (
                  <div
                    className="flex w-full items-end gap-x-1"
                    key={i}
                  >
                    <Typography.Paragraph
                      as="span"
                      className="w-[130px]"
                      weight="bold"
                      children={addon?.title}
                    />
                    <Typography.Paragraph
                      as="div"
                      weight="normal"
                      className="w-full text-gray-800"
                      children={
                        <div>
                          <div className="mb-2 flex items-center gap-1">
                            <Typography.Paragraph
                              weight="medium"
                              size="md"
                              children={
                                <>
                                  {!addon.is_available ? "-" : addon.usage}
                                  {addon.limit_options?.unit && (
                                    <span
                                      children={addon.limit_options?.unit}
                                      className="uppercase"
                                    />
                                  )}
                                </>
                              }
                            />
                            <span>/</span>
                            <Typography.Paragraph
                              weight="medium"
                              className="text-xs"
                              children={
                                <>
                                  {!addon.is_available
                                    ? t("billing.subscriptions.unavailable")
                                    : addon.limit == "unlimited"
                                    ? t("billing.subscriptions.unlimited")
                                    : addon.limit ?? 0}

                                  {addon.limit_options?.unit && (
                                    <span
                                      children={addon.limit_options?.unit}
                                      className="uppercase"
                                    />
                                  )}
                                </>
                              }
                            />
                          </div>
                          <ProgressBar
                            value={
                              !addon.is_available
                                ? 1.5
                                : addon.limit != "unlimited"
                                ? (Number(addon.usage) / Number(addon.limit)) * 100
                                : 0
                            }
                            color="primary"
                          />
                        </div>
                      }
                    />
                  </div>
                ))}
            </Card.Body>
          </Card>
        ) : (
          ""
        )}
      </Layout.Container>
    </Layout>
  );
}
