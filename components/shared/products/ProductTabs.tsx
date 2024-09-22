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
        active={isActive("/products/[productId]/edit")}
        href={{
          pathname: "/products/[productId]/edit",
          query: { productId }
        }}
        children={t("products.tabs.product_content")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/products/[productId]/settings")}
        href={{
          pathname: "/products/[productId]/settings",
          query: { productId }
        }}
        children={t("products.tabs.product_settings")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/products/[productId]/pricing")}
        href={{
          pathname: "/products/[productId]/pricing",
          query: { productId }
        }}
        children={t("products.tabs.pricing")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/products/[productId]/publishing")}
        href={{
          pathname: "/products/[productId]/publishing",
          query: { productId }
        }}
        children={t("products.tabs.publishing")}
      />
    </Tabs>
  );
};

export default ProductTabs;
