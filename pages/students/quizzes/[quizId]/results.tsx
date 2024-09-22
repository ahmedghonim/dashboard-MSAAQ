import React, { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import QuizMembersCols from "@/columns/quizMembers";
import { Datatable, Layout } from "@/components";
import { useAppDispatch, useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchQuizMembersQuery } from "@/store/slices/api/quizMembersSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";
import { Quiz } from "@/types";

import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function ResultsIndex() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [exportQuizResults] = useDataExport();
  const {
    query: { quizId }
  } = router;

  const { data: quiz = {} as Quiz, isLoading } = useFetchQuizQuery(quizId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/students/quizzes` });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      dispatch({ type: "app/setTitle", payload: quiz?.title ?? "" });
    }
  }, [quiz]);

  const handleExport = async (tableInstance: any) => {
    exportQuizResults({
      endpoint: `/quizzes/${quizId}/members/export`,
      name: `quiz-results-${quizId}`,
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  return (
    <Layout title={quiz?.title}>
      <Layout.Container>
        <Datatable
          fetcher={useFetchQuizMembersQuery}
          columns={{
            columns: QuizMembersCols,
            props: {
              quiz_id: quizId as string,
              sortables: ["percent_correct", "completed_at"]
            }
          }}
          toolbar={(instance) => (
            <>
              <Button
                icon={
                  <Icon
                    size="sm"
                    children={<ArrowDownTrayIcon />}
                  />
                }
                onClick={() => handleExport(instance)}
                variant="default"
                size="md"
              >
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                  children={t("export")}
                />
              </Button>
            </>
          )}
        />
      </Layout.Container>
    </Layout>
  );
}
