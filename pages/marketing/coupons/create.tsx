import React from "react";

import { GetServerSideProps } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CouponForm from "@/components/coupons/CouponForm";
import i18nextConfig from "@/next-i18next.config";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function CreateCouponPage() {
  return <CouponForm />;
}
