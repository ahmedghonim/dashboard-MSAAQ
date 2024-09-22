import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { AuthContext } from "@/contextes/AuthContext";
import { Addon, Receipt, Subscription, SubscriptionStatus } from "@/types";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  subscription: Subscription | undefined;
  incompletePayment: Receipt | null;
  canUseOffer: boolean;
  isAddonAvailable: (slug: Addon | string) => boolean;
  getAddon: (slug: string) => Addon | null;
}

const SubscriptionContext = createContext<ContextProps>({} as ContextProps);

const SubscriptionProvider: React.FC<ProviderProps> = ({ children }) => {
  const router = useRouter();
  const { current_academy, authenticated } = useContext(AuthContext);
  const subscription = useMemo(() => current_academy.subscription, [current_academy.subscription]);
  const addons = useMemo(() => current_academy.addons, [current_academy.addons]);
  const [canUseOffer, setCanUseOffer] = useState<boolean>(false);

  const [incompletePayment, setIncompletePayment] = useState<Receipt | null>(null);
  useEffect(() => {
    if (!current_academy?.incomplete_payments?.length) {
      return;
    }

    setIncompletePayment(current_academy.incomplete_payments[0]);

    return () => {
      setIncompletePayment(null);
    };
  }, [current_academy?.incomplete_payments]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    if (current_academy.on_trial || subscription?.on_grace_period) {
      return;
    }

    if (router.pathname.includes("/settings/billing")) {
      return;
    }

    if (current_academy.incomplete_payments.length > 1) {
      router.push("/settings/billing/invoices");
      return;
    }

    if (
      ![SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE].includes(
        subscription?.status as SubscriptionStatus
      ) &&
      !router.pathname.startsWith("/affiliates")
    ) {
      router.push("/settings/billing/subscription");
    }
  }, [subscription, router.pathname, authenticated]);

  const getAddon = (addonSlug: string): Addon | null => {
    if (!addons) {
      return null;
    }

    return addons.find((addon) => addon.slug === addonSlug) ?? null;
  };

  const isAddonAvailable = (addonSlug: Addon | string) => {
    if (current_academy.on_trial) {
      return true;
    }

    if (!addons) {
      return false;
    }

    let addon: Addon | null;
    if (typeof addonSlug === "object") {
      addon = addonSlug;
    } else {
      addon = getAddon(addonSlug);
    }

    if (!addon) {
      return true;
    }

    return addon.is_available;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: subscription ?? ({} as Subscription),
        incompletePayment,
        canUseOffer,
        isAddonAvailable,
        getAddon
      }}
      children={children}
    />
  );
};

export { SubscriptionContext, SubscriptionProvider };
