import { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const AffiliatesIndexTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { route } = useRouter();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/affiliates")}
        href="/affiliates"
        children={t("sidebar.affiliates.title")}
      />
      <Tabs.Link
        as={Link}
        active={route.includes("/affiliates/payouts")}
        href="/affiliates/payouts"
        children={t("sidebar.affiliates.payouts")}
      />
    </Tabs>
  );
};

export default AffiliatesIndexTabs;
