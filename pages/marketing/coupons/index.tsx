import React from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CouponsCols from "@/columns/coupons";
import { AddonController, Datatable, EmptyStateTable, Layout } from "@/components";
import { useToast } from "@/components/toast";
import { useDataExport, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCouponsQuery, useUpdateCouponMutation } from "@/store/slices/api/couponsSlice";
import { APIActionResponse } from "@/types";
import { Coupon } from "@/types/models/coupon";

import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  const { displayErrors } = useResponseToastHandler({});

  const [exportCoupons] = useDataExport();

  const router = useRouter();

  const [toast] = useToast();

  const handleExport = async (tableInstance: any) => {
    exportCoupons({
      endpoint: "/coupons/export",
      name: "coupons",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [updateCoupon] = useUpdateCouponMutation();

  const handleToggleEnabled = async (coupon: Coupon) => {
    const newCoupon = (await updateCoupon({
      id: coupon.id,
      enabled: !coupon.enabled
    })) as APIActionResponse<Coupon>;

    if (displayErrors(newCoupon)) return;

    toast.info({
      message: newCoupon.data?.data?.enabled
        ? t("marketing.coupons.enabled_message")
        : t("marketing.coupons.disabled_message")
    });
  };

  const AddButton = () => (
    <Button
      variant="primary"
      size="md"
      onClick={() => {
        router.push("/marketing/coupons/create");
      }}
      icon={
        <Icon
          size="sm"
          children={<PlusIcon />}
        />
      }
    >
      <Typography.Paragraph
        size="md"
        weight="medium"
        children={t("marketing.coupons.new_coupon")}
      />
    </Button>
  );

  return (
    <Layout title={t("marketing.coupons.title")}>
      <Layout.Container>
        <AddonController addon="coupons">
          <Datatable
            fetcher={useFetchCouponsQuery}
            columns={{
              columns: CouponsCols,
              props: {
                toggleCouponStatusHandler: handleToggleEnabled
              }
            }}
            emptyState={
              <EmptyStateTable
                title={t("marketing.coupons.empty_state.title")}
                content={t("marketing.coupons.empty_state.description")}
                icon={<PencilIcon />}
                children={<AddButton />}
              />
            }
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
                <AddButton />
              </>
            )}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
