import { useContext } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SurveysCols from "@/columns/surveys";
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

export default function SurveysIndex({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  const { hasPermission } = useContext(AuthContext);
  const [exportSurveys] = useDataExport();

  const handleExport = async (tableInstance: any) => {
    exportSurveys({
      endpoint: "/surveys/export",
      name: "surveys",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  return (
    <Layout>
      <Head>
        <title>{t("students_flow.surveys.title")}</title>
      </Head>

      <Layout.Container>
        <AddonController addon="surveys">
          <Datatable
            fetcher={useFetchQuizzesQuery}
            columns={{
              columns: SurveysCols
            }}
            params={{
              only_with: ["course", "chapter"],
              sortables: ["passing_score"],
              survey: true,
              filters: {
                type: "survey"
              }
            }}
            emptyState={
              <EmptyStateTable
                title={t("students_flow.surveys.empty_state.title")}
                content={t("students_flow.surveys.empty_state.description")}
                icon={<ListBulletIcon />}
              />
            }
            toolbar={(instance) =>
              hasPermission("members.surveys.export") && (
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
