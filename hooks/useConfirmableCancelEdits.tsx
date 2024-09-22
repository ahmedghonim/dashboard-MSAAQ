import React, { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { confirm } from "@/components/Alerts/Confirm";

import { Typography } from "@msaaqcom/abjad";

type Props = {
  redirect: string;
  isDirty: boolean;
  isSubmitting: boolean;
};

type ReturnType = [() => Promise<void>];

export const useConfirmableCancelEdits = ({ isDirty: providedIsDirty, isSubmitting, redirect }: Props): ReturnType => {
  const { t } = useTranslation();
  const router = useRouter();

  const [isDirty, setIsDirty] = useState<boolean>(providedIsDirty);

  useEffect(() => {
    setIsDirty(providedIsDirty);
  }, [providedIsDirty]);

  const confirmAction = async () => {
    return confirm({
      title: t("you_have_unsaved_edits_title"),
      variant: "warning",
      okLabel: t("continue"),
      cancelLabel: t("undo"),
      children: (
        <>
          <Typography.Paragraph
            size="sm"
            weight="normal"
          >
            {t("you_have_unsaved_edits_message")}
          </Typography.Paragraph>
        </>
      )
    });
  };

  // Prompt the user if they try and leave with unsaved changes
  const promptText = t("prompt_unsaved_changes_warning");

  const onRouteChangeStart = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      if (window.confirm(promptText)) {
        return true;
      }

      router.events.emit("routeChangeError");

      throw "Abort route change by user's confirmation.";
    }
  }, [isDirty, isSubmitting]);

  const handleWindowClose = (e: BeforeUnloadEvent) => {
    if (!isDirty || isSubmitting) {
      return;
    }

    e.preventDefault();

    return (e.returnValue = promptText);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", onRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", onRouteChangeStart);
    };
  }, [isDirty, isSubmitting]);

  const cancelEdit = useCallback<() => Promise<void>>(async () => {
    if (!isDirty) {
      await router.push(redirect);
      return;
    }

    if (isDirty && (await confirmAction())) {
      setIsDirty(false);

      await router.push(redirect);
      return;
    }
  }, [confirm, router, t, isDirty, redirect]);

  return [cancelEdit];
};
