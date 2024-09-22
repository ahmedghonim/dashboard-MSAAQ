import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout } from "@/components";
import AssignmentForm from "@/components/shared/contents/assignment-form";
import SurveyForm from "@/components/shared/contents/survey-form";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchContentQuery } from "@/store/slices/api/contentsSlice";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { Course } from "@/types";

import { Breadcrumbs, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Create() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId, chapterId, contentId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);
  const { data: content } = useFetchContentQuery({
    courseId: courseId as any,
    chapterId: chapterId as any,
    contentId: contentId as any
  });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}/chapters` });
  }, []);

  return (
    <Layout>
      <Head>
        <title>{content?.title}</title>
      </Head>

      <Layout.Container>
        <AddonController addon="surveys">
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
            <Typography.Paragraph as="span">{content?.title}</Typography.Paragraph>
          </Breadcrumbs>
          <SurveyForm defaultValues={content} />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
