import React, { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout, SuccessModal, useShareable } from "@/components";
import ProductPreviewCard from "@/components/cards/ProductPreviewCard";
import BundlesTabs from "@/components/shared/products/BundlesTabs";
import { GTM_EVENTS, GTM_PRODUCT_TYPES, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductStatus, ProductType } from "@/types";
import { getProductType } from "@/utils";

import { Form, Typography } from "@msaaqcom/abjad";

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
  const share = useShareable();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
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

  const { data: product = {} as Product, refetch, isLoading } = useFetchProductQuery(productId as string);

  const [updateProductMutation] = useUpdateProductMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/bundles" });
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
      id: product.id,
      ...data,
      type: ProductType.BUNDLE
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    displaySuccess(updatedProduct);

    await refetch();

    if (updatedProduct.data.data.status === ProductStatus.PUBLISHED) {
      setShowSuccessModal(true);

      if (oldStatus !== ProductStatus.PUBLISHED) {
        sendGTMEvent(GTM_EVENTS.PRODUCT_PUBLISHED, {
          product_type: GTM_PRODUCT_TYPES.SESSION,
          product_title: updatedProduct.data.data.title,
          product_id: updatedProduct.data.data.id
        });
      }
    }
  };

  return (
    <Layout title={product?.title}>
      <BundlesTabs preview_url={product?.url} />

      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                statuses={["draft", "published", "unlisted"]}
                form={form}
                product={product}
                redirect={`/bundles/${productId}`}
              />
            }
          >
            <Card className="mb-6">
              <Card.Header>
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                  children={t("bundles.tabs.bundle_content")}
                />
              </Card.Header>
              <Card.Body className="flex flex-col space-y-4">
                {product?.bundle?.map((product, index) => (
                  <Card
                    key={index}
                    className="bg-gray-100"
                  >
                    <Card.Body>
                      <Typography.Paragraph
                        size="lg"
                        weight="medium"
                      >
                        {product.title}
                      </Typography.Paragraph>
                      <Typography.Paragraph
                        size="md"
                        weight="normal"
                        className="text-gray-700"
                      >
                        {t(getProductType(product))}
                      </Typography.Paragraph>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
            <ProductPreviewCard
              product={product}
              title={t("bundles.bundle_preview_in_academy")}
              product_landing_page_label={t("bundles.bundle_landing_page_url")}
            />
          </Layout.FormGrid>
        </Form>
        <SuccessModal
          open={showSuccessModal}
          onDismiss={() => {
            setShowSuccessModal(false);
          }}
          title={t("bundles.publishing.success_modal_title")}
          description={t("bundles.publishing.success_modal_description")}
          actionLink={product?.url ?? ""}
          actionLinkLabel={t("bundles.go_to_bundle")}
          shareButtonLabel={t("bundles.share_bundle")}
          shareButtonOnClick={() => {
            setShowSuccessModal(false);
            share([
              {
                label: t("bundles.bundle_landing_page_url"),
                url: product.url
              },
              {
                label: t("bundles.bundle_direct_checkout_url"),
                url: product.checkout_url
              }
            ]);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
