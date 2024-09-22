import React, { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { omit } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler } from "react-hook-form";

import { Layout } from "@/components";
import PricingForm from "@/components/shared/PricingForm";
import BundlesTabs from "@/components/shared/products/BundlesTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  pricing_type: string;
  price: number;
  sales_price: number;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, refetch } = useFetchProductQuery(productId as string);
  const { displayErrors } = useResponseToastHandler({});
  const [updateProductMutation] = useUpdateProductMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/bundles" });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const $data = omit(data, ["pricing_type"]);
    const updatedProduct = (await updateProductMutation({
      id: product.id,
      ...$data,
      type: ProductType.BUNDLE
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    await refetch();

    await router.push(`/bundles/${productId}/publishing`);
  };

  return (
    <Layout title={product?.title}>
      <BundlesTabs preview_url={product?.url} />

      <Layout.Container>
        <PricingForm
          redirectToPathOnCancel={`/bundles/${product.id}`}
          onSubmit={onSubmit}
          defaultValues={product}
          sectionDescription={t("bundles.pricing.description")}
          sectionTitle={t("bundles.pricing.title")}
          labels={{
            freeLabel: t("bundles.pricing.make_this_bundle_free"),
            freeDescription: t("bundles.pricing.make_this_bundle_free_description"),
            paidLabel: t("bundles.pricing.one_time_payment"),
            paidDescription: t("bundles.pricing.one_time_payment_description")
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
