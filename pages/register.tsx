import { useContext, useEffect, useState } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { signIn, useSession } from "next-auth/react";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import OtpModal from "@/components/OtpModal";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import PhoneInput from "@/components/shared/PhoneInput";
import { CustomTemplateContext } from "@/contextes/CustomTemplateContext";
import { GTM_EVENTS, isCustomizedDomain, useResponseToastHandler } from "@/hooks";
import { useGTM } from "@/hooks/useGTM";
import { setAcceptLanguage, setAuthToken, setReferredBy } from "@/lib/axios";
import { usePhoneVerifyMutation, useRegisterAuthMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse, Auth } from "@/types";
import {
  ExtendedGetServerSidePropsContext,
  withAuthGetServerSideProps
} from "@/utils/common/withAuthGetServerSideProps";
import { getCountry } from "@/utils/country";

import { Button, Form, Typography } from "@msaaqcom/abjad";

export const getServerSideProps = withAuthGetServerSideProps();

type IFormInputs = {
  email: string;
  name: string;
  password: string;
  referred_by: string;
  phone: any;
  phone_code: string;
  uuid: string;
  verification_code: string;
};

type VerifyInputs = {
  verification_uuid: string;
  "cf-turnstile-response": string;
  waiting_time: number;
};

const Register: NextPage<ExtendedGetServerSidePropsContext> = ({
  NEXTAUTH_URL,
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState<boolean>(false);

  const { sendGTMEvent } = useGTM();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { status, data: session } = useSession();

  const router = useRouter();
  const redirectUrl = (router.query.callbackUrl as string) || "/";

  useEffect(() => {
    if (access_token) {
      setAuthToken(access_token);
      setCookie("access_token", access_token);
    }
  }, [access_token]);

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().required(),
    password: yup.string().required(),
    phone: yup.mixed().required()
  });

  const [country, setCountry] = useState<string>("sa");

  useEffect(() => {
    getCountry().then((current_country) => {
      setCountry(current_country);
    });
  }, []);

  useEffect(() => {
    sendGTMEvent(GTM_EVENTS.SIGN_UP_PAGE_VIEWED);
  }, []);

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.academies.length) {
        window.location.replace(redirectUrl.replace(NEXTAUTH_URL, ""));
        return;
      }

      if (getCookie("current_locale") == "en-US") {
        window.location.replace("/en");
      } else {
        window.location.replace("/");
      }
    }
  }, [status]);

  useEffect(() => {
    Object.keys(router.query).forEach((key) => {
      if (key.startsWith("utm_")) {
        setCookie(key, router.query[key]);
      }
      if (key == "coupon") {
        setCookie(key, router.query[key], {
          maxAge: 864000
        });
      }
    });
    if (router.query.ref) {
      setCookie("referral", router.query.ref);
      setReferredBy(router.query.ref as string);
    } else {
      deleteCookie("referral");
    }
  }, [router]);

  const [registerAuthMutation] = useRegisterAuthMutation();
  const [phoneVerify] = usePhoneVerifyMutation();

  const verifyRegister: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    setIsLoading(true);
    let referredBy = getCookie("referral");

    const response = (await registerAuthMutation({
      ...data,
      ...(referredBy && { referred_by: referredBy }),
      verification_code: data.verification_code,
      phone: data.phone?.number,
      phone_code: data.phone?.dialCode
    })) as APIActionResponse<Auth>;

    if (displayErrors(response)) {
      setIsLoading(false);

      return;
    }

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      remember_me: true,
      redirect: false
    });

    if (getCookie("current_locale")) {
      setAcceptLanguage(getCookie("current_locale") as string);
    }

    if (res?.ok) {
      displaySuccess(response);
    }
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
      return;
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

  useEffect(() => {
    if (isCustomizedDomain()) {
      router.push("/login");
    }
  }, [isCustomizedDomain()]);

  return (
    <>
      <Head>
        <title>{t("auth.register")}</title>
      </Head>

      <div className="gradient-custom relative flex min-h-screen flex-col items-center justify-between bg-primary px-4 py-14">
        <div className={"relative z-10 mx-auto my-auto rounded-3xl bg-white py-4 lg:px-14 lg:py-24"}>
          <div className="px-4 transition-all lg:px-6">
            <div className="flex h-full items-center gap-6 md:w-fit">
              <div className="h-full px-0 md:w-[558px] lg:px-6">
                <div className="mb-6 flex items-center justify-between">
                  <img
                    draggable={false}
                    src={tenantLogo ?? "https://cdn.msaaq.com/assets/images/logo/logo.svg"}
                    width={96}
                    height={42}
                    alt="مساق"
                  />
                  <LanguageSwitcher />
                </div>
                <div className="mb-6 flex gap-6 rounded-2xl bg-gray-100 p-3">
                  <Button
                    as={Link}
                    href={"/register"}
                    className={"w-full"}
                  >
                    {t("auth.sign_up")}
                  </Button>
                  <Button
                    as={Link}
                    href={"/login"}
                    className={"w-full bg-transparent text-gray-700 hover:bg-transparent"}
                  >
                    {t("auth.sign_in")}
                  </Button>
                </div>
                <Typography.Subtitle
                  weight="medium"
                  size="lg"
                  className="mb-6 text-center"
                >
                  {t("auth.register_subtitle")}
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
                    className="mb-4"
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
                    errors={errors.email?.message}
                    required
                    label={t("auth.email")}
                    className="mb-4"
                  >
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Form.Input
                          {...field}
                          autoComplete="off"
                          dir="ltr"
                          placeholder={t("auth.your_email")}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    label={t("auth.phone")}
                    required
                    errors={errors.phone?.message as string}
                    className="mb-4"
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
                    className="mb-6"
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

                  <div>
                    <Button
                      disabled={!isDirty || !isValid || isSubmitting}
                      type="submit"
                      className="w-full"
                      isLoading={isSubmitting}
                    >
                      {t("auth.sign_up")}
                    </Button>
                  </div>
                  <div className="mt-6 text-center text-sm font-medium">
                    <Typography.Paragraph
                      weight="medium"
                      size="sm"
                    >
                      <Trans
                        i18nKey={"auth.create_account_by_click"}
                        components={{
                          a: (
                            <a
                              href="https://msaaq.com/terms/"
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            />
                          )
                        }}
                      />
                    </Typography.Paragraph>
                  </div>
                </Form>
              </div>
            </div>
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
        isLoading={isSubmitting}
        cf_turnstile_site_key={
          isCustomizedDomain() && tenant.data.meta.cf_turnstile_site_key
            ? tenant.data.meta.cf_turnstile_site_key
            : (process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY as string)
        }
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

export default Register;
