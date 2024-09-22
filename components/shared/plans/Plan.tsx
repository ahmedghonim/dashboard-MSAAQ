import { useCallback, useContext, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useStripe } from "@stripe/react-stripe-js";
import { sortBy } from "lodash";
import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { UpgradeIcon } from "@/components/Icons/solid";
import CancelSubscriptionModal from "@/components/modals/CancelSubscriptionModal";
import PromoModal from "@/components/modals/PromoModal";
import { useToast } from "@/components/toast";
import { AppContext, AuthContext, SubscriptionContext } from "@/contextes";
import { StripeContext } from "@/contextes/StripeContext";
import { GTM_EVENTS, useFormatPrice, useGTM, useResponseToastHandler } from "@/hooks";
import { useFetchCardsQuery } from "@/store/slices/api/billing/paymentMethodsSlice";
import { useCreateSubscriptionMutation } from "@/store/slices/api/billing/stripeSlice";
import {
  useSwapSubscriptionMutation,
  useUnpauseSubscriptionMutation
} from "@/store/slices/api/billing/subscriptionsSlice";
import { APIActionResponse, Addon, Plan as PlanModel, Plans, Subscription, SubscriptionStatus } from "@/types";
import { classNames, randomUUID } from "@/utils";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Icon, Typography } from "@msaaqcom/abjad";

interface Props {
  plan: PlanModel;
  interval: "monthly" | "yearly";
  manageSubscription?: boolean;
}

