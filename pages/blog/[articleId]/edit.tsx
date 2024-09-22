import React, { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout } from "@/components";
import ArticlesTabs from "@/components/shared/blog/ArticlesTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchArticleQuery, useUpdateArticleMutation } from "@/store/slices/api/articlesSlice";
import { APIActionResponse } from "@/types";
import { Article } from "@/types/models/article";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Editor, FULL_TOOLBAR_BUTTONS, Form, Icon, Typography, useAbjad } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  content: string;
}

export default function Edit() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const abjad = useAbjad();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  useEffect(() => {
    if (showAlert) {
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [showAlert]);

  const schema = yup.object().shape({
    content: yup.string().min(3).required()
  });

  const {
    query: { articleId }
  } = router;

  const { data: article = {} as Article, isLoading } = useFetchArticleQuery(articleId as string);

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    control,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = form;

  const { displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    reset({
      content: article?.content ?? ""
    });

    dispatch({ type: "app/setTitle", payload: article?.title ?? "" });

    abjad.setEditorPlugin(
      "plugins.image.uploadURL",
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/articles/${article?.id}/media`
    );
  }, [article]);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/blog" });
  }, []);

  const [updateMutation, { isLoading: isUpdating }] = useUpdateArticleMutation();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isUpdating || article?.content == data.content) {
      return;
    }

    const response = (await updateMutation({
      id: articleId as any,
      content: data.content
    })) as APIActionResponse<Article>;

    if (displayErrors(response)) {
      return;
    }

    reset({
      content: response.data.data.content ?? ""
    });

    setShowAlert(true);
  };

  return (
    <Layout title={article?.title}>
      <ArticlesTabs />

      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <Typography.Paragraph
              weight="medium"
              size="lg"
              children={t("articles.content")}
            />

            <Layout.FormGrid.Actions
              className="flex flex-row-reverse items-center justify-start gap-4"
              size="sm"
              product={article}
              form={form}
              redirect={router.asPath}
            />
          </div>

          <Form.Group errors={errors.content?.message}>
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange } }) => (
                <Editor
                  stickyToolbar
                  placeholder={t("articles.content_placeholder")}
                  defaultValue={article?.content}
                  toolbar={FULL_TOOLBAR_BUTTONS}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
              )}
            />
          </Form.Group>
        </Form>
      </Layout.Container>

      <div
        className="pointer-events-none flex w-48 flex-row items-center rounded-full bg-gray-900 px-4 py-2 text-white transition-all duration-300"
        style={{
          position: "fixed",
          opacity: showAlert ? 1 : 0,
          bottom: showAlert ? "50px" : "-50px",
          left: "calc(50% - 105px)",
          transform: "translate(-50%, -50%)"
        }}
      >
        <Icon className="ltr:mr-2 rtl:ml-2">
          <CheckCircleIcon />
        </Icon>
        <Typography.Paragraph
          size="lg"
          weight="medium"
          children={t("all_changes_ware_saved")}
        />
      </div>
    </Layout>
  );
}
