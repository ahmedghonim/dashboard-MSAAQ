import React from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ReminderForm from "@/components/reminders/ReminderForm";
import i18nextConfig from "@/next-i18next.config";
import { useFetchReminderQuery } from "@/store/slices/api/abandonedCartsSlice";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function EditCouponPage() {
  const router = useRouter();
  const {
    query: { reminderId }
  } = router;

  const { data, isLoading } = useFetchReminderQuery(reminderId as string);

  return !isLoading ? <ReminderForm reminder={data} /> : null;
}
