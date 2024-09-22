import { useEffect } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout } from "@/components";
import ProductsAndCoursesSelect from "@/components/select/ProductsAndCoursesSelect";
import BundlesTabs from "@/components/shared/products/BundlesTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Course, Product, ProductType } from "@/types";

import { TrashIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  products: Array<{ id: number | string; label: string; value: string }>;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    products: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string().required(),
          label: yup.string().required(),
          value: yup.string().required()
        })
      )
      .min(1)
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
    formState: { errors },
    reset,
    watch,
    setValue,
    setError
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/bundles" });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      reset({
        products:
          product.bundle?.map((product) => ({
            id: product.id,
            label: product.title,
            value: (product as Course).certification ? `Course-${product.id}` : `Product-${product.id}`
          })) ?? []
      });
    }
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedProduct = (await updateProductMutation({
      id: product.id,
      // @ts-ignore
      products: data.products.map((product) => product.value),
      type: ProductType.BUNDLE
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    await refetch();

    await router.push(`/bundles/${productId}/settings`);
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
            <Form.Section>
              <Form.Group
                label={t("bundles.bundle_products_select_label")}
                required
                errors={errors.products?.message}
              >
                <Controller
                  render={({ field }) => (
                    <ProductsAndCoursesSelect
                      filterProducts={(p) => p.id !== product.id}
                      placeholder={t("bundles.bundle_products_select_placeholder")}
                      {...field}
                    />
                  )}
                  name={"products"}
                  control={control}
                />
              </Form.Group>
              {watch("products")?.length > 0 && (
                <Form.Group
                  className="mb-0 space-y-4"
                  label={t("bundles.bundle_select_products_label")}
                >
                  {watch("products")?.map((product, index) => (
                    <Card key={index}>
                      <Card.Body className="flex items-center justify-between">
                        <Typography.Paragraph
                          size="lg"
                          weight="medium"
                        >
                          {product.label}
                        </Typography.Paragraph>
                        <Button
                          variant="danger"
                          size="sm"
                          ghost
                          icon={
                            <Icon>
                              <TrashIcon />
                            </Icon>
                          }
                          onClick={() => {
                            const products = watch("products");

                            const newProducts = products.filter(({ value }) => value !== product.value);
                            setValue("products", newProducts, { shouldValidate: true, shouldDirty: true });
                          }}
                        />
                      </Card.Body>
                    </Card>
                  ))}
                </Form.Group>
              )}
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
