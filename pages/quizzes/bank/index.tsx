import { useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import QuizBankCols from "@/columns/quizzesBank";
import { CreateNewModal, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import { useDataExport, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useCreateQuizMutation, useFetchQuizzesQuery } from "@/store/slices/api/quizzesSlice";
import { APIActionResponse, Quiz } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const [show, setShow] = useState<boolean>(false);

  const { t } = useTranslation();
  const router = useRouter();

  const { displayErrors } = useResponseToastHandler({});

  const [exportQuizzesBank] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportQuizzesBank({
      endpoint: "/quizzes/export?type=csv&filters[type]=question_bank",
      name: "quizzes",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [createQuizMutation] = useCreateQuizMutation();

  const handleQuizCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const quiz = (await createQuizMutation({
      data: {
        type: "question_bank",
        title: title,
        randomised: false,
        passing_score: 0,
        duration: 0,
        show_results: true,
        allow_question_navigation: false,
        show_results_at_end: false
      }
    })) as APIActionResponse<Quiz>;

    if (!displayErrors(quiz)) {
      router.push(`/quizzes/bank/${quiz.data.data.id}`);
      setShow(false);
    }
  };

  return (
    <Layout title={t("quizzes.bank.title")}>
      <Layout.Container>
        <Datatable
          columns={{
            columns: QuizBankCols
          }}
          fetcher={useFetchQuizzesQuery}
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
                className="ltr:mr-4 rtl:ml-4"
                children={t("export")}
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => setShow(true)}
                children={t("quizzes.bank.new_quiz")}
                icon={
                  <Icon
                    size="sm"
                    children={<PlusIcon />}
                  />
                }
              />
            </>
          )}
          params={{
            filters: {
              type: "question_bank"
            }
          }}
        />

        <CreateNewModal
          title={t("quizzes.bank.new_bank")}
          type="bank"
          inputLabel={t("quizzes.bank.bank_title")}
          inputPlaceholder={t("quizzes.bank.insert_bank_title")}
          createAction={handleQuizCreation}
          submitButtonText={t("add_new")}
          open={show}
          onDismiss={() => {
            setShow(false);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
