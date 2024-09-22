import { useEffect, useState } from "react";

import { Turnstile } from "@marsidev/react-turnstile";
import { getCookie } from "cookies-next";
import { Trans, useTranslation } from "next-i18next";
import { UseFormSetValue } from "react-hook-form";

import useCountdown from "@/hooks/useCountdown";
import { isEnglish, isNumeric, toEnglishDigits } from "@/utils";

import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface Props extends ModalProps {
  method: "email" | "phone";
  remainingTime: number;
  cf_turnstile_site_key: string;
  isPhoneSubmitting: boolean;
  resendOTP: () => void;
  isLoading?: boolean;
  verify: (otp: string) => void;
  data: {
    email?: string;
    phone?: any;
  };
  disabled?: boolean;
  onChangeDataClick?: () => void;
  setValue: UseFormSetValue<any>;
}

const OtpModal = ({
  open,
  setValue,
  remainingTime,
  resendOTP,
  isPhoneSubmitting,
  onDismiss,
  verify,
  data,
  disabled,
  cf_turnstile_site_key,
  isLoading,
  onChangeDataClick
}: Props) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(null);
    setShow(open ?? false);
  }, [open]);

  const [canResendOTP, setCanResendOTP] = useState<boolean>(false);

  const { startCountdown, currentTimeFormatted, resetCountdown } = useCountdown(
    remainingTime,
    () => setCanResendOTP(false),
    () => setCanResendOTP(true)
  );

  const handleResendOTP = () => {
    setToken(null);
    resetCountdown();
    startCountdown();
  };

  useEffect(() => {
    resetCountdown();
    startCountdown();
  }, [remainingTime, show]);

  const verifyOTP = (otp: string): string => {
    let value = otp;

    value = toEnglishDigits(value);

    if (!isEnglish(value)) {
      value = "";
    }

    if (!isNumeric(value)) {
      value = "";
    }

    return value;
  };

  return (
    <Modal
      open={show}
      onDismiss={() => {
        onDismiss?.();
        setToken(null);
      }}
      className="[&>.ms-btn-ghost-default]:hidden"
      size="sm"
    >
      <Modal.Body>
        <>
          {!token && (
            <div className="flex h-[350px] items-center justify-center">
              <Turnstile
                siteKey={cf_turnstile_site_key}
                onSuccess={(token) => {
                  setToken(token);
                  setValue("turnstile_token", token);
                  resendOTP();
                }}
                onError={(errorCode) => {
                  if (errorCode) {
                    setToken(null);
                    setTimeout(() => {
                      onDismiss?.();
                    }, 2000);
                  }
                }}
                onExpire={() => {
                  setToken(null);
                }}
                options={{
                  theme: "light",
                  language: getCookie("current_locale") == "en-US" ? "en" : "ar"
                }}
              />
            </div>
          )}
          {token && !isPhoneSubmitting && (
            <div className="flex flex-col items-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.04]">
                <Icon
                  className="h-8 w-8"
                  children={<DevicePhoneMobileIcon />}
                />
              </div>
              <div className="mt-4 flex flex-col items-center space-y-2">
                <>
                  <Typography.Paragraph
                    as="h3"
                    className="!text-xl !font-semibold"
                    children={t("otp.verify_phone")}
                  />
                  <Typography.Paragraph
                    as="span"
                    className="text-center !text-xs text-gray-700"
                    id="otp_description"
                    children={t("otp.verify_phone_description", {
                      phone: `${data.phone?.dialCode}${data.phone?.number}`
                    })}
                  />
                  <Button
                    size="sm"
                    className="!text-primary"
                    variant={"link"}
                    children={t("otp.change_phone")}
                    onClick={onChangeDataClick ?? onDismiss}
                  />
                </>
              </div>
              <div className="mt-4 flex w-full flex-col items-center space-y-2">
                <Form.Input
                  aria-label="otp_description"
                  placeholder={t("otp.otp_input_placeholder") as string}
                  inputMode="numeric"
                  disabled={disabled}
                  className="m-0 w-full"
                  dir={otpValue ? "ltr" : "rtl"}
                  maxLength={6}
                  onChange={(e) => {
                    setOtpValue(e.target.value);
                    let value = verifyOTP(e.target.value);

                    if (value.length === 6) {
                      verify(value);
                    }
                  }}
                  prepend={
                    isLoading && (
                      <div className="p-3">
                        <div className="dot-flashing" />
                      </div>
                    )
                  }
                />
                <Button
                  className="!text-primary"
                  variant="link"
                  size="sm"
                  disabled={!canResendOTP}
                  onClick={handleResendOTP}
                >
                  <Trans
                    i18nKey={"otp.resend_after_secs"}
                    components={{
                      span: <span className="text-gray-700" />
                    }}
                    values={{
                      secs: currentTimeFormatted
                    }}
                  />
                </Button>
              </div>
            </div>
          )}

          {isPhoneSubmitting && token && (
            <div className="flex h-[340px] items-center justify-center">
              <div className="p-3">
                <div className="dot-flashing" />
              </div>
            </div>
          )}
        </>
      </Modal.Body>
    </Modal>
  );
};

export default OtpModal;
