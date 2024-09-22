import { useContext, useEffect } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { getCookie, setCookie } from "cookies-next";
import { signIn, useSession } from "next-auth/react";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useToast } from "@/components/toast";
import { CustomTemplateContext } from "@/contextes/CustomTemplateContext";
import { GTM_EVENTS, isCustomizedDomain, useGTM } from "@/hooks";
import {
  ExtendedGetServerSidePropsContext,
  withAuthGetServerSideProps
} from "@/utils/common/withAuthGetServerSideProps";

import { Button, Form, Typography } from "@msaaqcom/abjad";

type IFormInputs = {
  email: string;
  password: string;
  remember_me: boolean;
};

export const getServerSideProps = withAuthGetServerSideProps();

const Login: NextPage<ExtendedGetServerSidePropsContext> = ({
  NEXTAUTH_URL,
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  const { sendGTMEvent } = useGTM();

  const router = useRouter();

  useEffect(() => {
    if (access_token) {
      setCookie("access_token", access_token);
    }
  }, [access_token]);

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
  }, [router]);

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
    remember_me: yup.boolean()
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });
  const { status, data: session } = useSession();
  const redirectUrl = (router.query.callbackUrl as string) || "/";
  const [toast] = useToast();

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
    if (getCookie("email")) {
      reset({
        email: getCookie("email") as string
      });
    }
  }, []);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const res = await signIn("credentials", {
      remember_me: data.remember_me ?? false,
      email: data.email,
      password: data.password,
      redirect: false
    });

    if (!res?.ok) {
      toast.error({
        message: t("auth.email_or_password_is_invalid")
      });
    } else {
      sendGTMEvent(
        GTM_EVENTS.LOGIN,
        {
          method: "Email"
        },
        {
          user: {
            email: data.email
          }
        }
      );
    }
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
      <div className="gradient-custom relative flex min-h-screen flex-col items-center justify-between bg-primary px-4 py-14">
        <div
          className={"relative z-10 mx-auto my-auto w-full rounded-3xl  bg-white py-4 md:w-[670px] lg:px-14 lg:py-24"}
        >
          <div className="px-4 transition-all lg:px-6">
            <div>
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
              {!isCustomizedDomain() && (
                <div className="mb-6 flex gap-6 rounded-2xl bg-gray-100 p-3">
                  <Button
                    as={Link}
                    href={"/register"}
                    className={"w-full bg-transparent text-gray-700 hover:bg-transparent"}
                  >
                    {t("auth.sign_up")}
                  </Button>

                  <Button
                    as={Link}
                    href={"/login"}
                    className={"w-full"}
                  >
                    {t("auth.sign_in")}
                  </Button>
                </div>
              )}
              <Typography.Subtitle
                weight="medium"
                size="lg"
                className="mb-4 text-center"
              >
                {!isCustomizedDomain() ? (
                  getCookie("name") || getCookie("email") ? (
                    <Trans
                      i18nKey={"auth.welcome_back_user"}
                      values={{ name: getCookie("name") || getCookie("email") }}
                      components={{
                        span: <span className="text-primary" />
                      }}
                    />
                  ) : (
                    t("auth.welcome_back")
                  )
                ) : (
                  t("auth.login")
                )}
              </Typography.Subtitle>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group
                  errors={errors.email?.message}
                  required
                  label={t("auth.used_email")}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        {...field}
                        dir="ltr"
                        placeholder={t("auth.your_email")}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  errors={errors.password?.message}
                  label={t("auth.password")}
                  required
                  className="mb-4"
                >
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Form.Password
                          {...field}
                          placeholder={t("auth.your_password")}
                          className="mb-2"
                        />
                        <Typography.Paragraph
                          as={Link}
                          href={"/forgot-password"}
                          className="mr-auto text-primary"
                          size="md"
                        >
                          {t("auth.do_you_forgot_your_password")}
                        </Typography.Paragraph>
                      </>
                    )}
                  />
                </Form.Group>
                <div className="mb-8 flex items-center justify-between">
                  <Controller
                    name="remember_me"
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Checkbox
                        id="remember_me"
                        checked={value}
                        value={Number(value ?? 0)}
                        label={t("auth.remember_me")}
                        {...rest}
                      />
                    )}
                  />
                </div>
                <div>
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    {t("auth.sign_in")}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <img
          draggable={false}
          src="/images/ring-background.svg"
          className="absolute top-0 -z-0 h-full w-full"
        />
      </div>
    </>
  );
};

export default Login;
