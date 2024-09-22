import React, { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { useTranslation } from "next-i18next";
import process from "process";

import { AddPaymentMethodModal } from "@/components";
import { useToast } from "@/components/toast";
import { AppContext } from "@/contextes/AppContext";
import { AuthContext } from "@/contextes/AuthContext";
import { GTM_EVENTS, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useFetchCardsQuery } from "@/store/slices/api/billing/paymentMethodsSlice";
import { APIActionResponse, Receipt, Subscription, SubscriptionStatus } from "@/types";

import { Typography } from "@msaaqcom/abjad";

const CheckoutAnimation = dynamic(() => import("@/components/checkout-animation"), {
  ssr: false
});

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  showPaymentMethodAlert: boolean;
  setShowCheckoutAnimation: Dispatch<SetStateAction<boolean>>;
  toggleAddCard: () => void;
  handleIncompletePayment: (receipt: Receipt) => any;
  handlePaymentError: (mutation: APIActionResponse<Subscription>) => any;
}

// Make sure to call `loadStripe` outside a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string, {
  locale: "ar"
});

// Pass the appearance object to the Elements instance
const options: StripeElementsOptions = {
  appearance: {
    theme: "stripe"
  }
};

const StripeContext = createContext<ContextProps>({} as ContextProps);

const StripeProvider: React.FC<ProviderProps> = ({ children }) => {
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const { setIsLoading } = useContext(AppContext);
  const { authenticated, current_academy, refetchAuth } = useContext(AuthContext);
  const { t } = useTranslation();
  const { data: cards } = useFetchCardsQuery(undefined, {
    skip: !authenticated
  });
  const { displayErrors } = useResponseToastHandler({});
  const [toast] = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showPaymentMethodAlert, setShowPaymentMethodAlert] = useState<boolean>(false);
  const [showCheckoutAnimation, setShowCheckoutAnimation] = useState<boolean>(false);

  useEffect(() => {
    if (!current_academy?.id) {
      setShowPaymentMethodAlert(false);

      return;
    }

    const hasPaymentMethod = cards?.data?.length ?? current_academy.has_payment_method;
    if (hasPaymentMethod || !current_academy.subscription?.id) {
      setShowPaymentMethodAlert(false);

      return;
    }

    if ([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING].includes(current_academy.subscription.status)) {
      setShowPaymentMethodAlert(true);
    }
  }, [current_academy, cards]);

  const handlePaymentError = async (mutation: APIActionResponse<Subscription>) => {
    const stripe = await stripePromise.then((stripe) => stripe);
    if (!stripe) {
      return;
    }

    // @ts-ignore
    const { payment_intent, status } = mutation?.error?.data ?? {};

    if (status == "requires_payment_method" || status == "requires_action") {
      const { error } = await stripe.confirmCardPayment(payment_intent.client_secret, {
        payment_method: payment_intent.payment_method_id ?? cards?.data?.find((card) => card.is_default)?.id
      });

      // @ts-ignore
      if (error || error?.message || error?.code) {
        let message =
          t(`billing.stripe_error_messages.${error?.decline_code}`, error.message) ??
          t(`billing.stripe_error_messages.${error.code}`, error.message);

        toast.error({
          message: message,
          dismissible: false
        });

        dispatch(apiSlice.util.invalidateTags(["receipts.index"]));

        await router.push("/settings/billing/invoices");

        return false;
      }

      return true;
    }

    displayErrors(mutation);

    return false;
  };

  const { sendGTMEvent } = useGTM();

  const handleIncompletePayment = async (receipt: Receipt) => {
    const defaultCard = cards?.data?.find((card) => card.is_default);
    if (!defaultCard?.id) {
      toggleAddCard();

      return;
    }

    const GTMPayload = {
      transaction_id: receipt?.id,
      currency: receipt?.currency,
      value: receipt?.total / 100,
      tax: receipt?.tax ? receipt.tax / 100 : 0,
      coupon: null,
      items: receipt?.items
        ? receipt.items.map((item) => ({
            item_id: item.id,
            item_name: item.description,
            price: item.amount / 100,
            quantity: item.quantity
          }))
        : []
    };

    sendGTMEvent(GTM_EVENTS.BEGIN_CHECKOUT, GTMPayload);

    setShowCheckoutAnimation(true);

    const handled = await handlePaymentError({
      error: {
        data: {
          status: "requires_action",
          payment_intent: {
            payment_method_id: defaultCard.id,
            ...receipt.payment_intent
          }
        }
      }
    } as any);

    if (handled) {
      toast.success({
        message: "تم دفع الفاتورة بنجاح"
      });

      sendGTMEvent(GTM_EVENTS.PURCHASE, GTMPayload);

      setTimeout(async () => {
        await refetchAuth();

        dispatch(apiSlice.util.invalidateTags(["receipts.index"]));

        setShowCheckoutAnimation(false);
      }, 1000);
    } else {
      setShowCheckoutAnimation(false);
    }
  };

  const toggleAddCard = () => {
    setShowAddCard(!showAddCard);
  };

  return (
    <StripeContext.Provider
      value={{
        showPaymentMethodAlert,
        setShowCheckoutAnimation,
        toggleAddCard,
        handlePaymentError,
        handleIncompletePayment
      }}
    >
      <Elements
        stripe={stripePromise}
        options={options}
      >
        {children}

        {authenticated && (
          <AddPaymentMethodModal
            open={showAddCard}
            onDismiss={() => setShowAddCard(false)}
          />
        )}
      </Elements>

      <CheckoutAnimation
        show={showCheckoutAnimation}
        children={
          <div className="flex flex-col justify-center text-center">
            <Typography.Paragraph
              className="dots-animate font-bold"
              children="الرجاءُ الانتظار، جارٍ إتمام العملية"
            />
          </div>
        }
      />
    </StripeContext.Provider>
  );
};

export { StripeProvider, StripeContext };
