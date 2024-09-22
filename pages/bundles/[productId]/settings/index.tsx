import { ChangeEvent, useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { HelpdeskLink, Layout } from "@/components";
import BundlesTabs from "@/components/shared/products/BundlesTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";
import { getMissingFileIds, slugify } from "@/utils";

import { Badge, Editor, Form, SingleFile, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  slug: string;
  summary: string | null;
  images: Array<SingleFile>;
  description: string;
  meta_title: string;
  meta_description: string;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    title: yup.string().required(),
    slug: yup.string().required(),
    summary: yup.string().min(0).max(200).nullable(),
    images: yup
      .array()
      .of(yup.mixed())
      .min(1, t("validation.field_file_min_files", { files: 1 }))
      .required(),
    description: yup.string().nullable().required(),
    meta_title: yup.string().nullable(),
    meta_description: yup.string().nullable()
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
    formState: { errors },
    reset,
    setError
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/bundles" });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      reset({
        title: product?.title,
        slug: product.slug,
        summary: product?.summary,
        images: product.images,
        description: product.description,
        meta_title: product.meta_title,
        meta_description: product.meta_description
      });
      dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
    }
  }, [product]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedProduct = (await updateProductMutation({
      id: product.id,
      ...data,
      images: data.images.map(({ file }) => file),
      "deleted-images": getMissingFileIds(product?.images, data?.images),
      type: ProductType.BUNDLE
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    await refetch();

    await router.push(`/bundles/${productId}/pricing`);
  };

  return (
    <Layout title={product?.title}>
      <BundlesTabs preview_url={product?.url} />

      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={product}
                redirect={`/bundles/${productId}`}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("bundles.settings.general.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("bundles.settings.general.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"helpdesk_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug={"inshaaa-hzma-mntgat-gdyda-109csmh"}
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              className="mb-6"
              hasDivider
            >
              <Form.Group
                required
                label={t("bundles.bundle_title")}
                errors={errors.title?.message}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("bundles.bundle_title_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("bundles.bundle_slug")}
                errors={errors.slug?.message}
              >
                <Controller
                  name="slug"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Form.Input
                      dir="ltr"
                      append={
                        <div
                          className="bg-gray px-4 py-3"
                          dir="ltr"
                          children="/"
                        />
                      }
                      placeholder="design-products"
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
              <Form.Group
                required
                label={t("bundles.bundle_images")}
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
                        if (files.length) {
                          onChange(files);
                        }
                      }}
                      {...rest}
                      append={
                        <>
                          <span
                            className="text-xs text-gray-700"
                            dir="ltr"
                          >
                            {t("preferred_ratio", { ratio: "1324*744 PX" })}
                          </span>
                        </>
                      }
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                label={<div className="flex gap-2">{t("bundles.bundle_summary")}</div>}
                errors={errors.summary?.message}
              >
                <Controller
                  name="summary"
                  control={control}
                  render={({ field: { value, ...rest } }) => {
                    return (
                      <div className="relative mb-4 flex flex-col">
                        <Form.Textarea
                          placeholder={t("bundles.bundle_summary_placeholder")}
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
                label={t("bundles.bundle_description")}
                errors={errors.description?.message}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onBlur, value, ...rest } }) => {
                    return (
                      <Editor
                        placeholder={t("bundles.bundle_description_input_placeholder")}
                        defaultValue={product.description}
                        {...rest}
                      />
                    );
                  }}
                />
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("bundles.settings.seo.title")}
              description={t("bundles.settings.seo.description")}
            >
              <Form.Group
                label={t("meta_title")}
                tooltip={t("bundles.settings.seo.meta_title_tooltip")}
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
              <Form.Group
                label={t("meta_description")}
                className="mb-0"
              >
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
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
