import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const BillingTabs: FC = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/settings/billing/subscription")}
        href={{
          pathname: "/settings/billing/subscription"
        }}
        children={t("sidebar.settings.billing.subscriptions")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/billing/sms-bundles")}
        href={{
          pathname: "/settings/billing/sms-bundles"
        }}
        children={t("sidebar.settings.billing.sms_bundles")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/billing/invoices")}
        href={{
          pathname: "/settings/billing/invoices"
        }}
        children={t("sidebar.settings.billing.invoices")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/billing/payment-methods")}
        href={{
          pathname: "/settings/billing/payment-methods"
        }}
        children={t("sidebar.settings.billing.payment_methods")}
      />
    </Tabs>
  );
};

export default BillingTabs;
