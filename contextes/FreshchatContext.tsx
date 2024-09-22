import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

import Script from "next/script";

import { i18n } from "next-i18next";

import { AuthContext } from "@/contextes/AuthContext";
import { SubscriptionContext } from "@/contextes/SubscriptionContext";
import { isCustomizedDomain } from "@/hooks";
import { useUpdateAuthMutation } from "@/store/slices/api/authSlice";

interface ProviderProps {
  children: ReactNode;
}

interface ContextProps {
  freshchat: any;
  isChatOpen: () => boolean;
  openChat: (values?: { message?: string | undefined } | any) => void;
  closeChat: () => void;
  logout: () => Promise<boolean>;
  setChatLocale: (locale: string) => void;
}

const FreshchatContext = createContext({} as ContextProps);

const FreshchatProvider: React.FC<ProviderProps> = ({ children }) => {
  const { authenticated, user, current_academy } = useContext(AuthContext);
  const { subscription } = useContext(SubscriptionContext);

  const [freshchat, setFreshchat] = useState<any>();

  useEffect(() => {
    // @ts-ignore
    window.fcWidgetMessengerConfig = {
      locale: i18n?.language ?? "ar",
      externalId: user?.uuid ?? null,
      restoreId: user?.freshchat_id ?? null
    };
  }, [user]);

  useEffect(() => {
    if (!freshchat) {
      return;
    }

    freshchat.on("user:created", userCreated);

    freshchat.user
      .get()
      .then(userCreated)
      .catch((e: any) => {});
  }, [freshchat]);

  useEffect(() => {
    if (!freshchat || !authenticated) {
      return;
    }

    if (user?.uuid) {
      freshchat.setExternalId(user.uuid);
    }

    freshchat.user.setFirstName(user.name?.split(" ")[0]);

    freshchat.user.setEmail(user.email);

    freshchat.user.setPhoneCountryCode(user.country_code);
    freshchat.user.setPhone(user.phone);

    let data: { [key: string]: string | number } = {
      cf_user_id: user.id,
      cf_current_academy_id: current_academy?.id ?? "N/A",
      cf_academy_domain: current_academy?.domain ?? "N/A",
      cf_on_trial: current_academy?.on_trial ? "Yes" : "No",
      cf_on_grace_period: subscription?.on_grace_period ? "Yes" : "No",
      cf_plan: subscription?.plan?.title ?? "N/A"
    };

    try {
      freshchat.user.setProperties(data);
    } catch (e) {}
  }, [freshchat, authenticated, current_academy, user]);

  const [updateAuthMutation] = useUpdateAuthMutation();

  const userCreated = async ({ data }: any) => {
    if (!data?.restoreId) {
      return;
    }

    if (!authenticated) {
      return;
    }

    if (user.freshchat_id) {
      return;
    }

    await updateAuthMutation({
      freshchat_id: data.restoreId
    });
  };

  useEffect(() => {
    setChatLocale(i18n?.language ?? "ar");
  }, [i18n?.language]);

  const setChatLocale = (locale: string) => freshchat?.user?.setLocale(locale);

  return (
    <FreshchatContext.Provider
      value={{
        freshchat,
        isChatOpen: (): boolean => freshchat?.isOpen(),
        setChatLocale,
        openChat: (values: { message?: string | undefined } | any = {}) =>
          freshchat?.open({
            replyText: values?.message,
            ...values
          }),
        closeChat: () => freshchat?.close(),
        logout: async () => {
          if (!freshchat?.user) {
            return false;
          }

          return await freshchat.user.clear().then(
            () => true,
            () => false
          );
        }
      }}
    >
      {!isCustomizedDomain() && process.env.NEXT_PUBLIC_FRESHCHAT_EMBED_URL && (
        <Script
          async
          src="//fw-cdn.com/11447170/4115132.js"
          key="init-freshchat"
          onLoad={() => {
            // @ts-ignore
            window.fwcrm.on("widget:loaded", () => {
              // @ts-ignore
              setFreshchat(window?.fcWidget);
            });
          }}
        />
      )}

      {children}
    </FreshchatContext.Provider>
  );
};
export { FreshchatContext, FreshchatProvider };
