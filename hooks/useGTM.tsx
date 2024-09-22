import { useContext } from "react";

import { AuthContext } from "@/contextes";
import { Academy, DeepPartial, User } from "@/types";

type AuthType = {
  user?: DeepPartial<User>;
  tenant?: DeepPartial<Academy>;
};

type ReturnType = {
  sendGTMEvent: (event: string, payload?: object, auth?: AuthType) => boolean;
};

export enum GTM_PRODUCT_TYPES {
  COURSE = "course",
  SESSION = "session",
  DIGITAL = "digital",
  BUNDLE = "bundle"
}

export enum GTM_EVENTS {
  LOGIN = "login",
  SIGN_UP = "sign_up",
  SIGN_UP_PAGE_VIEWED = "sign_up_page_viewed",

  PRODUCT_CREATED = "product_created",
  PRODUCT_PUBLISHED = "product_published",
  ACADEMY_CREATED = "academy_created",
  USER_EMAIL_VERIFIED = "user_email_verified",

  // begins a tutorial during an on-boarding process
  TUTORIAL_BEGIN = "tutorial_begin",
  // completes a tutorial during an on-boarding process
  TUTORIAL_COMPLETE = "tutorial_complete",

  BEGIN_CHECKOUT = "begin_checkout",
  ADD_PAYMENT_INFO = "add_payment_info",
  PURCHASE = "purchase",
  SUBSCRIPTION_CREATED = "subscription_created",
  SUBSCRIPTION_UPGRADED = "subscription_upgraded",
  SUBSCRIPTION_DOWNGRADED = "subscription_downgraded",
  SUBSCRIPTION_CANCELED = "subscription_canceled",

  ENTITY_VERIFICATION_REQUESTED = "entity_verification_requested",

  MSAAQ_PAY_ACTIVATED = "msaaq_pay_activated",
  APP_INSTALLED = "app_installed"
}

export const useGTM = (): ReturnType => {
  const { user, current_academy } = useContext(AuthContext);

  const sendGTMEvent = (event: string, payload: object = {}, auth: AuthType = {}): boolean => {
    if (typeof window === "undefined") {
      return false;
    }

    // @ts-ignore
    const dataLayer = window?.dataLayer;
    if (!dataLayer) {
      return false;
    }

    let authData = {};
    if (user?.uuid || auth) {
      authData = {
        auth: {
          uuid: auth?.user?.uuid ?? user.uuid,
          email: auth?.user?.email ?? user.email,
          name: auth?.user?.name ?? user.name
        },
        tenant: {
          id: auth?.tenant?.id ?? current_academy?.id,
          domain: auth?.tenant?.domain ?? current_academy?.domain,
          on_trial: current_academy?.on_trial,
          on_grace_period: !!current_academy?.subscription?.on_grace_period,
          plan_name: current_academy?.subscription?.plan?.title ?? null,
          plan_interval: current_academy?.subscription?.price?.interval ?? null
        }
      };
    }

    try {
      return dataLayer.push({
        ...authData,
        event,
        eventModel: payload
      });
    } catch (e) {
      console.warn("GTM Error", e);

      return false;
    }
  };

  return { sendGTMEvent };
};
