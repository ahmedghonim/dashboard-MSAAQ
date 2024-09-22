import React from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CouponForm from "@/components/coupons/CouponForm";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCouponQuery } from "@/store/slices/api/couponsSlice";
import { Coupon } from "@/types/models/coupon";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function EditCouponPage() {
  const router = useRouter();
  const {
    query: { couponId }
  } = router;

  const { data: coupon = {} as Coupon, isLoading } = useFetchCouponQuery(couponId as string);

  return !isLoading ? <CouponForm coupon={coupon} /> : null;
}
