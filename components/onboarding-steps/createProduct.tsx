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
import { APIActionResponse, Product, ProductType } from "@/types";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, SingleFile } from "@msaaqcom/abjad";

interface IFormInputs {
  title: string;
  attachments: Array<SingleFile>;
  price: number;
  type: ProductType;
}

const CreateProduct = () => {
  const { t } = useTranslation();
  const [skipOnboardingMutation] = useUpdateAcademySettingsMutation();
  const { refetchAuth } = useContext(AuthContext);
  const router = useRouter();

  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    price: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .required(),
    attachments: yup
      .array()
      .min(1, t("validation.field_file_min_files", { files: 1 }))
      .max(10, t("validation.field_file_max_files", { files: 10 }))
      //@ts-ignore
      .of(yup.mixed().fileSize(100, t("validation.field_file_size_invalid", { size: "100MB" })))
      .required()
  });
  const [createProduct] = useCreateProductMutation();

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
    const response = (await createProduct({
      attachments: data.attachments.map(({ file }) => file),
      title: data.title,
      price: data.price,
      type: ProductType.DIGITAL
    })) as APIActionResponse<Product>;

    if (displayErrors(response)) return;

    await skipOnboardingMutation({
      onboarding_status: "completed"
    });
    dispatch(fetchPermissions()).finally(() => {
      setCookie("is_onboarding", true);

      router.replace(`/products/${response?.data.data.id}/edit?onboarding=product-edit`).finally(async () => {
        await refetchAuth();
      });
    });
  };
  return (
    <>
      <Head>
        <title>{t("onboard.product.title")}</title>
      </Head>
      <div className=" relative flex min-h-screen flex-col items-center justify-between bg-gray-100 py-6">
        <div className={"relative z-10 mx-auto my-auto w-full rounded-3xl  bg-white p-16 md:w-[832px]"}>
          <div className="transition-all">
            <div className="mb-8 font-medium text-gray-700">{t("onboard.tag")}</div>
            <div className="flex flex-col  gap-2">
              <div className="text-center text-3xl font-semibold text-gray-900">{t("onboard.product.title")}</div>
              <div className="text-center font-normal text-gray-700">{t("onboard.product.subtitle")}</div>
              <div className="mx-auto mt-6 w-[554px]">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group
                    required
                    label={t("onboard.product.product_title")}
                    errors={errors.title?.message}
                    help={t("onboard.product.product_helper")}
                  >
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Form.Input
                          placeholder={t("onboard.product.product_placeholder")}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    required
                    errors={errors.attachments as Array<null | Record<string, string>>}
                    label={t("onboard.product.upload_attachment")}
                    help={t("onboard.product.upload_attachment_helper")}
                  >
                    <Controller
                      name={"attachments"}
                      control={control}
                      render={({ field: { onChange, ...rest } }) => (
                        <Form.File
                          accept={["*"]}
                          maxFiles={10}
                          maxSize={100}
                          onChange={(files: SingleFile[]) => {
                            if (files.length) {
                              onChange(files);
                            }
                          }}
                          {...rest}
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

export default CreateProduct;
