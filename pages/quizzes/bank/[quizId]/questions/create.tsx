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
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";

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
    query: { quizId }
  } = router;

  const { data: quiz, isLoading } = useFetchQuizQuery(quizId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/quizzes/bank/${quizId}` });
  }, []);

  return (
    <Layout title={t("quiz.question.header_add_title")}>
      <Layout.Container>
        <Breadcrumbs className="mb-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-4">
          <Link href="/">
            <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
          </Link>
          <Link href={`/quizzes/bank`}>
            <Typography.Paragraph as="span">{t("quizzes.bank.title")}</Typography.Paragraph>
          </Link>
          <Link href={`/quizzes/bank/${quizId}/questions`}>
            <Typography.Paragraph as="span">{quiz?.title}</Typography.Paragraph>
          </Link>
          <Typography.Paragraph as="span">{t("quiz.question.header_add_title")}</Typography.Paragraph>
        </Breadcrumbs>
        <QuestionForm
          type="question_bank"
          defaultValues={{
            id: 1,
            title: "",
            explanation: ""
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
