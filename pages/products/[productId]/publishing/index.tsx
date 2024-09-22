import React, { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout, SuccessModal, useShareable } from "@/components";
import ProductPreviewCard from "@/components/cards/ProductPreviewCard";
import ProductTabs from "@/components/shared/products/ProductTabs";
import { GTM_EVENTS, GTM_PRODUCT_TYPES, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductStatus, ProductType } from "@/types";

import { Form } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  status: ProductStatus;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const share = useShareable();

  const schema = yup.object().shape({
    status: yup.string().required()
  });

  const form = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const { handleSubmit, reset } = form;

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, isLoading } = useFetchProductQuery(productId as string);

  const [updateProductMutation] = useUpdateProductMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/products/${productId}` });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      reset({
        status: product.status
      });
      dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
    }
  }, [product]);

  const { sendGTMEvent } = useGTM();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const oldStatus = product.status;
    const updatedProduct = (await updateProductMutation({
      id: productId as any,
      ...data,
      type: ProductType.DIGITAL
    })) as APIActionResponse<Product>;
    if (displayErrors(updatedProduct)) return;

    displaySuccess(updatedProduct);

    if (updatedProduct.data.data.status === ProductStatus.PUBLISHED) {
      setShowSuccessModal(true);

      if (oldStatus !== ProductStatus.PUBLISHED) {
        sendGTMEvent(GTM_EVENTS.PRODUCT_PUBLISHED, {
          product_type: GTM_PRODUCT_TYPES.DIGITAL,
          product_title: updatedProduct.data.data.title,
          product_id: updatedProduct.data.data.id
        });
      }
    }
  };

  return (
    <Layout title={product?.title}>
      <ProductTabs preview_url={product?.url} />
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                statuses={["draft", "published", "unlisted"]}
                form={form}
                product={product}
                redirect={`/products/${productId}`}
              />
            }
          >
            <ProductPreviewCard
              product={product}
              title={t("products.product_preview_in_academy")}
              product_landing_page_label={t("products.product_landing_page_url")}
            />
          </Layout.FormGrid>
        </Form>

        <SuccessModal
          open={showSuccessModal}
          onDismiss={() => {
            setShowSuccessModal(false);
          }}
          title={t("products.publishing.success_modal_title")}
          description={t("products.publishing.success_modal_description")}
          actionLink={product?.url ?? ""}
          actionLinkLabel={t("products.go_to_course")}
          shareButtonLabel={t("products.share")}
          shareButtonOnClick={() => {
            setShowSuccessModal(false);
            share([
              {
                label: t("products.product_landing_page_url"),
                url: product.url
              },
              {
                label: t("products.product_direct_checkout_url"),
                url: product.checkout_url
              }
            ]);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
