import React, { useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ArticlesCols from "@/columns/articles";
import { AddonController, CreateNewModal, EmptyStateTable, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import ArticlesIndexTabs from "@/components/shared/blog/ArticlesIndexTabs";
import { useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useCreateArticleMutation, useFetchArticlesQuery } from "@/store/slices/api/articlesSlice";
import { APIActionResponse, Course } from "@/types";

import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const [show, setShow] = useState<boolean>(false);
  const { t } = useTranslation();
  const router = useRouter();

  const { displayErrors } = useResponseToastHandler({});

  const [createMutation] = useCreateArticleMutation();

  const handleCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const response = (await createMutation({
      title
    })) as APIActionResponse<Course>;

    if (!displayErrors(response)) {
      setShow(false);

      await router.push(`/blog/${response?.data.data.id}/edit`);
    }
  };

  const AddButton = () => (
    <Button
      variant="primary"
      size="md"
      onClick={() => setShow(true)}
      icon={
        <Icon
          size="sm"
          children={<PlusIcon />}
        />
      }
    >
      <Typography.Paragraph
        size="md"
        weight="medium"
        children={t("articles.add_new_article")}
      />
    </Button>
  );

  return (
    <Layout title={t("articles.title")}>
      <ArticlesIndexTabs />

      <Layout.Container>
        <AddonController addon="articles">
          <Datatable
            columns={{
              columns: ArticlesCols
            }}
            fetcher={useFetchArticlesQuery}
            toolbar={() => <AddButton />}
            emptyState={
              <EmptyStateTable
                title={t("articles.empty_state.title")}
                content={t("articles.empty_state.description")}
                icon={<PencilIcon />}
                children={<AddButton />}
              />
            }
          />

          <CreateNewModal
            title={t("articles.add_new_article")}
            type="article"
            inputLabel={t("articles.article_title")}
            inputPlaceholder={t("articles.article_title_placeholder")}
            createAction={handleCreation}
            submitButtonText={t("add_new")}
            open={show}
            onDismiss={() => setShow(false)}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
