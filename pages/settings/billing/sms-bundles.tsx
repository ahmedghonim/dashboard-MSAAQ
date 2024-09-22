import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { UpgradeIcon } from "@/components/Icons/solid";
import BillingTabs from "@/components/settings/BillingTabs";
import { useToast } from "@/components/toast";
import { StripeContext } from "@/contextes/StripeContext";
import { GTM_EVENTS, useFormatPrice, useGTM, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCardsQuery } from "@/store/slices/api/billing/paymentMethodsSlice";
import {
  useFetchSmsBundlesQuery,
  usePurchaseSmsBundleMutation,
  useUpdateSmsSettingsMutation
} from "@/store/slices/api/smsSlice";
import { APIActionResponse, Plan } from "@/types";
import { randomUUID } from "@/utils";

import { Badge, Button, Form, Grid, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function SmsBundles() {
  const { t } = useTranslation();
  const { formatPrice, formatPriceWithoutCurrency } = useFormatPrice();

  const { toggleAddCard, handlePaymentError, setShowCheckoutAnimation } = useContext(StripeContext);
  const [toast] = useToast();
  const { sendGTMEvent } = useGTM();

  const [updateSmsSettingsMutation, { isLoading: isSubmitting }] = useUpdateSmsSettingsMutation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const { data, refetch } = useFetchSmsBundlesQuery();
  const [purchaseSmsBundle, { isLoading }] = usePurchaseSmsBundleMutation();
  const { data: cards } = useFetchCardsQuery();

  const [triggerOnCardCreated, setTriggerOnCardCreated] = useState<boolean | Plan["prices"][0]>(false);

  const { data: bundles, meta: settings } = data || {
    data: [],
    meta: {}
  };

  useEffect(() => {
    if (triggerOnCardCreated && cards?.data?.length) {
      handleCheckout(triggerOnCardCreated as Plan["prices"][0]);
    }
  }, [cards, triggerOnCardCreated]);

  const handleCheckout = async (plan: Plan["prices"][0]) => {
    if (!cards?.data?.length) {
      setTriggerOnCardCreated(plan);

      return toggleAddCard();
    }

    if (!triggerOnCardCreated) {
      if (
        !(await confirm({
          variant: "gradient",
          icon: <UpgradeIcon />,
          okLabel: t("billing.sms_bundles.buy"),
          title: settings?.sms_amount ? t("billing.sms_bundles.buy_extra_bundle") : t("billing.sms_bundles.buy"),
          children: t("billing.sms_bundles.you_will_be_charged", {
            price: formatPrice(plan.price, plan.currency)
          })
        }))
      ) {
        return;
      }
    }

    const GTMPayload = {
      transaction_id: randomUUID(),
      currency: plan.currency,
      value: plan.price / 100,
      coupon: null,
      items: [
        {
          // @ts-ignore
          item_id: `${plan?.slug}` ?? plan.id,
          // @ts-ignore
          item_name: plan?.title,
          price: plan.price / 100,
          quantity: 1
        }
      ]
    };

    sendGTMEvent(GTM_EVENTS.BEGIN_CHECKOUT, GTMPayload);

    setTriggerOnCardCreated(false);

    setShowCheckoutAnimation(true);

    const response = (await purchaseSmsBundle({
      // @ts-ignore
      plan_price_id: plan.price_id,
      card_id: cards.data.find((card) => card.is_default)?.id ?? null
    })) as APIActionResponse<any>;

    if (response?.error) {
      const paymentHandler = await handlePaymentError(response);

      if (!paymentHandler) {
        setShowCheckoutAnimation(false);

        return;
      }
    }

    sendGTMEvent(GTM_EVENTS.PURCHASE, GTMPayload);

    setTimeout(async () => {
      await refetch();

      setShowCheckoutAnimation(false);

      if (!displaySuccess(response)) {
        toast.success({
          message: "تم عملية الشراء بنجاح"
        });
      }
    }, 1500);
  };

  const enableSmsRef = useRef<any>();
  const handleEnableSms = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const { checked } = e.target;

    if (
      !(await confirm({
        title: t(`billing.sms_bundles.${checked ? "enable" : "disable"}_sms_alert_title`),
        variant: "warning",
        okLabel: t("continue"),
        cancelLabel: t("cancel"),
        children: (
          <Typography.Paragraph
            size="sm"
            children={t(`billing.sms_bundles.${checked ? "enable" : "disable"}_sms_alert_description`)}
          />
        )
      }))
    ) {
      if (enableSmsRef.current) {
        enableSmsRef.current.checked = !checked;
      }

      return;
    }

    const response = (await updateSmsSettingsMutation({
      sms_enabled: checked
    })) as APIActionResponse<any>;

    if (enableSmsRef.current) {
      enableSmsRef.current.checked = checked;
    }

    if (displayErrors(response)) {
      if (enableSmsRef.current) {
        enableSmsRef.current.checked = !checked;
      }

      return;
    }

    displaySuccess(response);
  };

  return (
    <Layout title={t("sidebar.settings.billing.sms_bundles")}>
      <BillingTabs />

      <Layout.Container>
        <Card className="mb-4">
          {settings.sms_enabled || settings.sms_amount ? (
            <Card.Body className="card-divide-x grid grid-cols-2 items-center">
              <Title
                reverse
                title={settings.sms_amount}
                subtitle={t("billing.sms_bundles.available_balance")}
              />

              <Form.Toggle
                ref={enableSmsRef}
                id={"sms_enabled"}
                checked={settings.sms_enabled}
                onChange={handleEnableSms}
                label={t("billing.sms_bundles.sms_enabled_label")}
                tooltip={t("billing.sms_bundles.sms_enabled_tooltip")}
              />
            </Card.Body>
          ) : (
            <Card.Body>
              <Typography.Subtitle
                size="sm"
                className="mb-2"
                children={t("billing.sms_bundles.banner.title")}
              />

              <Typography.Paragraph
                className="mt-2"
                children={t("billing.sms_bundles.banner.description")}
              />
            </Card.Body>
          )}
        </Card>

        <Typography.Paragraph
          children={t("billing.sms_bundles.available_bundles")}
          weight="bold"
          className="mb-4"
        />

        <Grid
          columns={{
            lg: 3,
            sm: 1
          }}
        >
          {bundles.map((plan, i) => (
            <Grid.Cell key={i}>
              <Card className="relative pt-6">
                {i === 1 && (
                  <div className="absolute -mt-4 ltr:ml-4 rtl:mr-4">
                    <Badge
                      variant="orange"
                      children={t("billing.sms_bundles.most_popular")}
                      size="sm"
                      rounded
                    />
                  </div>
                )}

                <Card.Body>
                  <div className="mb-6 flex items-center justify-between gap-1">
                    <Typography.Subtitle
                      children={plan.title}
                      weight="bold"
                      size="lg"
                    />

                    <Typography.Subtitle
                      children={formatPrice(plan.price, plan.currency)}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-baseline gap-2 rounded border bg-gray-50 p-2">
                    <Typography.Heading children={formatPriceWithoutCurrency(plan.amount * 100)} />
                    <Typography.Subtitle
                      children={t("billing.sms_bundles.message")}
                      size="sm"
                      weight="bold"
                    />
                  </div>
                </Card.Body>

                <Card.Actions>
                  <Button
                    className="w-full"
                    children={
                      settings?.sms_amount ? t("billing.sms_bundles.buy_extra_bundle") : t("billing.sms_bundles.buy")
                    }
                    variant={"primary"}
                    isLoading={isLoading}
                    disabled={isLoading}
                    onClick={() => handleCheckout(plan)}
                  />
                </Card.Actions>
              </Card>
            </Grid.Cell>
          ))}
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
