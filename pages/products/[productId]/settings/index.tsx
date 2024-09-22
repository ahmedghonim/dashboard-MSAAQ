import { ChangeEvent, useEffect } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { omit } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadCategories } from "@/actions/options";
import { Layout } from "@/components";
import { Select } from "@/components/select";
import ProductTabs from "@/components/shared/products/ProductTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType, TaxonomyType } from "@/types";
import { randomUUID, slugify } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { Form } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  slug: string;
  meta_title: string;
  meta_description: string;
  meta: {
    reviews_enabled: boolean;
    show_downloads_count: boolean;
  };
  category: {
    label: string;
    value: any;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    slug: yup.string().required(),
    meta_title: yup.string().nullable(),
    meta_description: yup.string().nullable(),
    category: yup.mixed(),
    meta: yup.object().shape({
      reviews_enabled: yup.boolean(),
      show_downloads_count: yup.boolean()
    })
  });

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, isLoading } = useFetchProductQuery(productId as string);

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
    if (!isLoading) {
      reset({
        slug: product.slug,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        meta: product.meta,
        category: {
          label: product?.category?.name,
          value: product?.category?.id
        }
      });
      dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
    }
  }, [product]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const obj = {
      ...omit(data, ["category"]),
      type: ProductType.DIGITAL,
      category_id: data.category.value
    };

    const updatedProduct = (await updateProductMutation({
      id: productId as any,
      ...obj
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    if (!router.query.onboarding) {
      await router.push(`/products/${productId}/pricing`);
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
              title={t("products.settings.general.title")}
              description={t("products.settings.general.description")}
              className="mb-6"
              hasDivider
              id="general-settings"
            >
              <Form.Group
                required
                label={t("products.product_slug")}
                help={t("products.product_slug_input_help")}
                errors={errors.slug?.message}
              >
                <Controller
                  name="slug"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Form.Input
                      className="swipe-direction"
                      append={
                        <div
                          className="swipe-direction bg-gray px-4 py-3"
                          children="/"
                        />
                      }
                      placeholder="landing-page-figma"
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
              <Form.Group label={t("category")}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultOptions
                      isCreatable={true}
                      placeholder={t("category_select_placeholder")}
                      loadOptions={(inputValue, callback) => {
                        loadCategories(inputValue, callback, TaxonomyType.PRODUCT_CATEGORY, {
                          cache_key: randomUUID()
                        });
                      }}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
            <Form.Section
              title={t("products.settings.seo.title")}
              description={t("products.settings.seo.description")}
              className="mb-6"
              hasDivider
            >
              <Form.Group
                label={t("meta_title")}
                tooltip={t("products.settings.seo.meta_title_tooltip")}
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
              title={t("products.settings.downloads.title")}
              description={t("products.settings.downloads.description")}
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
                      label={t("products.settings.downloads.show_downloads_count")}
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
