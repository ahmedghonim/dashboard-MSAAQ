import React, { useContext, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";
import { Stars } from "react-bootstrap-icons";

import { UpgradeIcon } from "@/components/Icons/solid";
import { SubscriptionContext } from "@/contextes";
import { Plan } from "@/types";
import { classNames } from "@/utils";

import { ArrowUpLeftIcon } from "@heroicons/react/24/outline";

import { Alert, Button, Icon, Typography } from "@msaaqcom/abjad";

interface Props {
  children?: React.ReactNode;
  className?: string;
  demo?: boolean;
  isAvailable?: boolean;
}

export const UpgradeButton = () => (
  <Button
    as={Link}
    href={"/settings/billing/subscription/plans"}
    variant="gradient"
    size="sm"
    rounded
    icon={
      <Icon
        children={<ArrowUpLeftIcon />}
        size="sm"
      />
    }
    iconAlign="end"
    children={<Trans i18nKey={"billing.plans.upgrade_your_plan"} />}
  />
);

const NelcAddonController = ({ isAvailable, className, children, demo = false }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(!isAvailable ? "relative  mb-8 pb-10" : "", "h-full", className)}>
      <div className="border-gradient absolute inset-0 z-10 flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border bg-white/90 p-4">
        <div>
          <div className="flex h-9 w-9 rounded-full border bg-white">
            <UpgradeIcon className="m-auto" />
          </div>
        </div>

        <Typography.Paragraph
          size="lg"
          weight="medium"
          children={"الميزة غير متاحة!"}
        />

        <Typography.Paragraph
          children={"هذه الميزة متاحة فقط للباقات الأعلى. يمكنك الترقية إلى باقة أعلى بمميزات أفضل."}
        />

        <UpgradeButton />
      </div>

      <div
        className={classNames(!isAvailable && "pointer-events-none select-none opacity-50", "h-full")}
        children={children}
      />
    </div>
  );
};

export default NelcAddonController;
