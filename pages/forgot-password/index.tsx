import { useContext, useEffect, useState } from "react";

import { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { getCookie, setCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import SniperLinkGenerator from "@/components/SniperLink";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { AppContext } from "@/contextes";
import { CustomTemplateContext } from "@/contextes/CustomTemplateContext";
import { useResponseToastHandler } from "@/hooks";
import { setAuthToken } from "@/lib/axios";
import { useForgetPasswordMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse, Auth } from "@/types";
import {
  ExtendedGetServerSidePropsContext,
  withAuthGetServerSideProps
} from "@/utils/common/withAuthGetServerSideProps";

import { Button, Form, Typography } from "@msaaqcom/abjad";

type IFormInputs = {
  email: string;
};

export const getServerSideProps = withAuthGetServerSideProps();

const ResetPassword: NextPage<ExtendedGetServerSidePropsContext> = ({
  access_token,
  tenant
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (access_token) {
      setAuthToken(access_token);
      setCookie("access_token", access_token, {
        maxAge: 86400
      });
    }
  }, [access_token]);

  const schema = yup.object().shape({
    email: yup.string().email().required()
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const [forgetPasswordMutation] = useForgetPasswordMutation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (getCookie("email")) {
      setValue("email", getCookie("email") as string);
    }
  }, []);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const forgetPassword = (await forgetPasswordMutation(data)) as APIActionResponse<Auth>;

    if (displayErrors(forgetPassword)) return;

    displaySuccess(forgetPassword);
    setShowSuccess(true);
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
          className={"relative z-10 mx-auto my-auto  w-full rounded-3xl bg-white py-4 md:w-[670px]  lg:px-14 lg:py-24"}
        >
          {showSuccess ? (
            <>
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
                <Typography.Subtitle className="text-center !text-2xl font-semibold leading-10">
                  {t("auth.password_reset_email_sent")}
                </Typography.Subtitle>
              </div>
              {watch("email") || getCookie("email") ? (
                <div className="mt-6 flex justify-center">
                  <SniperLinkGenerator email={watch("email") ?? (getCookie("email") as string)} />
                </div>
              ) : null}
            </>
          ) : (
            <>
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
                  {t("auth.forget_password")}
                </Typography.Subtitle>
                <Typography.Subtitle className="mb-6 text-center text-base !font-normal text-gray-800">
                  {t("auth.forget_password_subtext")}
                </Typography.Subtitle>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group
                    errors={errors.email?.message}
                    required
                    label={t("auth.used_email")}
                    help={t("auth.check_your_email_before_submit")}
                  >
                    <Controller
                      name="email"
                      control={control}
                      defaultValue={getCookie("email") as string}
                      render={({ field }) => (
                        <Form.Input
                          {...field}
                          className="!border-black"
                          dir="ltr"
                          placeholder={t("auth.your_email")}
                        />
                      )}
                    />
                  </Form.Group>

                  <div className="flex flex-col gap-4">
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full"
                      isLoading={isSubmitting}
                    >
                      {t("auth.reset_password_submit")}
                    </Button>
                    <Button
                      type="submit"
                      className="w-full"
                      variant="default"
                      as={Link}
                      href="/login"
                    >
                      {t("auth.go_back_to_login")}
                    </Button>
                  </div>
                </Form>
              </div>
            </>
          )}
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

export default ResetPassword;
