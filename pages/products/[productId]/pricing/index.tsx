import React, { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler } from "react-hook-form";

import { Layout } from "@/components";
import PricingForm, { IFormPricingFormInputs } from "@/components/shared/PricingForm";
import ProductTabs from "@/components/shared/products/ProductTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product } = useFetchProductQuery(productId as string);
  const { displayErrors } = useResponseToastHandler({});

  const [updateProductMutation] = useUpdateProductMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/products/${productId}` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  const onSubmit: SubmitHandler<IFormPricingFormInputs> = async (data) => {
    const $data = omit(data, ["pricing_type"]);
    const updatedProduct = (await updateProductMutation({
      id: product.id as any,
      ...$data,
      type: ProductType.DIGITAL
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    await router.push(`/products/${productId}/publishing`);
  };

  return (
    <Layout title={product?.title}>
      <ProductTabs preview_url={product?.url} />
      <Layout.Container>
        <PricingForm
          redirectToPathOnCancel={`/products/${product.id}`}
          onSubmit={onSubmit}
          defaultValues={product}
          sectionDescription={t("products.pricing.description")}
          sectionTitle={t("products.pricing.title")}
          labels={{
            freeLabel: t("products.pricing.make_this_product_free"),
            freeDescription: t("products.pricing.make_this_product_free_description"),
            paidLabel: t("products.pricing.one_time_payment"),
            paidDescription: t("products.pricing.one_time_payment_description")
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
