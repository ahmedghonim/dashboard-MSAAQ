import { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout, Tabs } from "@/components";
import QuestionList from "@/components/shared/contents/questions-list";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchContentQuery } from "@/store/slices/api/contentsSlice";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
const LoadingCard = () => {
  return (
    <div className="flex gap-4">
      <div className=" mb-6 h-[400px] w-3/4">
        <div className=" animate-pulse">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="h-56 w-full rounded bg-gray"></div>
            <div className="h-56 w-full rounded bg-gray"></div>
          </div>
        </div>
      </div>
      <div className="mb-6 h-[400px] w-1/4">
        <div className=" animate-pulse">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="h-14 w-full rounded bg-gray"></div>
            <div className="h-14 w-full rounded bg-gray"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default function Quiz() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId, chapterId, contentId }
  } = router;

  const { data: content, isLoading } = useFetchContentQuery({
    courseId: courseId as any,
    chapterId: chapterId as any,
    contentId: contentId as any
  });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}/chapters` });
  }, []);

  return (
    <Layout title={t("contents.quiz.header_title")}>
      <Tabs>
        <Tabs.Link
          as={Link}
          active={router.asPath === `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/builder`}
          href={{
            pathname: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/builder`
          }}
          children={t("quizzes.question_builder")}
        />
        <Tabs.Link
          as={Link}
          active={router.asPath === `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/edit`}
          href={{
            pathname: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/edit`
          }}
          children={t("quizzes.quiz_settings")}
        />
      </Tabs>
      <Layout.Container>
        <AddonController addon="courses.contents.quiz">
          {!isLoading ? <QuestionList defaultValues={content} /> : <LoadingCard />}
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
