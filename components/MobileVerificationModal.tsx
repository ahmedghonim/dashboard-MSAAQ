import { useContext, useEffect, useMemo, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Turnstile } from "@marsidev/react-turnstile";
import { getCookie } from "cookies-next";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import PhoneInput from "@/components/shared/PhoneInput";
import { AuthContext } from "@/contextes";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import useCountdown from "@/hooks/useCountdown";
import dayjs from "@/lib//dayjs";
import { usePhoneVerifyMutation, useUpdateAuthMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse, User } from "@/types";
import { isEnglish, isNumeric, toEnglishDigits } from "@/utils";

import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  phone: any;
  verification_code: string;
}

interface Props extends ModalProps {}

const MobileVerificationModal = ({ open, onDismiss }: Props) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);
  const [otpValue, setOtpValue] = useState<string>("");
  const [showNumberModal, setShowNumberModal] = useState<boolean>(true);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [token, setToken] = useState<string | null>(null);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState<boolean>(false);

  const { current_academy, academies, user } = useContext(AuthContext);
  const dispatch = useAppDispatch();

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
    if (!showNumberModal) {
      resetCountdown();
      startCountdown();
    }
  }, [remainingTime, showNumberModal]);

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

  const schema = yup.object().shape({
    phone: yup.mixed().required()
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [updateUser] = useUpdateAuthMutation();

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<any>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (user) {
      setValue("phone", {
        number: user.phone,
        dialCode: user.phone_code
      });
    }
  }, [user]);

  const updatePhone: SubmitHandler<IFormInputs> = async (data) => {
    const response = (await updateUser({
      id: user?.id,
      verification_code: data.verification_code,
      phone: data.phone?.number,
      phone_code: data.phone?.dialCode
    })) as APIActionResponse<User>;

    if (displayErrors(response)) return;

    onDismiss?.();
    dispatch({
      type: "auth/setUser",
      payload: { user: response.data.data, academies: academies, current_academy: current_academy }
    });
  };

  const [phoneVerify] = usePhoneVerifyMutation();
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setIsPhoneSubmitting(true);
    if (isSubmitting) return;

    const response = (await phoneVerify({
      phone: data.phone?.number,
      phone_code: data.phone?.dialCode,
      // @ts-ignore
      "cf-turnstile-response": data.turnstile_token
    })) as APIActionResponse<{
      waiting_time: number;
      "cf-turnstile-response": string;
    }>;

    if (displayErrors(response)) {
      resetCountdown();
      setShowNumberModal(true);
      return;
    }
    setRemainingTime(response.data.data?.waiting_time);
    setIsPhoneSubmitting(false);
  };

  const checkPointExpired7Days = useMemo(() => {
    return dayjs().diff(dayjs(user?.phone_verification_checkpoint), "day") > 7;
  }, [current_academy]);

  return (
    <Modal
      className="[&>.ms-btn-ghost-default]:hidden"
      open={show}
      onDismiss={onDismiss}
      size="sm"
      dismissible={!checkPointExpired7Days}
    >
      <Modal.Body>
        {showNumberModal ? (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setToken(null);
              setShowNumberModal(false);
            }}
          >
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
                    children={t("otp.overlay_title")}
                  />
                  <Typography.Paragraph
                    as="span"
                    className="text-center !text-xs text-gray-700"
                    id="otp_description"
                    children={t("otp.overlay_subtitle")}
                  />
                </>
              </div>
              <div className="mt-4 flex w-full flex-col items-center space-y-2">
                <Form.Group
                  label={t("auth.phone")}
                  required
                  errors={errors.phone?.message as string}
                  className="mb-4 w-full"
                >
                  <Controller
                    render={({ field }) => (
                      <PhoneInput
                        placeholder={t("auth.phone_placeholder")}
                        {...field}
                      />
                    )}
                    name={"phone"}
                    control={control}
                  />
                </Form.Group>
              </div>
              <div className="flex w-full flex-col gap-3">
                <Button
                  className="w-full"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!isDirty || !isValid || isSubmitting}
                >
                  {t("otp.overlay_submit")}
                </Button>
                {!checkPointExpired7Days && (
                  <Button
                    variant={"default"}
                    className="w-full"
                    onClick={() => onDismiss?.()}
                  >
                    {t("otp.overlay_skip")}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        ) : (
          <>
            {!token && (
              <div className="flex h-[350px] items-center justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY as string}
                  onSuccess={(token) => {
                    setToken(token);
                    setValue("turnstile_token", token);
                    handleSubmit(onSubmit)();
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
                        phone: `${watch("phone")?.dialCode}${watch("phone")?.number}`
                      })}
                    />
                    <Button
                      size="sm"
                      className="!text-primary"
                      variant={"link"}
                      children={t("otp.change_phone")}
                      onClick={() => {
                        setShowNumberModal(true);
                        setToken(null);
                      }}
                    />
                  </>
                </div>
                <div className="mt-4 flex w-full flex-col items-center space-y-2">
                  <Form.Input
                    aria-label="otp_description"
                    placeholder={t("otp.otp_input_placeholder") as string}
                    inputMode="numeric"
                    className="m-0 w-full"
                    dir={otpValue ? "ltr" : "rtl"}
                    maxLength={6}
                    onChange={(e) => {
                      setOtpValue(e.target.value);
                      let value = verifyOTP(e.target.value);

                      if (value.length === 6) {
                        setValue("verification_code", value);
                        handleSubmit(updatePhone)();
                      }
                    }}
                    prepend={
                      isSubmitting && (
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
                  {!checkPointExpired7Days && (
                    <Button
                      variant={"default"}
                      className="w-full"
                      onClick={() => onDismiss?.()}
                    >
                      {t("otp.overlay_skip")}
                    </Button>
                  )}
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
        )}
      </Modal.Body>
    </Modal>
  );
};

export default MobileVerificationModal;
