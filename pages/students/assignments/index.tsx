import React, { useContext, useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import AssignmentMembersCols from "@/columns/assignmentMembers";
import { AddonController, EmptyState, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import { AuthContext } from "@/contextes";
import { useAppDispatch, useDataExport } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchAssignmentMembersQuery } from "@/store/slices/api/assignmentsMemberSlice";

import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const { hasPermission } = useContext(AuthContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/students" });
  }, []);

  const [exportAssignmentMembers] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportAssignmentMembers({
      endpoint: "/assignment-members/export",
      name: "assignments",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  return (
    <Layout title={t("assignments.title")}>
      <Layout.Container>
        <AddonController addon="assessments">
          <Datatable
            columns={{
              columns: AssignmentMembersCols
            }}
            fetcher={useFetchAssignmentMembersQuery}
            hasSearch
            toolbar={(instance) =>
              hasPermission("members.assignments.export") && (
                <Button
                  icon={
                    <Icon
                      size="sm"
                      children={<ArrowDownTrayIcon />}
                    />
                  }
                  variant="default"
                  size="md"
                  children={t("export")}
                  onClick={() => handleExport(instance)}
                />
              )
            }
            emptyState={
              <EmptyState
                title={t("assignments.empty_state.title")}
                content={t("assignments.empty_state.content")}
                icon={<Icon children={<DocumentTextIcon />} />}
              >
                <Button
                  as={Link}
                  href="/courses"
                  icon={
                    <Icon
                      size="sm"
                      children={<PlusIcon />}
                    />
                  }
                  children={t("courses.new_course")}
                />
              </EmptyState>
            }
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
