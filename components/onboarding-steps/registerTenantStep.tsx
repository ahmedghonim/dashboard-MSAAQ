import { ChangeEvent, useContext, useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { deleteCookie, getCookie, getCookies, setCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import Dropzone from "@/components/dropzone/Dropzone";
import { ACCESS_TOKEN_COOKIE_KEY, AuthContext, CURRENT_ACADEMY_COOKIE_KEY } from "@/contextes";
import { GTM_EVENTS, useAppSelector, useGTM, useResponseToastHandler } from "@/hooks";
import { useCreateAcademyMutation } from "@/store/slices/api/academySlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIActionResponse, Academy } from "@/types";
import { StepsValues } from "@/types/models/onboarding-questions";
import { classNames, getWildcardCookiePath, slugify } from "@/utils";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, SingleFile } from "@msaaqcom/abjad";

interface IFormInputs {
  title: string;
  slug: string;
  logo: Array<SingleFile> | undefined;
}

const RegisterTenantStep = ({ onStepChange }: { onStepChange: (step: number) => void }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [createAcademyMutation] = useCreateAcademyMutation();
  const [updateAcademyMutation] = useUpdateAcademySettingsMutation();
  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const { user } = auth;
  const { sendGTMEvent } = useGTM();
  const { refetchAuth, current_academy } = useContext(AuthContext);

  const schema = yup.object().shape({
    title: yup.string().required(),
    slug: yup.string().required(),
    logo: yup
      .array()
      .of(yup.mixed())
      .max(1, t("validation.field_file_max_files", { files: 1 }))
      .nullable()
  });

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const { displayErrors } = useResponseToastHandler({ setError });
  useEffect(() => {
    if (current_academy) {
      reset({
        title: current_academy.title,
        slug: current_academy.slug
      });
    }
  }, [current_academy]);

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
    } else {
      deleteCookie("referral");
    }
  }, [router]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const mutation = current_academy ? updateAcademyMutation : createAcademyMutation;
    const response = (await mutation({
      title: data.title,
      ...(data.logo
        ? { logo: data?.logo?.map((file) => file.file).pop() }
        : {
            "deleted-logo": [current_academy?.logo_media.id]
          }),
      slug: data.slug,
      email: user.email,
      ...Object.keys(getCookies())
        .filter((key) => key.startsWith("utm_"))
        .map((key) => ({
          [key]: getCookie(key)
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    })) as APIActionResponse<Academy>;

    if (displayErrors(response)) return;

    if (response?.data?.data) {
      sendGTMEvent(
        GTM_EVENTS.SIGN_UP,
        {
          method: "Email"
        },
        {
          user: {
            uuid: user.uuid,
            email: user.email,
            name: user.name
          },
          tenant: {
            // @ts-ignore
            id: response?.data?.id,
            // @ts-ignore
            domain: response?.data?.domain,
            // @ts-ignore,
            on_trial: response?.data?.on_trial
          }
        }
      );
      deleteCookie(ACCESS_TOKEN_COOKIE_KEY, { domain: getWildcardCookiePath() });
      deleteCookie(CURRENT_ACADEMY_COOKIE_KEY, { domain: getWildcardCookiePath() });

      // @ts-ignore
      setCookie("academy_id", response?.data?.id);
    }

    await refetchAuth();
    onStepChange(StepsValues.About);
  };
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="mb-1 text-xl font-semibold">{t("onboard.register.title")}</div>
        <div className="text-sm text-gray-800">{t("onboard.register.subtitle")}</div>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full lg:w-[356px]">
          <Form.Group
            errors={errors.logo?.message}
            label={t("onboard.register.favicon_label")}
          >
            <Dropzone
              value={current_academy?.logo ?? undefined}
              setValue={setValue}
              name="logo"
            />
          </Form.Group>
          <Form.Group
            errors={errors.title?.message}
            required
            label={t("onboard.register.academy_title")}
            tooltip={t("onboard.register.academy_title_tooltip")}
          >
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("onboard.register.academy_title_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>

          <Form.Group
            required
            label={t("onboard.register.academy_slug")}
            help={t("onboard.register.academy_slug_help")}
            errors={errors.slug?.message}
            tooltip={t("onboard.register.slug_tooltip")}
          >
            <Controller
              name="slug"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <Form.Input
                  className="swipe-direction"
                  append={
                    <div
                      className="latin-text bg-gray px-4 py-3"
                      children="https://"
                    />
                  }
                  prepend={
                    <div
                      className="latin-text bg-gray px-4 py-3"
                      children=".msaaq.net"
                    />
                  }
                  placeholder={t("create_new_academy.academy_slug_placeholder")}
                  value={slugify(value)}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const slug = slugify(event.target.value);
                    onChange(slug);
                  }}
                  {...rest}
                />
              )}
            />
          </Form.Group>
        </div>

        <div
          className={classNames(
            "flex w-full border-t border-gray-400 pt-4",
            current_academy ? "justify-between" : "justify-start"
          )}
        >
          <Button
            disabled={isSubmitting}
            iconAlign="end"
            className="swipe-direction"
            icon={
              <Icon>
                <ArrowLeftIcon />
              </Icon>
            }
            onClick={() => {
              if (current_academy) {
                if (isDirty) {
                  handleSubmit(onSubmit)();
                } else {
                }
                onStepChange(StepsValues.About);
              } else {
                handleSubmit(onSubmit)();
              }
            }}
          >
            {t("next")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RegisterTenantStep;
