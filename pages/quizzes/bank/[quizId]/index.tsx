import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import QuestionsCols from "@/columns/questions";
import { EmptyState, Layout } from "@/components";
import EmptyDataIcon from "@/components/Icons/EmptyDataIcon";
import { Datatable } from "@/components/datatable";
import { useAppDispatch, useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchQuestionsQuery } from "@/store/slices/api/questionsSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { quizId } = router.query;
  const { data: quiz } = useFetchQuizQuery(quizId as string);
  const [exportQuestions] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportQuestions({
      endpoint: `/quizzes/${quizId}/questions/export`,
      name: "questions",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  dispatch({ type: "app/setTitle", payload: quiz?.title ?? "" });

  return (
    <Layout title={quiz?.title}>
      <Layout.Container>
        <Datatable
          columns={{
            columns: QuestionsCols,
            props: {
              quizId
            }
          }}
          fetcher={useFetchQuestionsQuery}
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
                children={t("export")}
                className="ltr:mr-4 rtl:ml-4"
              />
              <Button
                as={Link}
                variant="primary"
                size="md"
                href={`/quizzes/bank/${quizId}/questions`}
                children={t("quizzes.questions.edit_question")}
                icon={
                  <Icon
                    size="sm"
                    children={<PencilSquareIcon />}
                  />
                }
              />
            </>
          )}
          params={{
            quizId,
            filters: {
              type: "question_bank"
            }
          }}
          emptyState={
            <EmptyState
              title={t("quizzes.bank.question_table_empty_state_title")}
              className="min-h-[theme(spacing.64)]"
              icon={<EmptyDataIcon />}
              children={
                <>
                  {t("quizzes.bank.question_table_empty_state_description")}
                  <Button
                    as={Link}
                    children={t("quizzes.bank.add_question")}
                    href={`/quizzes/bank/${quizId}/questions/create`}
                  />
                </>
              }
            />
          }
        />
      </Layout.Container>
    </Layout>
  );
}
