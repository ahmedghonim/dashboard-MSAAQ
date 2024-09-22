import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const AffiliatesIndexTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/marketing/affiliates/payouts")}
        href="/marketing/affiliates/payouts"
        children={t("marketing.affiliates.payouts")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/marketing/affiliates/settings")}
        href="/marketing/affiliates/settings"
        children={t("marketing.affiliates.settings")}
      />
    </Tabs>
  );
};

export default AffiliatesIndexTabs;
