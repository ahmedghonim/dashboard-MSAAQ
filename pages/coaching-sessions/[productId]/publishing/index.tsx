import { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout, Price, SuccessModal, useShareable } from "@/components";
import ProductPreviewCard from "@/components/cards/ProductPreviewCard";
import CoachingSessionsTabs from "@/components/shared/products/CoachingSessionsTabs";
import {
  GTM_EVENTS,
  GTM_PRODUCT_TYPES,
  durationParser,
  useAppDispatch,
  useCopyToClipboard,
  useGTM,
  useResponseToastHandler
} from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductStatus, ProductType } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { DocumentCheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Title, Typography } from "@msaaqcom/abjad";

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

  const [copy, values] = useCopyToClipboard();

  const form = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    reset,
    formState: { isValid, isDirty }
  } = form;

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    query: { productId }
  } = router;

  const { data: product = {} as Product, refetch, isLoading } = useFetchProductQuery(productId as string);

  const [updateProductMutation] = useUpdateProductMutation();

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
      type: ProductType.COACHING_SESSION
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    displaySuccess(updatedProduct);
    if (router.query.onboarding) {
      eventBus.emit("tour:nextStep");
    }
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
            <Card className="mb-6">
              <Card.Body>
                <Title
                  className="mb-3"
                  subtitle={
                    <span
                      className="text-sm font-medium text-black"
                      children={product.title}
                    />
                  }
                  title={
                    <Typography.Paragraph
                      size="sm"
                      className="text-gray-700"
                      weight="medium"
                      children={t("coaching_sessions.session_card_title")}
                    />
                  }
                />
                <div className="mb-3 flex">
                  <Title
                    className="w-full"
                    subtitle={
                      <span
                        className="text-sm font-medium text-black"
                        children={t("coaching_sessions.session_duration", {
                          duration: durationParser(Number(product?.options?.duration), "minute")
                        })}
                      />
                    }
                    title={
                      <Typography.Paragraph
                        size="sm"
                        className="text-gray-700"
                        weight="medium"
                        children={t("coaching_sessions.session_card_duration")}
                      />
                    }
                  />
                  <Title
                    className="w-full"
                    subtitle={
                      <span
                        className="text-sm font-medium text-black"
                        children={
                          product.price > 0 ? (
                            <span className="flex gap-1">
                              {t("coaching_sessions.session_price")}
                              <Price price={product.price} />
                            </span>
                          ) : (
                            t("coaching_sessions.session_free")
                          )
                        }
                      />
                    }
                    title={
                      <Typography.Paragraph
                        size="sm"
                        className="text-gray-700"
                        weight="medium"
                        children={t("coaching_sessions.session_card_type")}
                      />
                    }
                  />
                </div>
                <Form.Group
                  label={
                    <Typography.Paragraph
                      children={t("coaching_sessions.coaching_url")}
                      size="sm"
                      weight="medium"
                      className="text-gray-700"
                    />
                  }
                  className="!mb-0"
                  children={
                    <Form.Input
                      readOnly
                      value={product.url}
                      dir="ltr"
                      prepend={
                        <Button
                          ghost
                          variant="default"
                          onClick={() => copy(product.url)}
                          icon={
                            !values.includes(product.url) ? (
                              <Icon
                                size="sm"
                                children={<DocumentDuplicateIcon />}
                              />
                            ) : (
                              <Icon
                                size="sm"
                                className="text-success"
                                children={<DocumentCheckIcon />}
                              />
                            )
                          }
                        />
                      }
                    />
                  }
                />
              </Card.Body>
            </Card>
            <ProductPreviewCard
              product={product}
              title={t("coaching_sessions.session_preview_in_academy")}
              product_landing_page_label={t("coaching_sessions.session_landing_page_url")}
            />
          </Layout.FormGrid>
        </Form>
        <SuccessModal
          open={showSuccessModal}
          onDismiss={() => {
            setShowSuccessModal(false);
          }}
          title={t("coaching_sessions.publishing.success_modal_title")}
          description={t("coaching_sessions.publishing.success_modal_description")}
          actionLink={product?.url ?? ""}
          actionLinkLabel={t("coaching_sessions.go_to_session")}
          shareButtonLabel={t("coaching_sessions.share_session")}
          shareButtonOnClick={() => {
            setShowSuccessModal(false);
            share([
              {
                label: t("coaching_sessions.session_landing_page_url"),
                url: product.url
              },
              {
                label: t("coaching_sessions.session_direct_checkout_url"),
                url: product.checkout_url
              }
            ]);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
