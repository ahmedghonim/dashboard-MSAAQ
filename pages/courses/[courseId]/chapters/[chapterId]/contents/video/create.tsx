import React, { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout } from "@/components";
import VideoForm from "@/components/shared/contents/video-form";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { Course } from "@/types";

import { Breadcrumbs, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
export default function Index() {
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
    <Layout title={t("contents.video.add_video")}>
      <Layout.Container>
        <AddonController addon="courses.contents.video">
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
            <Typography.Paragraph as="span">{t("contents.video.add_video")}</Typography.Paragraph>
          </Breadcrumbs>

          <VideoForm />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
