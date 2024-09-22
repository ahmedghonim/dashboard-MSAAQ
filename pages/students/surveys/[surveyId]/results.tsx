import { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SurveyMembersCols from "@/columns/surveyMembers";
import { Datatable, Layout } from "@/components";
import { useAppDispatch, useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchQuestionsQuery } from "@/store/slices/api/questionsSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";
import { useFetchSurveysMembersQuery } from "@/store/slices/api/surveyMembersSlice";
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
    query: { surveyId }
  } = router;

  const { data: quiz = {} as Quiz, isLoading } = useFetchQuizQuery(surveyId as string);

  const { data: questionsData, isLoading: isQuestionsLoading } = useFetchQuestionsQuery({
    quizId: surveyId as string
  });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/students/surveys` });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      dispatch({ type: "app/setTitle", payload: quiz?.title ?? "" });
    }
  }, [quiz]);

  const handleExport = async (tableInstance: any) => {
    exportQuizResults({
      endpoint: `/surveys/${surveyId}/members/export`,
      name: `quiz-results-${surveyId}`,
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  return (
    <Layout>
      <Head>
        <title>{quiz?.title}</title>
      </Head>
      <Layout.Container>
        {!isQuestionsLoading && (
          <Datatable
            fetcher={useFetchSurveysMembersQuery}
            columns={{
              columns: SurveyMembersCols,
              props: {
                survey_id: surveyId as string,
                sortables: ["percent_correct", "completed_at"],
                questions: questionsData?.data
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
        )}
      </Layout.Container>
    </Layout>
  );
}
