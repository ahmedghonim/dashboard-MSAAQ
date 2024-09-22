import { useContext, useEffect, useState } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { setCookie } from "cookies-next";
import { signIn } from "next-auth/react";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import OtpModal from "@/components/OtpModal";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import PhoneInput from "@/components/shared/PhoneInput";
import { CustomTemplateContext } from "@/contextes/CustomTemplateContext";
import { isCustomizedDomain, useResponseToastHandler } from "@/hooks";
import { setAuthToken } from "@/lib/axios";
import { useAcceptInvitationMutation, usePhoneVerifyMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse, Auth } from "@/types";
import {
  ExtendedGetServerSidePropsContext,
  withAuthGetServerSideProps
} from "@/utils/common/withAuthGetServerSideProps";
import { getCountry } from "@/utils/country";

import { Button, Form, Typography } from "@msaaqcom/abjad";

type IFormInputs = {
  email: string;
  name: string;
  password: string;
  phone: any;
  phone_code: string;
  token: string;
  verification_code: string;
};

type VerifyInputs = {
  verification_uuid: string;
  "cf-turnstile-response": string;
  waiting_time: number;
};

export const getServerSideProps = withAuthGetServerSideProps();

const InviteUserUpdate: NextPage<ExtendedGetServerSidePropsContext> = ({
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (access_token) {
      setAuthToken(access_token);
      setCookie("access_token", access_token, {
        maxAge: 86400
      });
    }
  }, [access_token]);

  const schema = yup.object().shape({
    name: yup.string().required(),
    password: yup.string().required(),
    phone: yup.mixed().required()
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    reset({ email: router.query.email as string, token: router.query.token as string });
  }, [router.query]);

  const [country, setCountry] = useState<string>("sa");

  useEffect(() => {
    getCountry().then((current_country) => {
      setCountry(current_country);
    });
  }, []);

  const [acceptInviteMutation] = useAcceptInvitationMutation();
  const [phoneVerify] = usePhoneVerifyMutation();

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const verifyRegister: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;

    const acceptInvite = (await acceptInviteMutation({
      ...data,
      phone: data.phone?.number,
      phone_code: data.phone?.dialCode
    })) as APIActionResponse<Auth>;

    if (displayErrors(acceptInvite)) return;

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      remember_me: true,
      redirect: false
    });

    if (res?.ok) {
      displaySuccess(acceptInvite);
      window.location.replace("/");
    }

    await router.push(`/login`);
  };

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setIsPhoneSubmitting(true);
    if (isSubmitting) return;

    const response = (await phoneVerify({
      ...data,
      phone: data.phone?.number,
      phone_code: data.phone?.dialCode,
      // @ts-ignore
      "cf-turnstile-response": data.turnstile_token
    })) as APIActionResponse<VerifyInputs>;

    if (displayErrors(response)) {
      setShowOTPModal(false);
    }
    setRemainingTime(response.data.data?.waiting_time);
    setShowOTPModal(true);
    setIsPhoneSubmitting(false);
  };

  const { setTenant, tenantLogo } = useContext(CustomTemplateContext);

  useEffect(() => {
    if (tenant) {
      setTenant?.(tenant.data);
    }
  }, [tenant]);

  return (
    <>
      <Head>
        <title>{t("auth.login")}</title>
      </Head>
      <div className="gradient-custom relative flex min-h-screen flex-col items-center justify-between bg-primary px-4">
        <div
          className={"relative z-10 mx-auto my-auto  w-full rounded-3xl bg-white py-4 md:w-[670px]  lg:px-14 lg:py-24"}
        >
          <div className="mb-6 flex items-center justify-between px-4">
            <img
              draggable={false}
              src={tenantLogo ?? "https://cdn.msaaq.com/assets/images/logo/logo.svg"}
              width={96}
              height={42}
              alt="مساق"
            />
            <LanguageSwitcher />
          </div>
          <div className="px-4 transition-all lg:px-6">
            <Typography.Subtitle
              weight="medium"
              size="lg"
              className="mb-2 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <Trans
                  i18nKey={"auth.welcome_user"}
                  values={{ name: router.query.email ?? "" }}
                  components={{
                    span: <span className="text-primary" />
                  }}
                />
                <img
                  src={"/images/waving-hand.png"}
                  className="h-6 w-6"
                />
              </span>
            </Typography.Subtitle>
            <Typography.Subtitle className="mb-6 text-center text-base !font-normal text-gray-700">
              <Trans
                i18nKey={"auth.invitation_register_page"}
                values={{ academy_name: router.query.tenant }}
                components={{
                  span: <span className="text-primary" />
                }}
              />
            </Typography.Subtitle>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                setShowOTPModal(true);
              }}
            >
              <Form.Group
                errors={errors.name?.message}
                required
                label={t("auth.name")}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      {...field}
                      placeholder={t("auth.your_name")}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                label={t("auth.phone")}
                required
                errors={errors.phone?.message as string}
              >
                <Controller
                  render={({ field }) => (
                    <PhoneInput
                      placeholder={t("auth.phone_placeholder")}
                      country={country}
                      {...field}
                    />
                  )}
                  name={"phone"}
                  control={control}
                />
              </Form.Group>

              <Form.Group
                required
                label={t("auth.password")}
                errors={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Form.Password
                      {...field}
                      autoComplete="new-password"
                      placeholder={t("auth.your_password")}
                    />
                  )}
                />
              </Form.Group>

              <div className="flex flex-col gap-4">
                <Button
                  disabled={!isDirty || !isValid || isSubmitting}
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  {t("auth.invitation_accept")}
                </Button>
                <Button
                  variant={"default"}
                  as={Link}
                  href={"/login"}
                  className="w-full"
                >
                  {t("auth.back_to_login")}
                </Button>
              </div>
            </Form>
          </div>
        </div>
        <img
          draggable={false}
          src="/images/ring-background.svg"
          className="absolute top-0 -z-0 h-full w-full"
        />
      </div>
      <OtpModal
        method={"phone"}
        cf_turnstile_site_key={
          isCustomizedDomain() && tenant.data.meta.cf_turnstile_site_key
            ? tenant.data.meta.cf_turnstile_site_key
            : (process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY as string)
        }
        isLoading={isSubmitting}
        isPhoneSubmitting={isPhoneSubmitting}
        setValue={setValue}
        remainingTime={remainingTime}
        open={showOTPModal}
        onDismiss={() => {
          setShowOTPModal(false);
        }}
        onChangeDataClick={() => {
          setShowOTPModal(false);
        }}
        resendOTP={handleSubmit(onSubmit)}
        data={{
          phone: watch("phone")
        }}
        verify={(verification_code) => {
          handleSubmit((data) => verifyRegister({ ...data, verification_code }))();
        }}
      />
    </>
  );
};

export default InviteUserUpdate;
