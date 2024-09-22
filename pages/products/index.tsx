import React, { useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProductsCols from "@/columns/products";
import { AddonController, CreateNewModal, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import { GTM_EVENTS, useDataExport, useGTM, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useCreateProductMutation, useFetchProductsQuery } from "@/store/slices/api/productsSlice";
import { APIActionResponse, Product, ProductType } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { displayErrors } = useResponseToastHandler({});
  const [showCreateProductModal, setShowCreateProductModal] = useState<boolean>(false);
  const { t } = useTranslation();
  const router = useRouter();
  const { sendGTMEvent } = useGTM();

  const [exportProducts] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportProducts({
      endpoint: "/products/export",
      name: "products",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [createProduct] = useCreateProductMutation();

  const handleProductCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const product = (await createProduct({
      title,
      type: ProductType.DIGITAL
    })) as APIActionResponse<Product>;

    if (displayErrors(product)) {
      return;
    } else {
      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: "digital",
        product_title: title,
        product_id: product?.data.data.id
      });

      await router.push(`/products/${product?.data.data.id}/edit`);
    }
  };

  return (
    <Layout title={t("products.title")}>
      <Layout.Container>
        <AddonController addon="products-digital">
          <Datatable
            fetcher={useFetchProductsQuery}
            params={{
              filters: {
                type: ProductType.DIGITAL
              }
            }}
            columns={{
              columns: ProductsCols
            }}
            hasSearch={true}
            toolbar={(instance) => (
              <>
                <Button
                  icon={
                    <Icon
                      size="sm"
                      children={<ArrowDownTrayIcon />}
                    />
                  }
                  onClick={() => handleExport(instance)}
                  variant="default"
                  size="md"
                  className="ltr:mr-4 rtl:ml-4"
                >
                  <Typography.Paragraph
                    size="md"
                    weight="medium"
                    children={t("export")}
                  />
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setShowCreateProductModal(true);
                  }}
                  icon={
                    <Icon
                      size="sm"
                      children={<PlusIcon />}
                    />
                  }
                  children={t("products.new_product")}
                />
              </>
            )}
          />
          <CreateNewModal
            title={t("products.add_new_products")}
            type="product"
            inputLabel={t("products.product_title")}
            inputPlaceholder={t("products.product_title_input_placeholder")}
            submitButtonText={t("add_new")}
            createAction={handleProductCreation}
            open={showCreateProductModal}
            onDismiss={() => {
              setShowCreateProductModal(false);
            }}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
