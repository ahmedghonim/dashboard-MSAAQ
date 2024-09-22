import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import { Layout, Tabs } from "@/components";
import OtpModal from "@/components/OtpModal";
import ChangeEmailModal from "@/components/modals/ChangeEmailModal";
import { Select } from "@/components/select";
import PhoneInput from "@/components/shared/PhoneInput";
import { AuthContext } from "@/contextes";
import { isCustomizedDomain, useAppDispatch, useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { usePhoneVerifyMutation, useUpdateAuthMutation, useUpdatePasswordMutation } from "@/store/slices/api/authSlice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIActionResponse, User } from "@/types";
import { classNames } from "@/utils";
import { minimalCountriesList } from "@/utils/countriesList";

import { UserIcon } from "@heroicons/react/24/outline";

import { Avatar, Button, Form, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

type VerifyInputs = {
  verification_uuid: string;
  "cf-turnstile-response": string;
  waiting_time: number;
};
interface IFormInputs {
  name: string;
  email: string;
  country: {
    label: string;
    value: any;
  };
  phone: any;
  avatar: any;
  current_password: string;
  new_password: string;
  password_confirm: string;
  verification_code: string;
  meta: {
    education: string;
    bio: string;
    social_links: {
      [key: string]: any; // Represents dynamic Facebook fields
    };
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const dispatch = useAppDispatch();
  const { current_academy } = useContext(AuthContext);
  const { user } = auth;
  const defaultTab = router.asPath.split("#")[1];
  const [profilePicture, setProfilePicture] = useState<any>(null);
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const socialLinks = [
    "maroof",
    "podcast",
    "twitter",
    "youtube",
    "facebook",
    "snapchat",
    "telegram",
    "instagram",
    "soundcloud"
  ];

  const [openTab, setOpenTab] = useState<string>(defaultTab ?? "profile");
  const countries = useMemo(() => orderBy(minimalCountriesList, ["preferred", "name"], "desc"), []);
  const [updateAuthMutation] = useUpdateAuthMutation();
  const [updatePasswordMutation] = useUpdatePasswordMutation();

  const schema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    country: yup
      .object({
        label: yup.string(),
        value: yup.object()
      })
      .nullable()
      .notRequired(),
    phone: yup.mixed().nullable().required(),
    avatar: yup.mixed().nullable().notRequired(),
    current_password: yup.string().when({
      is: (exists: any) => !!exists,
      then: yup.string().required(),
      otherwise: yup.string().nullable().notRequired()
    }),
    new_password: yup.string().when({
      is: (exists: any) => !!exists,
      then: yup.string().required(),
      otherwise: yup.string().nullable().notRequired()
    }),
    password_confirm: yup.string().when({
      is: (exists: any) => !!exists,
      then: yup.string().required(),
      otherwise: yup.string().nullable().notRequired()
    }),
    meta: yup.object().shape({
      education: yup.string().nullable().notRequired(),
      bio: yup.string().nullable().notRequired()
    })
  });

  const {
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting },
    reset
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const resetUser = useCallback(() => {
    if (user) {
      setProfilePicture(user.avatar?.url);
      reset({
        name: user.name,
        email: user.email,
        // @ts-ignore
        country: find(countries, (el) => el.value.iso2 === user.country_code?.toLowerCase()),
        phone: `${user.phone_code}${user.phone}`,
        current_password: "",
        password_confirm: "",
        new_password: "",
        meta: {
          social_links: user?.meta?.social_links as object,
          education: user?.meta?.education,
          bio: user?.meta?.bio
        }
      });
    }
  }, [user]);
  useEffect(() => {
    resetUser();
  }, [user]);
  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const onProfilePictureChange = (input: any) => {
    if (input.files && input.files[0]) {
      let reader = new FileReader();

      reader.onload = function (e) {
        setProfilePicture(e?.target?.result ?? "");
      };

      reader.readAsDataURL(input.files[0]);

      setValue("avatar", input.files[0], { shouldDirty: true });
    }
  };

  const [phoneVerify] = usePhoneVerifyMutation();
  const phoneVerifySubmit: SubmitHandler<IFormInputs> = async (data) => {
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

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (!data?.verification_code && data.phone != `${user?.phone_code}${user?.phone}`) {
      setShowOTPModal(true);
      return;
    }
    if (isSubmitting) return;
    let $data = {};
    if (openTab == "profile") {
      $data = {
        avatar: data.avatar,
        name: data.name,
        email: data.email,
        phone: data.phone?.number,
        phone_code: data.phone?.dialCode,
        country_code: data.country?.value?.iso2,
        ...(data.verification_code && { verification_code: data.verification_code }),
        meta: {
          ...data.meta,
          education: data.meta.education,
          bio: data.meta.bio
        }
      };
    }
    if (openTab == "social_links") {
      let valuesWithKeys = null;
      let mergedObject = null;
      if (data.meta.social_links) {
        valuesWithKeys = Object.keys(data.meta.social_links).map((key) => ({ [key]: data.meta.social_links[key] }));
        mergedObject = Object.assign({}, ...valuesWithKeys);
      }
      $data = {
        meta: {
          ...data.meta,
          social_links: mergedObject
        }
      };
    }

    if (openTab == "password") {
      $data = {
        old_password: data.current_password,
        password: data.new_password,
        password_confirmation: data.password_confirm
      };
    }
    let response;
    if (openTab != "password") {
      response = (await updateAuthMutation($data)) as APIActionResponse<User>;
    } else {
      response = (await updatePasswordMutation($data)) as APIActionResponse<{
        old_password: string;
        password: string;
        password_confirmation: string;
      }>;
    }

    if (displayErrors(response)) return;

    displaySuccess(response);
    setShowOTPModal(false);

    dispatch({
      type: "auth/setUser",
      payload: { user: response.data.data, academies: auth.academies, current_academy: auth.current_academy }
    });
  };
  return (
    <Layout title={t("manager_profile")}>
      <Layout.Container>
        <Tabs.Group className="mx-auto bg-white lg:w-2/4">
          <Tabs
            center
            className="rounded-t-lg"
          >
            <Tabs.Link
              href=""
              as="button"
              active={openTab === "profile"}
              onClick={() => setOpenTab("profile")}
              children={t("profile.tab_title")}
            />
            <Tabs.Link
              as="button"
              active={openTab === "password"}
              href=""
              onClick={() => setOpenTab("password")}
              children={t("change_password")}
            />
            <Tabs.Link
              as="button"
              active={openTab === "social_links"}
              href=""
              onClick={() => setOpenTab("social_links")}
              children={
                <div className="flex items-center gap-1">
                  <span>{t("social_links.title")}</span>
                </div>
              }
            />
          </Tabs>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {openTab == "profile" && (
              <Tabs.Content className="flex flex-col space-y-4">
                <label className="flex flex-col items-center">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onProfilePictureChange(e.target)}
                  />
                  {!profilePicture && (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray bg-gray-50">
                      <Icon children={<UserIcon />} />
                    </div>
                  )}
                  {profilePicture && (
                    <Avatar
                      size="xl"
                      name={user?.name ?? ""}
                      imageUrl={profilePicture}
                    />
                  )}
                  <Button
                    as="span"
                    variant="default"
                    children={
                      user?.avatar
                        ? t("students_flow.change_profile_picture")
                        : t("students_flow.upload_profile_picture")
                    }
                    className="mt-4"
                  />
                </label>
                <Form.Group
                  required
                  label={t("full_name")}
                  errors={errors.name?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        required
                        placeholder={t("full_name")}
                        {...field}
                      />
                    )}
                    name={"name"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  label={t("education")}
                  errors={errors.meta?.education?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("education")}
                        {...field}
                      />
                    )}
                    name={"meta.education"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  label={t("bio")}
                  errors={errors.meta?.bio?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Textarea
                        placeholder={t("bio")}
                        {...field}
                      />
                    )}
                    name={"meta.bio"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("email")}
                  errors={errors.email?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        type="email"
                        placeholder="example@domain.com"
                        readOnly
                        prepend={
                          <Button
                            size="md"
                            onClick={() => {
                              setShowModal(true);
                            }}
                            variant="default"
                            children={t("profile.change")}
                          />
                        }
                        {...field}
                      />
                    )}
                    name={"email"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  label={t("country")}
                  errors={errors.country?.message}
                  className={classNames("mb-0")}
                >
                  <Controller
                    render={({ field }) => (
                      <Select
                        options={countries}
                        components={{
                          Option: (props) => (
                            <components.Option {...props}>
                              <div className="flex items-center">
                                <div
                                  style={{
                                    backgroundImage: `url(${props.data.value.flag})`
                                  }}
                                  className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                                />
                                <span className="mr-2">
                                  {i18n?.language == "ar" ? props.data.label : props.data.en_name}
                                </span>
                              </div>
                            </components.Option>
                          ),
                          SingleValue: (props) => (
                            <components.SingleValue {...props}>
                              <div className="flex items-center">
                                <div
                                  style={{
                                    backgroundImage: `url(${props.data.value.flag})`
                                  }}
                                  className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                                />
                                <span className="mr-2">
                                  {i18n?.language == "ar" ? props.data.label : props.data.en_name}
                                </span>
                              </div>
                            </components.SingleValue>
                          )
                        }}
                        {...field}
                      />
                    )}
                    name={"country"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-0 w-full"
                  label={t("academy_verification.owner_phone")}
                  errors={errors.phone?.message as string}
                  required
                >
                  <Controller
                    render={({ field }) => (
                      <PhoneInput
                        placeholder={t("academy_verification.owner_phone_placeholder")}
                        {...field}
                      />
                    )}
                    name={"phone"}
                    control={control}
                  />
                </Form.Group>
              </Tabs.Content>
            )}
            {openTab == "password" && (
              <Tabs.Content>
                <Form.Group
                  required
                  label={t("current_password")}
                  errors={errors.current_password?.message}
                >
                  <Controller
                    name={"current_password"}
                    control={control}
                    render={({ field }) => (
                      <Form.Password
                        required
                        autoComplete="current-password"
                        placeholder="•••••••••••"
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("new_password")}
                  errors={errors.new_password?.message}
                >
                  <Controller
                    name={"new_password"}
                    control={control}
                    render={({ field }) => (
                      <Form.Password
                        required
                        autoComplete="new-password"
                        placeholder="•••••••••••"
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("password_confirm")}
                  errors={errors.password_confirm?.message}
                  className="mb-0"
                >
                  <Controller
                    name={"password_confirm"}
                    control={control}
                    render={({ field }) => (
                      <Form.Password
                        required
                        autoComplete="new-password"
                        placeholder="•••••••••••"
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </Tabs.Content>
            )}
            {openTab == "social_links" && (
              <Tabs.Content className="flex flex-col ">
                {socialLinks.map((link) => (
                  <Form.Group
                    key={link}
                    label={t(`social_links.${link}`)}
                    className="mb-4"
                  >
                    <Controller
                      render={({ field }) => (
                        <Form.Input
                          dir="auto"
                          placeholder={t(`social_links.fields_placeholder`)}
                          {...field}
                        />
                      )}
                      name={`meta.social_links.${link}`}
                      control={control}
                    />
                  </Form.Group>
                ))}
              </Tabs.Content>
            )}
            <div className="flex gap-2 px-4 pb-4">
              <Button
                type="submit"
                disabled={!isDirty || !isValid || isSubmitting}
                children={t("save_changes")}
              />
              <Button
                variant="dismiss"
                children={t("cancel")}
                onClick={() => resetUser()}
              />
            </div>
          </Form>
        </Tabs.Group>
        <ChangeEmailModal
          onDismiss={() => {
            setShowModal(false);
          }}
          open={showModal}
        />
        <OtpModal
          method={"phone"}
          isLoading={isSubmitting}
          cf_turnstile_site_key={
            isCustomizedDomain() && current_academy.meta.cf_turnstile_site_key
              ? current_academy.meta.cf_turnstile_site_key
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
          resendOTP={handleSubmit(phoneVerifySubmit)}
          data={{
            phone: watch("phone")
          }}
          verify={(verification_code) => {
            setValue("verification_code", verification_code);
            handleSubmit(onSubmit)();
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
