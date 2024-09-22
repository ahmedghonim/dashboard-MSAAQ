import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import TextForm from "@/components/shared/contents/text-form";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { Course } from "@/types";

import { Breadcrumbs, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Text() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}/chapters` });
  }, []);

  return (
    <Layout title={t("contents.text.add_text")}>
      <Layout.Container>
        <Breadcrumbs className="mb-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-4">
          <Link href="/">
            <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
          </Link>
          <Link href="/courses">
            <Typography.Paragraph as="span">{t("courses.title")}</Typography.Paragraph>
          </Link>
          <Link href={`/courses/${courseId}/chapters`}>
            <Typography.Paragraph as="span">{course?.title}</Typography.Paragraph>
          </Link>
          <Typography.Paragraph as="span">{t("contents.text.add_text")}</Typography.Paragraph>
        </Breadcrumbs>
        <TextForm defaultValues={{ id: 1, updated_at: new Date(), created_at: new Date(), temp_values: true }} />
      </Layout.Container>
    </Layout>
  );
}
