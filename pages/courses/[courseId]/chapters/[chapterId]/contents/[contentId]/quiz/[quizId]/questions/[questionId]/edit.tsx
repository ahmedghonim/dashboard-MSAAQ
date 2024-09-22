import { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Card, Layout } from "@/components";
import QuestionForm from "@/components/shared/contents/question-form";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { useFetchQuestionQuery } from "@/store/slices/api/questionsSlice";
import { Course } from "@/types";

import { Breadcrumbs, Typography } from "@msaaqcom/abjad";

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

export default function Edit() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId, quizId, contentId, questionId, chapterId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const { data: question, isLoading } = useFetchQuestionQuery({
    id: questionId as string,
    quizId: quizId as string
  });

  useEffect(() => {
    dispatch({
      type: "app/setBackLink",
      payload: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/edit`
    });
  }, []);

  return (
    <Layout title={t("contents.quiz.header_title")}>
      <Layout.Container>
        <AddonController addon="courses.contents.quiz">
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
            <Link href={`/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/builder`}>
              <Typography.Paragraph as="span">{question?.quiz?.title}</Typography.Paragraph>
            </Link>
            <Typography.Paragraph as="span">{t("quiz.question.header_edit_title")}</Typography.Paragraph>
          </Breadcrumbs>
          {!isLoading ? <QuestionForm defaultValues={question} /> : <LoadingCard />}
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}