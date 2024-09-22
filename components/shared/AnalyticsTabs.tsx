import { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

import { Badge } from "@msaaqcom/abjad";

const AnalyticsTabs: FC = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/analytics/products")}
        href={{
          pathname: "/analytics/products"
        }}
        children={t("analytics.products.main")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/analytics/earnings")}
        href={{
          pathname: "/analytics/earnings"
        }}
        children={t("analytics.earnings.main")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/analytics/customers")}
        href={{
          pathname: "/analytics/customers"
        }}
        children={t("analytics.customers.main")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/analytics/visits")}
        href={{
          pathname: "/analytics/visits"
        }}
        children={<span className="flex gap-2">{t("analytics.visits.main")}</span>}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/analytics/campaigns")}
        href={{
          pathname: "/analytics/campaigns"
        }}
        children={
          <span className="flex gap-2">
            {t("analytics.campaigns.main")}
            <Badge
              variant="success"
              size="xs"
              rounded
              children={t("new")}
            />
          </span>
        }
      />
    </Tabs>
  );
};

export default AnalyticsTabs;
