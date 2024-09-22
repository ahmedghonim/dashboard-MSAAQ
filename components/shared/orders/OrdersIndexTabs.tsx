import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const OrdersIndexTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/orders")}
        href="/orders"
        children={t("sidebar.orders.title")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/orders/bank-transfers")}
        href="orders/bank-transfers"
        children={t("bank_transfers.title")}
      />
    </Tabs>
  );
};

export default OrdersIndexTabs;
