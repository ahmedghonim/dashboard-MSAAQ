import React, { FC, useContext } from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";
import { Stars } from "react-bootstrap-icons";

import { AuthContext } from "@/contextes";
import dayjs from "@/lib/dayjs";

import { ArrowUpLeftIcon } from "@heroicons/react/24/outline";

import { Alert, Button, Icon } from "@msaaqcom/abjad";

const TrialAlert: FC = () => {
  const { t } = useTranslation();
  const { current_academy } = useContext(AuthContext);
  const subscription = current_academy.subscription;

  return !subscription ? (
    <Alert
      variant="gradient"
      className="mb-4"
      icon={<Icon children={<Stars />} />}
      title={
        current_academy.on_trial ? t("billing.plans.banners.trial.title") : t("billing.plans.banners.trial_ended.title")
      }
      children={
        <Trans
          i18nKey={
            current_academy.on_trial
              ? "billing.plans.banners.trial.description"
              : "billing.plans.banners.trial_ended.description"
          }
          values={{
            // @ts-ignore
            ends_at: dayjs(current_academy.trial_ends_at).fromNow(true)
          }}
          components={{
            b: <b />
          }}
        />
      }
      actions={
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
          children={t("billing.plans.compare_plans")}
        />
      }
    />
  ) : null;
};

export default TrialAlert;
