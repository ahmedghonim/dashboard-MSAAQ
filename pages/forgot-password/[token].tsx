import { useContext, useEffect } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { setCookie } from "cookies-next";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { CustomTemplateContext } from "@/contextes/CustomTemplateContext";
import { useResponseToastHandler } from "@/hooks";
import { setAuthToken } from "@/lib/axios";
import { useResetPasswordMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse, Auth } from "@/types";
import {
  ExtendedGetServerSidePropsContext,
  withAuthGetServerSideProps
} from "@/utils/common/withAuthGetServerSideProps";

import { Button, Form, Typography } from "@msaaqcom/abjad";

type IFormInputs = {
  email: string;
  token: string;
  password: string;
};

export const getServerSideProps = withAuthGetServerSideProps();

const ResetToken: NextPage<ExtendedGetServerSidePropsContext> = ({
  NEXTAUTH_URL,
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (access_token) {
      setAuthToken(access_token);
      setCookie("access_token", access_token, {
        maxAge: 86400
      });
    }
  }, [access_token]);

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required()
  });

  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    reset({ email: router.query.email as string, token: router.query.token as string });
  }, [router.query]);

  const [resetPasswordMutation] = useResetPasswordMutation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const resetPassword = (await resetPasswordMutation(data)) as APIActionResponse<Auth>;

    if (displayErrors(resetPassword)) return;

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      remember_me: true,
      redirect: false
    });

    if (res?.ok) {
      displaySuccess(resetPassword);
      window.location.replace("/");
    }

    await router.push(`/login`);
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
        <title>{t("auth.reset_password_page_title")}</title>
      </Head>
      <div className="gradient-custom relative flex min-h-screen flex-col items-center justify-between bg-primary px-4">
        <div
          className={"relative z-10 mx-auto my-auto w-full rounded-3xl bg-white py-4 md:w-[670px]  lg:px-14 lg:py-24"}
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
              {t("auth.accept_reset_password")}
            </Typography.Subtitle>
            <Typography.Subtitle className="mb-6 text-center text-base !font-normal text-gray-800">
              {t("auth.accept_reset_password_subtext")}
            </Typography.Subtitle>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group
                required
                label={t("auth.password")}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Form.Password
                      {...field}
                      placeholder={t("auth.reset_password_placeholder")}
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
                  {t("auth.confirm_password_reset")}
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
    </>
  );
};

export default ResetToken;
