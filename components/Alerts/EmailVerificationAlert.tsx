import React, { FC, useContext, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { useToast } from "@/components/toast";
import { AuthContext } from "@/contextes";
import { GTM_EVENTS, useGTM, useResponseToastHandler } from "@/hooks";
import { useSendVerificationEmailMutation } from "@/store/slices/api/usersSlice";
import { APIActionResponse, User } from "@/types";

import { Alert, Button } from "@msaaqcom/abjad";

const EmailVerificationAlert: FC = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [toast] = useToast();
  const { display } = useResponseToastHandler({});
  const [sendVerificationEmail] = useSendVerificationEmailMutation();
  const { sendGTMEvent } = useGTM();

  useEffect(() => {
    const { message, ...query } = router.query;

    if (message === "verified") {
      sendGTMEvent(GTM_EVENTS.USER_EMAIL_VERIFIED);

      toast.success({
        message: t("auth.email_verified_successfully"),
        autoClose: false
      });

      router.replace(router.pathname, { query }, { shallow: true });
    }
  }, [router.query]);

  const [canSendRequest, setCanSendRequest] = useState<boolean>(true);
  const ResendVerificationEmail = async () => {
    if (!canSendRequest) {
      toast.info({
        message: t("auth.please_wait_before_resending_verification_email")
      });

      return;
    }

    const response = (await sendVerificationEmail(user.id)) as APIActionResponse<User>;

    setTimeout(() => {
      setCanSendRequest(true);
    }, 60000);

    display(response);

    setCanSendRequest(false);
  };

  return !user.email_verified ? (
    <Alert
      variant="warning"
      title={t("auth.verify_your_email_title")}
      children={t("auth.verify_your_email_description", { email: user.email })}
      className="mb-6"
      actions={
        <div className="flex gap-2">
          <Button
            variant="warning"
            outline
            ghost
            size="sm"
            children={t("auth.change_email")}
            as={Link}
            href="/profile"
          />

          <Button
            variant="dismiss"
            ghost
            size="sm"
            children={t("auth.resend_verification_email")}
            onClick={ResendVerificationEmail}
          />
        </div>
      }
    />
  ) : null;
};

export default EmailVerificationAlert;
