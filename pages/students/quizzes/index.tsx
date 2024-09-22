import { useContext } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import QuizzesCols from "@/columns/quizzes";
import { AddonController, Datatable, EmptyStateTable, Layout } from "@/components";
import { AuthContext } from "@/contextes";
import { useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchQuizzesQuery } from "@/store/slices/api/quizzesSlice";

import { ArrowDownTrayIcon, ListBulletIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function QuizzesIndex({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const { hasPermission } = useContext(AuthContext);
  const [exportQuizzes] = useDataExport();

  const handleExport = async (tableInstance: any) => {
    exportQuizzes({
      endpoint: "/quizzes/export?filters[type]=quiz",
      name: "quizzes",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  return (
    <Layout title={t("students_flow.quizzes.title")}>
      <Layout.Container>
        <AddonController addon="quizzes">
          <Datatable
            fetcher={useFetchQuizzesQuery}
            hasSearch
            columns={{
              columns: QuizzesCols
            }}
            params={{
              only_with: ["course", "chapter"],
              sortables: ["passing_score"],
              filters: {
                type: "quiz"
              }
            }}
            emptyState={
              <EmptyStateTable
                title={t("students_flow.quizzes.empty_state.title")}
                content={t("students_flow.quizzes.empty_state.description")}
                icon={<ListBulletIcon />}
              />
            }
            toolbar={(instance) =>
              hasPermission("members.quizzes.export") && (
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
                />
              )
            }
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
