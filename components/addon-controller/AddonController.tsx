import React, { useContext, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";
import { Stars } from "react-bootstrap-icons";

import { UpgradeIcon } from "@/components/Icons/solid";
import { FreshchatContext, SubscriptionContext } from "@/contextes";
import { Plan } from "@/types";
import { classNames } from "@/utils";

import { ArrowUpLeftIcon } from "@heroicons/react/24/outline";

import { Alert, Button, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

interface Props {
  type?: Plan["addons"][0]["level"];
  addon: Plan["addons"][0]["slug"];
  children?: React.ReactNode;
  className?: string;
  demo?: boolean;
  by_request?: boolean;
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

const AddonController = ({
  type: providedType,
  children,
  addon: addonSlug,
  className,
  by_request = false,
  demo = false
}: Props) => {
  const { t } = useTranslation();
  const { isAddonAvailable, getAddon } = useContext(SubscriptionContext);
  const [type, setType] = useState<Props["type"]>(providedType);
  const addon = useMemo(() => getAddon(addonSlug), [addonSlug]);
  const isAvailable = useMemo(() => (demo ? false : addon ? isAddonAvailable(addon) : true), [addon, demo]);

  useEffect(() => {
    setType(providedType ?? addon?.level);
  }, [providedType]);

  const { openChat } = useContext(FreshchatContext);
  if (!isAvailable && type == "button") {
    return (
      <Tooltip>
        <Tooltip.Trigger>
          <div className="pointer-events-none relative select-none">
            <div className="absolute inset-0 z-10 flex items-center gap-2 rounded-md border bg-white/90 pr-3">
              <div className="h-6 w-6 rounded-full bg-white">
                <UpgradeIcon className="m-auto" />
              </div>
            </div>
            {children}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Typography.Paragraph
            size="sm"
            children={t("billing.plans.addon_is_available_in_higher_plan")}
          />
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return addon?.level == "mini" && !isAvailable ? (
    <div className="flex items-center justify-between">
      <div className="pointer-events-none">{children}</div>
      <UpgradeButton />
    </div>
  ) : (
    <div className={classNames(!isAvailable ? "relative mb-12 px-3 pb-10 pt-3" : "", "h-full", className)}>
      {!isAvailable && (addon?.level === "page" || type === "page") && (
        <Alert
          dismissible
          variant="gradient"
          className="mb-4"
          icon={<Icon children={<Stars />} />}
          title={t("billing.plans.you_need_to_upgrade")}
          actions={<UpgradeButton />}
        >
          {t("billing.plans.you_need_to_upgrade_description")}
        </Alert>
      )}
      {!isAvailable && (
        <>
          {type === "item" && !by_request && (
            <div
              className={classNames(
                "border-gradient bg-gradient absolute inset-0 flex min-h-[100px] flex-col rounded-lg border p-4",
                !addonSlug.includes("apps.") && "-m-4"
              )}
            >
              <div className="-mt-8 flex h-9 w-9 rounded-full border bg-white rtl:mr-auto">
                <UpgradeIcon className="m-auto" />
              </div>

              <div className="mt-auto">
                <UpgradeButton />
              </div>
            </div>
          )}

          {type === "block" && (
            <div className="border-gradient absolute inset-0 z-10 flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border bg-white/90 p-4">
              <div>
                <div className="flex h-9 w-9 rounded-full border bg-white">
                  <UpgradeIcon className="m-auto" />
                </div>
              </div>

              <Typography.Paragraph
                size="lg"
                weight="medium"
                children={t("billing.plans.addon_is_not_available")}
              />

              <Typography.Paragraph children={t("billing.plans.addon_is_available_in_higher_plan")} />

              <UpgradeButton />
            </div>
          )}
        </>
      )}
      {!isAvailable && type === "item" && by_request ? (
        <div className="relative mb-3 rounded-2xl border border-purple p-4">
          <div className="absolute -top-4 left-4 ">
            <div className=" flex items-center justify-center rounded-full bg-white p-2">
              <Icon>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.3214 9.62758C9.58931 10.5588 8.52853 14.0095 10.2739 16.3129C11.384 17.7869 13.3668 18.3978 15.1152 17.7993C16.8421 17.2103 18.0354 15.5389 18.0354 13.7134C18.0354 10.8025 15.0813 8.68398 12.3214 9.62758ZM15.4143 14.4843H14.4892V15.4094C14.4892 16.4024 12.9474 16.4024 12.9474 15.4094V14.4843H12.0223C11.0294 14.4843 11.0294 12.9425 12.0223 12.9425H12.9474V12.0174C12.9474 11.0245 14.4892 11.0245 14.4892 12.0174V12.9425H15.4143C16.4073 12.9425 16.4073 14.4843 15.4143 14.4843Z"
                    fill="#9D76ED"
                  />
                  <path
                    d="M6.93473 16.7973H9.86729C8.23912 14.7621 8.51048 11.7185 10.4686 10.0009C12.2448 8.44365 14.9615 8.38846 16.8024 9.86213V6.92958C16.8024 5.90889 15.9729 5.07939 14.9522 5.07939H12.8924C13.1884 4.45957 13.1699 3.73492 12.843 3.13052C12.3003 2.12216 11.0237 1.71204 9.9968 2.21467C8.94836 2.72656 8.49198 4.02478 8.99461 5.07939H6.93473C5.91405 5.07939 5.08454 5.90889 5.08454 6.92958V8.68109C4.11011 8.21855 2.90748 8.56392 2.33392 9.47976C1.71411 10.4634 2.00397 11.8017 2.98149 12.4404C3.61056 12.8474 4.40614 12.9029 5.08454 12.5791V14.9471C5.08454 15.9678 5.91405 16.7973 6.93473 16.7973Z"
                    fill="#9D76ED"
                  />
                </svg>
              </Icon>
            </div>
          </div>
          <div className="pointer-events-none select-none">
            <div className="mb-4 flex items-center gap-2">
              <Icon>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.11019 8.45028V5.89577C4.1109 5.41862 4.30076 4.96122 4.63815 4.62383C4.97554 4.28644 5.43294 4.09658 5.91008 4.09588H8.46459C9.08855 1.29072 13.0296 1.31205 13.6456 4.09588H16.2001C16.6773 4.09658 17.1347 4.28644 17.472 4.62383C17.8094 4.96122 17.9993 5.41862 18 5.89577V8.91958C18 9.06102 17.9438 9.19667 17.8438 9.29668C17.7438 9.39669 17.6081 9.45288 17.4667 9.45288C15.3868 9.51421 15.3788 12.53 17.4667 12.6074C17.6081 12.6074 17.7438 12.6635 17.8438 12.7636C17.9438 12.8636 18 12.9992 18 13.1407V16.1858C17.9993 16.6629 17.8094 17.1203 17.472 17.4577C17.1347 17.7951 16.6773 17.985 16.2001 17.9857H13.1656C13.0242 17.9857 12.8885 17.9295 12.7885 17.8295C12.6885 17.7295 12.6323 17.5938 12.6323 17.4524C12.555 15.3698 9.54186 15.3832 9.47786 17.4524C9.47786 17.5938 9.42167 17.7295 9.32166 17.8295C9.22165 17.9295 9.086 17.9857 8.94456 17.9857H5.91008C5.43294 17.985 4.97554 17.7951 4.63815 17.4577C4.30076 17.1203 4.1109 16.6629 4.11019 16.1858V13.6313C3.51411 13.5082 2.97872 13.1833 2.59431 12.7114C2.2099 12.2395 2 11.6494 2 11.0408C2 10.4321 2.2099 9.84209 2.59431 9.37018C2.97872 8.89827 3.51411 8.57337 4.11019 8.45028Z"
                    fill="#9D76ED"
                  />
                </svg>
              </Icon>
              <Typography.Paragraph
                size="md"
                className="!font-semibold text-purple"
              >
                {t("billing.plans.available_upgrades")}
              </Typography.Paragraph>
            </div>
            {children}
          </div>
          <Button
            className="mt-4 bg-purple text-white hover:bg-purple-600"
            size="sm"
            onClick={() => openChat()}
            rounded
            icon={
              <Icon
                children={<ArrowUpLeftIcon />}
                size="sm"
              />
            }
            iconAlign="end"
            children={<Trans i18nKey={"billing.plans.request_upgrade"} />}
          />
        </div>
      ) : (
        <div
          className={classNames(
            !isAvailable && "pointer-events-none select-none",
            !isAvailable && (addon?.level === "page" || type === "page") && "opacity-50",
            "h-full"
          )}
          children={children}
        />
      )}
    </div>
  );
};

export default AddonController;
