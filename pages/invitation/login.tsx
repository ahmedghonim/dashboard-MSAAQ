import { useContext, useEffect } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
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
import { GTM_EVENTS, useGTM } from "@/hooks";
import { setCurrentAcademyId } from "@/lib/axios";
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

const InviteLoginPage: NextPage<ExtendedGetServerSidePropsContext> = ({
  NEXTAUTH_URL,
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { sendGTMEvent } = useGTM();
  const { t } = useTranslation();
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
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<IFormInputs>({
    mode: "all",
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
      window.location.replace("/");
    }
  }, [status]);

  useEffect(() => {
    if (router.query.email && router.query.tenant_id) {
      reset({ email: router.query.email as string });
      setCookie("academy_id", router.query.tenant_id);
      setCurrentAcademyId(router.query.tenant_id);
    }
  }, [router.query]);

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
                  values={{
                    name:
                      getCookie("email") == router.query.email
                        ? getCookie("name")
                          ? getCookie("name")
                          : router.query.email
                        : router.query.email
                  }}
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
            <Typography.Subtitle className="mb-6 text-center text-base font-normal text-gray-700">
              <Trans
                i18nKey={"auth.invitation_page_subtitle"}
                values={{ academy_name: router.query.tenant }}
                components={{
                  span: <span className="text-primary" />
                }}
              />
            </Typography.Subtitle>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                    </>
                  )}
                />
              </Form.Group>

              <div>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  {t("auth.invitation_accept")}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-1 text-center">
                  <Typography.Paragraph
                    weight="medium"
                    size="sm"
                    className="text-gray-800"
                  >
                    <Trans
                      i18nKey={"auth.invite_login_disclaimer"}
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
    </>
  );
};

export default InviteLoginPage;
