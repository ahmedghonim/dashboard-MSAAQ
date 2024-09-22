import { useEffect } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { omit } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler } from "react-hook-form";

import { Layout } from "@/components";
import PricingForm from "@/components/shared/PricingForm";
import CoachingSessionsTabs from "@/components/shared/products/CoachingSessionsTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchProductQuery, useUpdateProductMutation } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";
import { eventBus } from "@/utils/EventBus";

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

  const [updateProductMutation] = useUpdateProductMutation();
  const { displayErrors } = useResponseToastHandler({});

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/coaching-sessions/${productId}` });
  }, []);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const $data = omit(data, ["pricing_type"]);
    const updatedProduct = (await updateProductMutation({
      id: productId as any,
      ...$data,
      type: ProductType.COACHING_SESSION
    })) as APIActionResponse<Product>;

    if (displayErrors(updatedProduct)) return;

    await refetch();

    await router.push(`/coaching-sessions/${productId}/publishing`);
  };

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: product?.title ?? "" });
  }, [product]);

  return (
    <Layout title={product?.title}>
      <CoachingSessionsTabs preview_url={product?.url} />

      <Layout.Container>
        <PricingForm
          redirectToPathOnCancel={`/coaching-sessions/${product.id}`}
          onSubmit={onSubmit}
          defaultValues={product}
          sectionDescription={t("coaching_sessions.pricing.description")}
          sectionTitle={t("coaching_sessions.pricing.title")}
          labels={{
            freeLabel: t("coaching_sessions.pricing.make_this_session_free"),
            freeDescription: t("coaching_sessions.pricing.make_this_session_free_description"),
            paidLabel: t("coaching_sessions.pricing.one_time_payment"),
            paidDescription: t("coaching_sessions.pricing.one_time_payment_description")
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
