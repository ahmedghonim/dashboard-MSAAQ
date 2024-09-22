import { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Layout } from "@/components";
import QuestionForm from "@/components/shared/contents/question-form";
import { useAppDispatch } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";
import { Course } from "@/types";

import { Breadcrumbs, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface Choice {
  content: string;
  credited: boolean | number;
  sort: number;
}

export type IFormInputs = {
  question: {
    id: number;
    title: string;
    explanation: string;
    type: string;
    sort: number;
    choices: Array<Choice>;
    updated_at: string;
    created_at: string;
  };
};

export default function Create() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { courseId, chapterId, contentId, quizId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);
  const { data: quiz, isLoading } = useFetchQuizQuery(quizId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}/chapters` });
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
              <Typography.Paragraph as="span">{quiz?.title}</Typography.Paragraph>
            </Link>
            <Typography.Paragraph as="span">{t("quiz.question.header_edit_title")}</Typography.Paragraph>
          </Breadcrumbs>
          <QuestionForm
            defaultValues={{
              id: 1,
              title: "",
              explanation: ""
            }}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