export const Plan = ({ plan, interval, manageSubscription = false }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPrice } = useFormatPrice();
  const { isLoading: isAppLoading } = useContext(AppContext);
  const [unpauseSubscriptionMutation, { isLoading: isUnpauseLoading }] = useUnpauseSubscriptionMutation();
  const [swapSubscriptionMutation, { isLoading: isSwapLoading }] = useSwapSubscriptionMutation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const { current_academy, refetchAuth } = useContext(AuthContext);
  const { canUseOffer } = useContext(SubscriptionContext);
  const { toggleAddCard, handlePaymentError, setShowCheckoutAnimation } = useContext(StripeContext);
  const subscription = current_academy.subscription ?? ({} as Subscription);
  const [createSubscriptionMutation] = useCreateSubscriptionMutation();
  const { data: cards } = useFetchCardsQuery();
  const [toast] = useToast();
  const stripe = useStripe();
  const { sendGTMEvent } = useGTM();
  const [triggerSubscribeOnCardCreated, setTriggerSubscribeOnCardCreated] = useState<boolean>(false);
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<any>(null);

  const isLoading = isUnpauseLoading || isSwapLoading || isAppLoading;

  const planWeight = (planObject: Omit<PlanModel, "prices"> | undefined) => {
    switch (planObject?.slug) {
      case Plans.BASIC:
        return 1;
      case Plans.GROWTH:
        return 2;
      case Plans.PRO:
        return 3;
    }

    return 1;
  };

  const action =
    !subscription?.id || subscription?.status == SubscriptionStatus.CANCELLED
      ? "subscribe"
      : subscription?.plan?.id === plan.id && interval === subscription?.price?.interval
      ? "current"
      : planWeight(subscription?.plan) <= planWeight(plan)
      ? "upgrade"
      : "downgrade";

  const buttonLabel = {
    subscribe: canUseOffer ? "billing.plans.get_offer_now" : "billing.plans.subscribe",
    current: canUseOffer ? "billing.plans.get_offer_now" : "billing.plans.current_plan",
    downgrade: canUseOffer ? "billing.plans.get_offer_now" : `billing.plans.downgrade_plan_to.${plan.slug}`,
    upgrade: canUseOffer ? "billing.plans.get_offer_now" : "billing.plans.upgrade_your_plan"
  };

  const isCurrentPlan = subscription?.plan?.id === plan.id;

  const getPlanColor = (plan: PlanModel) => {
    switch (plan.slug) {
      case Plans.GROWTH:
        return "text-orange";
      case Plans.PRO:
        return "text-purple";
    }
  };

  useEffect(() => {
    if (triggerSubscribeOnCardCreated && cards?.data?.length) {
      setShowPromoModal(true);
    }
  }, [cards, triggerSubscribeOnCardCreated]);

  const handleSwap = async (code?: any) => {
    if (
      !(await confirm({
        variant: action === "upgrade" ? "gradient" : "warning",
        icon: action === "upgrade" && <UpgradeIcon />,
        okLabel: action === "upgrade" ? t("billing.plans.upgrade_plan") : t("billing.plans.downgrade_plan"),
        cancelLabel: action === "downgrade" ? t("cancel") : undefined,
        title: t(`billing.plans.swap_confirmation.${action}_title`),
        children: t(`billing.plans.swap_confirmation.${action}_description`)
      }))
    ) {
      return;
    }

    const price = plan.prices.find((price) => price.interval === interval);
    if (!price) {
      return;
    }
    setShowCheckoutAnimation(true);

    const response = (await swapSubscriptionMutation({
      plan_price_id: price.id,
      promo_code_id: code?.promo_code?.id
    })) as APIActionResponse<Subscription>;

    if (response?.error) {
      const paymentHandler = await handlePaymentError(response);

      setShowCheckoutAnimation(false);

      if (!paymentHandler) {
        return;
      }
    }

    sendGTMEvent(action === "upgrade" ? GTM_EVENTS.SUBSCRIPTION_UPGRADED : GTM_EVENTS.SUBSCRIPTION_DOWNGRADED, {
      old_plan: `${subscription?.plan?.slug}-${subscription?.price?.interval}` ?? subscription?.price.id,
      new_plan: `${plan.slug}-${price.interval}` ?? price.id
    });

    setTimeout(async () => {
      await refetchAuth();

      setShowCheckoutAnimation(false);

      if (!displaySuccess(response)) {
        toast.success({
          // @ts-ignore
          message: response?.error?.data?.success_message ?? "تم تغير الباقة بنجاح."
        });
      }
    }, 1000);
  };

  const handleSubscribe = async (code?: any) => {
    if (action === "current" && !canUseOffer) return;

    if (action === "downgrade" || action === "upgrade") {
      return handleSwap(code);
    }

    const price = plan.prices.find((price) => price.interval === interval);
    if (!price) return;

    if (!stripe) {
      return;
    }

    if (!cards?.data?.length) {
      setTriggerSubscribeOnCardCreated(false);

      toggleAddCard();
      return;
    }

    const GTMPayload = {
      transaction_id: randomUUID(),
      currency: price.currency,
      value: price.price / 100,
      coupon: null,
      items: [
        {
          item_id: `${plan.slug}-${price.interval}` ?? price.id,
          item_name: plan.title,
          price: price.price / 100,
          quantity: 1
        }
      ]
    };

    sendGTMEvent(GTM_EVENTS.BEGIN_CHECKOUT, GTMPayload);

    setTriggerSubscribeOnCardCreated(false);
    setShowPromoModal(false);

    setShowCheckoutAnimation(true);

    const response = (await createSubscriptionMutation({
      plan_price_id: price.id,
      offer: canUseOffer,
      promo_code_id: code?.promo_code?.id,
      card_id: cards.data.find((card) => card.is_default)?.id ?? null
    })) as APIActionResponse<Subscription>;

    if (response?.error) {
      const paymentHandler = await handlePaymentError(response);

      if (!paymentHandler) {
        setTimeout(async () => {
          await refetchAuth();

          setShowCheckoutAnimation(false);
        }, 1000);

        return;
      }
    }

    sendGTMEvent(GTM_EVENTS.PURCHASE, {
      ...GTMPayload,
      transaction_id: response?.data?.data?.id ?? GTMPayload.transaction_id
    });

    sendGTMEvent(GTM_EVENTS.SUBSCRIPTION_CREATED, {
      ...GTMPayload,
      transaction_id: response?.data?.data?.id ?? GTMPayload.transaction_id
    });

    setTimeout(async () => {
      await refetchAuth();

      setShowCheckoutAnimation(false);

      if (!displaySuccess(response)) {
        toast.success({
          // @ts-ignore
          message: response?.error?.data?.success_message ?? "مبروك! تم الاشتراك بنجاح 🚀"
        });
      }
    }, 1000);
  };

  const handlePastDue = async () => {
    if (!subscription?.payment_intent || !stripe) {
      await router.push("/settings/billing/invoices");
      return;
    }

    setShowCheckoutAnimation(true);

    const { error } = await stripe.confirmCardPayment(subscription.payment_intent.client_secret, {
      payment_method: subscription.payment_intent.payment_method_id ?? cards?.data?.find((card) => card.is_default)?.id
    });

    setTimeout(async () => {
      setShowCheckoutAnimation(false);

      await refetchAuth();
    }, 1000);

    // @ts-ignore
    if (error || error?.message || error?.code) {
      let message =
        t(`billing.stripe_error_messages.${error?.decline_code}`, error.message) ??
        t(`billing.stripe_error_messages.${error.code}`, error.message);

      toast.error({
        message: message,
        dismissible: false
      });
    }
  };

  const resumeSubscription = async () => {
    const response = (await unpauseSubscriptionMutation({
      id: subscription.id
    })) as APIActionResponse<Subscription>;

    if (displayErrors(response)) {
      return;
    }

    setTimeout(async () => {
      await refetchAuth();

      displaySuccess(response);
    }, 1000);
  };

  const PlanPrice = useCallback(() => {
    let prices: any = {};
    plan?.prices?.map((price) => {
      prices = { ...prices, [price.interval]: price };
    });

    return interval === "yearly" ? (
      <div>
        <Typography.Paragraph>
          <s className="text-gray-700">{formatPrice(prices?.monthly?.price, prices?.monthly?.currency, "symbol")}</s>{" "}
          <span className={getPlanColor(plan)}>
            {formatPrice(Math.round(prices?.yearly?.price / 100 / 12) * 100, prices?.yearly?.currency, "symbol")}{" "}
            {t("billing.plans.intervals.monthly")} ({t("billing.plans.on_yearly_payment")})
          </span>
        </Typography.Paragraph>

        <Typography.Paragraph
          size="lg"
          weight="medium"
          className={getPlanColor(plan) + "-800"}
        >
          {formatPrice(prices?.yearly?.price, prices?.yearly?.currency)}
          {"/"}
          {t(`billing.plans.intervals.yearly`)}
        </Typography.Paragraph>
      </div>
    ) : (
      <Typography.Paragraph
        weight="medium"
        className={getPlanColor(plan)}
        size="lg"
        children={
          formatPrice(prices[interval].price, prices[interval].currency) +
          " " +
          t(`billing.plans.intervals.${interval}`)
        }
      />
    );
  }, [plan, interval]);

  return (
    <Card className="h-full">
      <Card.Body>
        <div className="flex justify-between gap-4">
          <Image
            src={`/images/subscription/${plan.slug}.svg`}
            alt={plan.title}
            width={plan.slug == Plans.ADVANCED ? 60 : 40}
            height={plan.slug == Plans.ADVANCED ? 60 : 40}
            className="pointer-events-none mb-6"
          />

          {!manageSubscription && plan.slug === Plans.GROWTH && (
            <div>
              <Badge
                children={t("billing.plans.growth_plan_yearly_discount", { discount: "35%" })}
                variant="orange"
                size="sm"
                rounded
              />
            </div>
          )}

          {canUseOffer && action === "current" && (
            <div>
              <Badge
                children={"الباقة الحالية"}
                variant="purple"
                size="sm"
                rounded
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Subtitle
            children={plan.title}
            weight="bold"
            className={getPlanColor(plan)}
          />

          {plan?.prices?.length > 1 && <PlanPrice />}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {sortBy(
            plan.addons.filter((item) => !!item.described_title),
            (addon: Addon) => addon.sort
          ).map((addon, i) => (
            <div
              className={classNames("flex items-center gap-2", !addon.is_available && "opacity-50")}
              key={i}
            >
              <Icon
                children={
                  addon.is_available ? (
                    plan.slug === Plans.PRO ? (
                      <CheckBadgeIcon />
                    ) : (
                      <CheckCircleIcon />
                    )
                  ) : (
                    <XCircleIcon />
                  )
                }
                className={getPlanColor(plan)}
              />

              <Typography.Paragraph
                children={addon.described_title || addon.title}
                className="text-gary-950"
              />
            </div>
          ))}

          {manageSubscription && (
            <div className={classNames("flex items-center gap-2")}>
              <Button
                as={Link}
                href="/settings/billing/subscription/plans"
                variant="link"
                size="sm"
                children={t("billing.plans.see_all_features")}
              />
            </div>
          )}
        </div>
      </Card.Body>

      {plan.slug !== Plans.ADVANCED && (
        <Card.Actions className="flex-col gap-2">
          {!manageSubscription && (
            <Button
              children={t(buttonLabel[action ?? "subscribe"], {
                plan: plan.title
              })}
              className="w-full"
              variant={canUseOffer ? "primary" : action === "subscribe" || action === "upgrade" ? "primary" : "default"}
              outline={action === "downgrade"}
              disabled={action === "current" && !canUseOffer}
              isLoading={isLoading}
              onClick={() => {
                if (cards?.data?.length) {
                  setShowPromoModal(true);
                } else {
                  setTriggerSubscribeOnCardCreated(true);
                  toggleAddCard();
                }
              }}
            />
          )}
          {/* handleSubscribe() */}
          <PromoModal
            plan={plan}
            onDismiss={() => {
              setShowPromoModal(false);
            }}
            onPromoCodeSubmit={(code: any) => {
              setPromoCode(code);
            }}
            interval={interval}
            handleSubscribeSubmit={(code: any) => handleSubscribe(code)}
            open={showPromoModal}
          />

          {manageSubscription && (
            <>
              {subscription?.status === SubscriptionStatus.CANCELLED && (
                <Button
                  children={t(buttonLabel["subscribe"])}
                  className="w-full"
                  variant={"primary"}
                  isLoading={isLoading}
                  onClick={() => handleSubscribe()}
                />
              )}

              {isCurrentPlan && (
                <>
                  {subscription.on_grace_period && (
                    <>
                      <Button
                        children={t("billing.plans.resume_subscription")}
                        className="w-full"
                        variant={"primary"}
                        isLoading={isLoading}
                        onClick={() => resumeSubscription()}
                      />

                      <Button
                        as={Link}
                        href="/settings/billing/subscription/plans"
                        children={t("billing.plans.go_all_plans")}
                        className="w-full"
                        isLoading={isLoading}
                        variant={"default"}
                      />
                    </>
                  )}

                  {!subscription.on_grace_period && (
                    <>
                      {[SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE].includes(subscription.status) && (
                        <Button
                          as={Link}
                          href="/settings/billing/subscription/plans"
                          children={t("billing.plans.upgrade_plan")}
                          className="w-full"
                          variant={"primary"}
                          isLoading={isLoading}
                        />
                      )}

                      {subscription.status === SubscriptionStatus.PAST_DUE && (
                        <Button
                          children={t("billing.plans.pay_now")}
                          className="w-full"
                          variant={"primary"}
                          isLoading={isLoading}
                          onClick={() => handlePastDue()}
                        />
                      )}

                      {[SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.INCOMPLETE].includes(
                        subscription.status
                      ) && <CancelSubscriptionModal subscription={subscription} />}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Card.Actions>
      )}
    </Card>
  );
};
