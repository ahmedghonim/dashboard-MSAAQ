import { useContext } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { setCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AuthContext } from "@/contextes";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useCreateProductMutation } from "@/store/slices/api/productsSlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { fetchPermissions } from "@/store/slices/auth-slice";
import { APIActionResponse, Product, ProductType, User } from "@/types";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon } from "@msaaqcom/abjad";

import { Select } from "../select";

interface Instructor extends User {
  label: string;
  value: any;
}

interface IFormInputs {
  title: string;
  price: number;
  type: ProductType;
  options: {
    duration: {
      label: string;
      value: number | string;
    };
    availability: Array<{
      user: Instructor;
      days: Array<{
        times?: {
          from: string | number;
          to: string | number;
        };
        active: boolean;
        name: string;
      }>;
    }>;
  };
}

const CreateCoachingSession = () => {
  const { t } = useTranslation();
  const [skipOnboardingMutation] = useUpdateAcademySettingsMutation();
  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    price: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .required()
  });
  const { refetchAuth } = useContext(AuthContext);
  const router = useRouter();

  const dispatch = useAppDispatch();

  const times = [
    { label: "coaching_sessions.times.15min", value: 15 },
    { label: "coaching_sessions.times.30min", value: 30 },
    { label: "coaching_sessions.times.45min", value: 45 },
    { label: "coaching_sessions.times.60min", value: 60 }
  ];
  const [createCoachingSession] = useCreateProductMutation();

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
    setError
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const response = (await createCoachingSession({
      title: data.title,
      price: data.price,
      type: ProductType.COACHING_SESSION,
      options: {
        duration: (data.options.duration.value as number) * 60
      }
    })) as APIActionResponse<Product>;

    if (displayErrors(response)) return;

    await skipOnboardingMutation({
      onboarding_status: "completed"
    });
    dispatch(fetchPermissions()).finally(() => {
      setCookie("is_onboarding", true);
      router.replace(`/coaching-sessions/${response?.data.data.id}/edit?onboarding=coaching-edit`).finally(async () => {
        await refetchAuth();
      });
    });
  };
  return (
    <>
      <Head>
        <title>{t("onboard.coaching.title")}</title>
      </Head>
      <div className=" relative flex min-h-screen flex-col items-center justify-between bg-gray-100 py-6">
        <div className={"relative z-10 mx-auto my-auto w-full rounded-3xl  bg-white p-16 md:w-[832px]"}>
          <div className="transition-all">
            <div className="flex flex-col  gap-2">
              <div className="text-center text-3xl font-semibold text-gray-900">{t("onboard.coaching.title")}</div>
              <div className="text-center font-normal text-gray-700">{t("onboard.coaching.subtitle")}</div>
              <div className="mx-auto mt-6 w-[554px]">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group
                    required
                    label={t("onboard.coaching.coaching_title")}
                    errors={errors.title?.message}
                  >
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Form.Input
                          placeholder={t("onboard.coaching.coaching_placeholder")}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    required
                    label={t("onboard.coaching.coaching_duration")}
                    errors={errors.options?.duration?.message}
                  >
                    <Controller
                      name={"options.duration"}
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={times.map((time) => {
                            return {
                              label: t(time.label),
                              value: time.value
                            };
                          })}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    className="!mb-0"
                    errors={errors.price?.message}
                    label={t("onboard.price")}
                    help={t("onboard.price_helper")}
                    required
                  >
                    <Controller
                      name={"price"}
                      control={control}
                      render={({ field: { value, ...rest } }) => (
                        <Form.Number
                          value={value}
                          placeholder={"0"}
                          {...rest}
                        />
                      )}
                    />
                  </Form.Group>
                  <div className="mt-8 flex w-full items-center justify-center">
                    <Button
                      iconAlign="end"
                      className="swipe-direction"
                      icon={<Icon children={<ArrowLeftIcon />} />}
                      type="submit"
                      disabled={isSubmitting || !isValid || !isDirty}
                    >
                      {t("onboard.add_details")}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCoachingSession;
