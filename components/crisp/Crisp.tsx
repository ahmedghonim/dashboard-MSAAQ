import { useContext, useEffect, useState } from "react";

import * as Sentry from "@sentry/nextjs";
import { Crisp as CrispSDK } from "crisp-sdk-web";

import { AuthContext, SubscriptionContext } from "@/contextes";

const Crisp = () => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const { authenticated, user, current_academy, academies } = useContext(AuthContext);
  const { subscription } = useContext(SubscriptionContext);
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  useEffect(() => {
    if (!websiteId) {
      return;
    }

    CrispSDK.configure(websiteId, {
      tokenId: authenticated ? user.uuid : undefined,
      safeMode: true
    });

    CrispSDK.session.onLoaded(() => setLoaded(true));
  }, [websiteId]);

  useEffect(() => {
    if (!loaded || !authenticated) {
      return;
    }

    if (user.uuid) {
      CrispSDK.setTokenId(user.uuid);
    }

    CrispSDK.user.setEmail(user.email);
    CrispSDK.user.setNickname(user.name);

    let data: { [key: string]: string | number } = {
      user_id: user.id,
      current_academy_id: current_academy?.id ?? "N/A",
      on_trial: current_academy?.on_trial ? "Yes" : "No",
      on_grace_period: subscription?.on_grace_period ? "Yes" : "No",
      plan: subscription?.plan?.title ?? "N/A"
    };

    if (academies?.length) {
      academies.forEach((academy) => {
        data[`academy_${academy.id}`] = academy.domain;
      });
    }

    try {
      CrispSDK.session.setData(data);
    } catch (e) {
      Sentry.withScope((scope) => {
        scope.setExtra("data", data);
        Sentry.captureException(e);
      });
    }
  }, [loaded, authenticated, current_academy, user]);

  return null;
};

export default Crisp;
