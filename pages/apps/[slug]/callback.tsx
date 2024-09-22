import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { LoadingScreen } from "@/components/shared/loading-screen/LoadingScreen";
import { useToast } from "@/components/toast";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function AppCallback() {
  const [toast] = useToast();
  const router = useRouter();
  const { slug, ...query } = router.query;

  useEffect(() => {
    if (!Object.keys(query).length) {
      router.push(`/apps/${slug}`);

      return;
    }

    const handleCallback = async () => {
      await axios
        .post(`/apps/${slug}/callback`, query)
        .then(({ data }) => {
          toast.success({
            message: data.message?.body
          });
        })
        .catch((err) => {
          toast.error({
            message: err.response?.data?.message ?? err.message
          });
        });

      await router.push(`/apps/${slug}`);
    };

    handleCallback();
  }, [query]);

  return <LoadingScreen />;
}
