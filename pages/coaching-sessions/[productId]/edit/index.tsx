import { useEffect } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { HelpdeskLink, Layout } from "@/components";
import CoachingSessionsTabs from "@/components/shared/products/CoachingSessionsTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";
import { getMissingFileIds } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { Editor, Form, SingleFile, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  images: Array<SingleFile>;
  summary: string | null;
  meta: {
    reviews_enabled: boolean;
    show_downloads_count: boolean;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    slug: yup.string().required(),
    meta_title: yup.string().nullable(),
    meta_description: yup.string().nullable(),
    meta: yup.object().shape({
      reviews_enabled: yup.boolean(),
      show_downloads_count: yup.boolean()
    }),
    description: yup.string().min(3).nullable().required(),
    summary: yup.string().min(0).max(200).nullable(),

    images: yup
      .array()
      .of(yup.mixed())
      .min(1, t("validation.field_file_min_files", { files: 1 }))
      .required()
  });

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, refetch, isLoading } = useFetchProductQuery(productId as string);

  const [updateProductMutation] = useUpdateProductMutation();

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setError
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (!isLoading) {
      reset({
        title: product?.title,
        slug: product?.slug,
        description: product?.description,
        images: product?.images,
        summary: product?.summary,
        meta_title: product?.meta_title,
        meta_description: product?.meta_description,

        meta: {
          reviews_enabled: product?.meta?.reviews_enabled,
          show_downloads_count: product?.meta?.show_downloads_count
        }
      });
    }
  }, [product]);
  useEffect(() => {
    if (!isEmpty(product)) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
      }
    }
  }, [watch("title")]);
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedProduct = (await updateProductMutation({
      id: productId as any,
      ...{
        ...data,
        type: ProductType.COACHING_SESSION,
        images: data.images.map(({ file }) => file),
        "deleted-images": getMissingFileIds(product.images, data.images)
      }
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    if (!router.query.onboarding) {
      await refetch();
      await router.push(`/coaching-sessions/${productId}/settings`);
    } else {
      eventBus.emit("tour:nextStep");
    }
  };
  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/coaching-sessions/${productId}` });
    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);
  return (
    <Layout title={product?.title}>
      <CoachingSessionsTabs preview_url={product?.url} />
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={product}
                redirect={`/coaching-sessions/${productId}`}
                form={form}
              />
            }
          >
            <Form.Section
              className="mb-6"
              hasDivider
              title={t("coaching_sessions.content_page.general.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("coaching_sessions.content_page.general.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"helpdesk_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug="kyfya-inshaaa-glsa-astsharya-gdyda-1o7xxmi"
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
            >
              <div id="general-settings">
                <Form.Group
                  required
                  label={t("coaching_sessions.session_title_input_label")}
                  errors={errors.title?.message}
                >
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("coaching_sessions.session_title_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("coaching_sessions.coaching_url")}
                  errors={errors.slug?.message}
                >
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        dir="ltr"
                        append={
                          <div
                            className="bg-gray px-4 py-3"
                            dir="ltr"
                            children="/"
                          />
                        }
                        placeholder={t("coaching_sessions.session_coaching_url_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  required
                  label={t("coaching_sessions.session_images")}
                  errors={errors.images?.message}
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
                          onChange(files);
                        }}
                        {...rest}
                        append={
                          <span
                            className="text-xs text-gray-700"
                            dir="ltr"
                          >
                            {t("preferred_ratio", { ratio: "1324*346 PX" })}
                          </span>
                        }
                      />
                    )}
                  />
                </Form.Group>
              </div>

              <div id="product-details">
                <Form.Group
                  label={<div className="flex gap-2">{t("coaching_sessions.coaching_session_summary")}</div>}
                  errors={errors.summary?.message}
                >
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field: { value, ...rest } }) => {
                      return (
                        <div className="relative mb-4 flex flex-col">
                          <Form.Textarea
                            placeholder={t("coaching_sessions.coaching_session_placeholder")}
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
                  label={t("coaching_sessions.session_description")}
                  errors={errors.description?.message}
                  className="mb-0"
                >
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onBlur, value, ...rest } }) => {
                      return (
                        <Editor
                          placeholder={t("coaching_sessions.session_description_input_placeholder")}
                          defaultValue={product.description}
                          {...rest}
                        />
                      );
                    }}
                  />
                </Form.Group>
              </div>
            </Form.Section>
            <Form.Section
              title={t("coaching_sessions.settings.seo.title")}
              description={t("coaching_sessions.settings.seo.description")}
              className="mb-6"
              hasDivider
            >
              <Form.Group
                label={t("meta_title")}
                tooltip={t("coaching_sessions.settings.seo.meta_title_tooltip")}
              >
                <Controller
                  name="meta_title"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("meta_title_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group label={t("meta_description")}>
                <Controller
                  name="meta_description"
                  control={control}
                  render={({ field }) => (
                    <Form.Textarea
                      rows={5}
                      placeholder={t("meta_description_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("coaching_sessions.settings.reviews.title")}
              description={t("coaching_sessions.settings.reviews.description")}
            >
              <Form.Group errors={errors.meta?.reviews_enabled?.message}>
                <Controller
                  name={"meta.reviews_enabled"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("enable_reviews")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                className="mb-0"
                errors={errors.meta?.show_downloads_count?.message}
              >
                <Controller
                  name={"meta.show_downloads_count"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("coaching_sessions.settings.reviews.show_bookings_count")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
