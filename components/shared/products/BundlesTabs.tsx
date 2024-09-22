import React, { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

import { Badge } from "@msaaqcom/abjad";

const ProductTabs: FC<any> = ({ preview_url }: { preview_url: string }) => {
  const { isActive } = useIsRouteActive();
  const router = useRouter();
  const { t } = useTranslation();
  const { productId } = router.query;

  return (
    <Tabs preview_url={preview_url}>
      <Tabs.Link
        as={Link}
        active={isActive("/bundles/[productId]/edit")}
        href={{
          pathname: "/bundles/[productId]/edit",
          query: { productId }
        }}
        children={t("bundles.tabs.bundle_content")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/bundles/[productId]/settings")}
        href={{
          pathname: "/bundles/[productId]/settings",
          query: { productId }
        }}
        children={t("bundles.tabs.bundle_settings")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/bundles/[productId]/pricing")}
        href={{
          pathname: "/bundles/[productId]/pricing",
          query: { productId }
        }}
        children={t("bundles.tabs.pricing")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/bundles/[productId]/publishing")}
        href={{
          pathname: "/bundles/[productId]/publishing",
          query: { productId }
        }}
        children={t("bundles.tabs.publishing")}
      />
    </Tabs>
  );
};

export default ProductTabs;
