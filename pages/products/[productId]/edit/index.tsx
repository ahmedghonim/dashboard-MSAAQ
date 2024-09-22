import { useEffect } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { HelpdeskLink, Layout } from "@/components";
import ProductTabs from "@/components/shared/products/ProductTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product } from "@/types";
import { classNames, getMissingFileIds } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { LinkIcon } from "@heroicons/react/24/outline";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";

import { Alert, Editor, FULL_TOOLBAR_BUTTONS, Form, Icon, SingleFile, Typography, useAbjad } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  description: string;
  attachments: Array<SingleFile>;
  images: Array<SingleFile>;
  summary: string | null;
  product_type: string;
  meta: {
    calendar_link_type?: "custom_calendar_url" | "embed_url";
    embed_url?: string;
    custom_calendar_url?: string;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const abjad = useAbjad();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    description: yup.string().min(3).nullable().required(),
    summary: yup.string().min(0).max(200).nullable(),
    attachments: yup
      .array()
      //@ts-ignore
      .of(yup.mixed().fileSize(100, t("validation.field_file_size_invalid", { size: "100MB" })))
      .when("product_type", {
        is: "attachments_type",
        then: yup
          .array()
          .min(1, t("validation.field_file_min_files", { files: 1 }))
          .max(10, t("validation.field_file_max_files", { files: 10 }))
      })
      .nullable(),
    images: yup
      .array()
      .of(yup.mixed())
      .min(1, t("validation.field_file_min_files", { files: 1 }))
      .required(),
    meta: yup.object().when("product_type", {
      is: "url_type",
      then: yup.object().shape({
        calendar_link_type: yup.string().required(),
        custom_calendar_url: yup.string().when("calendar_link_type", {
          is: "custom_calendar_url",
          then: yup.string().required()
        }),
        embed_url: yup.string().when("calendar_link_type", {
          is: "embed_url",
          then: yup.string().required()
        })
      })
    })
  });

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, refetch, isLoading } = useFetchProductQuery(productId as string);

  const [updateProductMutation] = useUpdateProductMutation();

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    getValues,
    setError
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (!isLoading) {
      reset({
        title: product?.title,
        description: product?.description,
        attachments: product?.attachments,
        images: product?.images,
        summary: product?.summary,
        meta: {
          ...product?.meta,
          calendar_link_type: "custom_calendar_url"
        },
        product_type: product?.meta?.custom_calendar_url || product?.meta?.embed_url ? "url_type" : "attachments_type"
      });
      dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
    }
    abjad.setEditorPlugin("plugins.image.uploadURL", `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/temp-media`);
    abjad.setEditorPlugin("plugins.image.paramName", "file");
  }, [product]);

  useEffect(() => {
    if (watch("product_type") == "url_type") {
      reset({
        ...getValues(),
        meta: {
          ...getValues().meta,
          custom_calendar_url: getValues().meta?.custom_calendar_url ?? "",
          embed_url: getValues().meta?.embed_url ?? ""
        }
      });
    }
  }, [watch("product_type")]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedProduct = (await updateProductMutation({
      id: productId as any,
      ...{
        ...data,
        ...(data.attachments && data.product_type == "attachments_type"
          ? {
              attachments: data.attachments.map(({ file }) => file),
              "deleted-attachments": getMissingFileIds(product?.attachments, data?.attachments)
            }
          : { attachments: [], "deleted-attachments": product?.attachments.map(({ id }) => id) }),

        images: data.images.map(({ file }) => file),
        ...(data.product_type == "url_type"
          ? {
              meta: {
                ...data.meta,
                calendar_link_type: data.meta?.custom_calendar_url ? "custom_calendar_url" : "embed_url"
              }
            }
          : {
              meta: {
                custom_calendar_url: "",
                embed_url: ""
              }
            }),
        "deleted-images": getMissingFileIds(product?.images, data?.images)
      }
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    if (!router.query.onboarding) {
      await refetch();

      await router.push(`/products/${productId}/settings`);
    } else {
      eventBus.emit("tour:nextStep");
    }
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/products/${productId}` });
    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  return (
    <Layout title={product?.title}>
      <ProductTabs preview_url={product?.url} />
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={product}
                redirect={`/products/${productId}`}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("products.content_page.general.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("products.content_page.general.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"helpdesk_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug="kyfya-inshaaa-mntg-rkmy-gdyd-nxh09v"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              className="mb-6"
            >
              <div id="general-settings">
                <Form.Group
                  required
                  label={t("products.product_title")}
                  errors={errors.title?.message}
                >
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("products.product_title_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("products.product_attachments")}
                  required
                >
                  <div className="flex items-start gap-4">
                    <Controller
                      name="product_type"
                      control={control}
                      defaultValue={"attachments_type"}
                      render={({ field: { value, ...field } }) => (
                        <label
                          className={classNames(
                            "w-full cursor-pointer rounded border px-4 py-4",
                            "flex items-center gap-2",
                            value === "attachments_type" ? "border-primary bg-primary-50" : "border-gray"
                          )}
                        >
                          <Form.Radio
                            id="type-attachments_type"
                            value={"attachments_type"}
                            checked={value === "attachments_type"}
                            label={t("products.attachments_type")}
                            {...field}
                          />

                          <Icon
                            size="lg"
                            children={<ArrowUpTrayIcon />}
                            className="mr-auto"
                          />
                        </label>
                      )}
                    />

                    <Controller
                      name="product_type"
                      control={control}
                      defaultValue={"url_type"}
                      render={({ field: { value, ...field } }) => (
                        <label
                          className={classNames(
                            "w-full cursor-pointer rounded border px-4 py-4",
                            "flex items-center gap-2",
                            value === "url_type" ? "border-primary bg-primary-50" : "border-gray"
                          )}
                        >
                          <Form.Radio
                            id="type-url_type"
                            value={"url_type"}
                            checked={value === "url_type"}
                            label={t("products.url_type")}
                            {...field}
                          />

                          <Icon
                            size="lg"
                            children={<LinkIcon />}
                            className="mr-auto"
                          />
                        </label>
                      )}
                    />
                  </div>
                </Form.Group>
                <Form.Group
                  required
                  className={classNames(watch("product_type") === "attachments_type" ? "block" : "hidden")}
                  errors={errors.attachments as Array<null | Record<string, string>>}
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
                        append={
                          <>
                            <Alert
                              variant="default"
                              className="mt-5"
                              dismissible
                              children={t("products.alerts.attachments")}
                            />
                          </>
                        }
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
                {watch("product_type") === "url_type" &&
                  (watch("meta.calendar_link_type") == "custom_calendar_url" ? (
                    <Form.Group
                      label={t("products.custom_calendar_url")}
                      required
                      errors={errors.meta?.custom_calendar_url?.message}
                    >
                      <Controller
                        name={"meta.custom_calendar_url"}
                        control={control}
                        render={({ field }) => (
                          <Form.Input
                            dir="ltr"
                            placeholder="https://example.com"
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                  ) : (
                    <Form.Group
                      label={t("products.custom_calendar_url")}
                      required
                      errors={errors.meta?.embed_url?.message}
                    >
                      <Controller
                        name={"meta.embed_url"}
                        control={control}
                        render={({ field }) => (
                          <Form.Input
                            dir="ltr"
                            placeholder="https://example.com"
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                  ))}
              </div>

              <div id="product-images">
                <Form.Group
                  required
                  label={t("products.product_images")}
                  errors={errors.images as Array<null | Record<string, string>>}
                >
                  <Controller
                    name={"images"}
                    control={control}
                    render={({ field: { onChange, ...rest } }) => (
                      <Form.File
                        accept={["image/*"]}
                        maxFiles={10}
                        maxSize={2}
                        onChange={(files: SingleFile[]) => {
                          if (files.length) {
                            onChange(files);
                          }
                        }}
                        append={
                          <>
                            <span
                              className="text-xs text-gray-700"
                              dir="ltr"
                            >
                              {t("preferred_ratio", { ratio: "1324*744 PX" })}
                            </span>
                            <Alert
                              variant="default"
                              className="mt-5"
                              dismissible
                              children={t("products.alerts.images")}
                            />
                          </>
                        }
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
              </div>

              <div id="product-details">
                <Form.Group
                  label={<div className="flex gap-2">{t("products.product_summary")}</div>}
                  errors={errors.summary?.message}
                >
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field: { value, ...rest } }) => {
                      return (
                        <div className="relative mb-4 flex flex-col">
                          <Form.Textarea
                            placeholder={t("products.product_summary_placeholder")}
                            value={value ?? ""}
                            rows={5}
                            maxLength={200}
                            {...rest}
                          />

                          <div className="absolute -bottom-6 left-0 flex gap-1">
                            <span className="text-xs text-gray-800">200</span>
                            <span className="text-xs text-gray-800">/</span>
                            <span className="text-xs">{value?.length ?? 0}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("products.product_description")}
                  errors={errors.description?.message}
                  className="mb-0"
                >
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onBlur, value, ...rest } }) => {
                      return (
                        <Editor
                          placeholder={t("products.product_description_placeholder")}
                          defaultValue={product.description}
                          toolbar={FULL_TOOLBAR_BUTTONS}
                          {...rest}
                        />
                      );
                    }}
                  />
                </Form.Group>
              </div>
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
