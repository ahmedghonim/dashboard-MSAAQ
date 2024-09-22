import React, { useEffect, useMemo } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Card, Layout } from "@/components";
import MeetingForm from "@/components/shared/contents/meeting-form";
import { useAppDispatch, useAppSelector } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { Course } from "@/types";

import { Breadcrumbs, Button, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Meeting() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);
  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);

  const zoomApp = useMemo(() => installedApps.find((app) => app.slug === "zoom"), [installedApps]);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}/chapters` });
  }, []);

  return (
    <Layout title={t("contents.meeting.header_title")}>
      <Layout.Container>
        <AddonController addon="courses.contents.zoom">
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
            <Typography.Paragraph as="span">{t("contents.meeting.header_title")}</Typography.Paragraph>
          </Breadcrumbs>
          {zoomApp &&
            (zoomApp?.installed ? (
              <MeetingForm
                defaultValues={{
                  id: 1,
                  updated_at: new Date(),
                  created_at: new Date(),
                  temp_values: true
                }}
              />
            ) : (
              <Layout.FormGrid
                sidebar={
                  <Layout.FormGrid.DefaultSidebar>
                    <></>
                  </Layout.FormGrid.DefaultSidebar>
                }
              >
                <Card>
                  <Card.Body>
                    <img
                      src="/images/zoom-named-logo.svg"
                      alt={zoomApp.title}
                    />
                    <Typography.Paragraph
                      className="my-6"
                      children={t("contents.meeting.enable_zoom_alert.content")}
                    />
                    <div className="flex flex-row gap-x-2">
                      <Button
                        as="a"
                        size="sm"
                        href="https://msaaq.crisp.help/ar/article/kyfya-idafa-drs-ao-agtmaaa-zoom-1udjr12/"
                        target="_blank"
                        children={t("contents.meeting.enable_zoom_alert.connect")}
                      />
                      <Button
                        variant="default"
                        ghost
                        size="sm"
                        as={Link}
                        href={`/courses/${courseId}/chapters`}
                        children={t("cancel_and_back")}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Layout.FormGrid>
            ))}
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
