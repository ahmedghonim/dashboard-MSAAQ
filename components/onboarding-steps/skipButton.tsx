import { useCallback, useContext, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { AuthContext } from "@/contextes";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { fetchPermissions } from "@/store/slices/auth-slice";
import { APIActionResponse } from "@/types";

import { Button } from "@msaaqcom/abjad";

const SkipButton = () => {
  const { t } = useTranslation();
  const { displayErrors } = useResponseToastHandler({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();
  const { refetchAuth } = useContext(AuthContext);

  const dispatch = useAppDispatch();

  const router = useRouter();
  const skipOnboarding = useCallback(async () => {
    if (isSubmitting) return;

    const response = (await updateAcademySettingsMutation({
      onboarding_status: "skipped"
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    dispatch(fetchPermissions()).finally(() => {
      refetchAuth();
      router.push("/");
    });
  }, []);

  return (
    <Button
      onClick={async () => {
        await skipOnboarding();
      }}
      disabled={isSubmitting}
      isLoading={isSubmitting}
      variant={"default"}
    >
      {t("onboard.skip")}
    </Button>
  );
};

export default SkipButton;
