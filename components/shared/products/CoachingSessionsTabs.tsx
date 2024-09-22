import { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const ProductTabs: FC<any> = ({ preview_url }: { preview_url: string }) => {
  const { isActive } = useIsRouteActive();
  const router = useRouter();
  const { t } = useTranslation();

  const { productId } = router.query;

  return (
    <Tabs preview_url={preview_url}>
      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions/[productId]/edit")}
        href={{
          pathname: "/coaching-sessions/[productId]/edit",
          query: { productId }
        }}
        children={t("coaching_sessions.tabs.session_content")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions/[productId]/settings")}
        href={{
          pathname: "/coaching-sessions/[productId]/settings",
          query: { productId }
        }}
        children={t("coaching_sessions.tabs.session_settings")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions/[productId]/pricing")}
        href={{
          pathname: "/coaching-sessions/[productId]/pricing",
          query: { productId }
        }}
        children={t("coaching_sessions.tabs.pricing")}
      />

      <Tabs.Link
        as={Link}
        active={isActive("/coaching-sessions/[productId]/publishing")}
        href={{
          pathname: "/coaching-sessions/[productId]/publishing",
          query: { productId }
        }}
        children={t("coaching_sessions.tabs.publishing")}
      />
    </Tabs>
  );
};

export default ProductTabs;
