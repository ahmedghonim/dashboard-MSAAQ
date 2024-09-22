import React, { ChangeEvent, useEffect, useState } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadArticleTaxonomies, loadUsers } from "@/actions/options";
import { AddonController, Layout, SuccessModal, useShareable } from "@/components";
import { Select } from "@/components/select";
import ArticlesTabs from "@/components/shared/blog/ArticlesTabs";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchArticleQuery, useUpdateArticleMutation } from "@/store/slices/api/articlesSlice";
import { APIActionResponse, Taxonomy } from "@/types";
import { Article, ArticleStatus } from "@/types/models/article";
import { slugify } from "@/utils";

import { Form, SingleFile } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  slug: string;
  published_at: string;
  status: Article["status"];
  taxonomies: Array<{
    label: string;
    value: any;
  }>;
  thumbnail?: SingleFile[];
  meta_title: string;
  meta_description: string;
  meta_keywords: Array<{
    label: string;
    value: string;
  }>;
  created_by: {
    label: string;
    value: any;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const share = useShareable();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    slug: yup.string().required(),
    status: yup.string().required(),
    published_at: yup.mixed().when("status", {
      is: "scheduled",
      then: yup.string().required(),
      otherwise: yup.mixed().notRequired()
    }),
    created_by: yup.object().required(),
    thumbnail: yup.array().min(1).max(1).required(),
    meta_title: yup.string(),
    meta_description: yup.string(),
    meta_keywords: yup.array(),
    taxonomies: yup.mixed()
  });

  const {
    query: { articleId }
  } = router;

  const { data: article = {} as Article, refetch } = useFetchArticleQuery(articleId as string);

  const [updateMutation] = useUpdateArticleMutation();

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/blog" });
  }, []);

  useEffect(() => {
    if (isEmpty(article)) {
      return;
    }

    reset({
      title: article?.title,
      slug: article?.slug ?? "",
      status: article?.status,
      published_at: article?.status == ArticleStatus.SCHEDULED ? article?.published_at : undefined,
      created_by: article.created_by
        ? {
            label: article?.created_by?.name,
            value: article?.created_by?.id
          }
        : {},
      taxonomies: article?.taxonomies.map((taxonomy: Taxonomy) => ({
        label: taxonomy.name,
        value: taxonomy.id
      })),
      // @ts-ignore
      thumbnail: isObject(article?.thumbnail) ? [article?.thumbnail] : [],
      meta_title: article?.meta_title ?? "",
      meta_description: article?.meta_description ?? "",
      meta_keywords: article?.meta_keywords?.map((keyword: string) => ({
        label: keyword,
        value: keyword
      }))
    });
  }, [article]);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: watch("title") ?? article?.title });
  }, [watch("title")]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const payload: any = {
      id: article.id,
      title: data.title,
      slug: data.slug,
      status: data.status,
      created_by: data.created_by.value,
      taxonomy_id: data.taxonomies?.length ? data.taxonomies[0].value : [],
      thumbnail: data.thumbnail?.map((file) => file.file).pop(),
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords?.map((keyword) => keyword.value),
      published_at: data?.status == ArticleStatus.SCHEDULED ? data?.published_at : undefined
    };

    const response = (await updateMutation(payload)) as APIActionResponse<Article>;

    if (displayErrors(response)) {
      return;
    }

    if (response.data.data.status === ArticleStatus.PUBLISHED) {
      setShowSuccessModal(true);
    } else {
      displaySuccess(response);
    }

    await refetch();
  };

  return (
    <Layout title={article?.title}>
      <ArticlesTabs />

      <Layout.Container>
        <AddonController addon="articles">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <Layout.FormGrid
              sidebar={
                <Layout.FormGrid.Actions
                  statuses={["draft", "published", "scheduled"]}
                  form={form}
                  product={article}
                  redirect={`/blog/${articleId}/edit`}
                  name="published_at"
                />
              }
            >
              <Form.Section
                title={t("articles.settings.general.title")}
                description={t("articles.settings.general.description")}
                className="mb-6"
                hasDivider
              >
                <Form.Group
                  required
                  label={t("articles.article_title")}
                  errors={errors.title?.message}
                >
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("articles.article_title_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  required
                  label={t("articles.slug_input_label")}
                  errors={errors.slug?.message}
                >
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <Form.Input
                        dir="ltr"
                        append={
                          <div
                            className="bg-gray px-4 py-3"
                            dir="ltr"
                            children="/blog/"
                          />
                        }
                        placeholder="how-to-create-a-course"
                        value={slugify(value)}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(slugify(event.target.value))}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("articles.thumbnail_label")}
                  required
                  errors={errors.thumbnail?.message}
                >
                  <Controller
                    name="thumbnail"
                    control={control}
                    render={({ field }) => (
                      <Form.File
                        accept={["image/*"]}
                        maxSize={2}
                        {...field}
                        append={
                          <>
                            <span
                              className="text-xs text-gray-700"
                              dir="ltr"
                            >
                              {t("preferred_ratio", { ratio: "1324*744 PX" })}
                            </span>
                          </>
                        }
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("articles.author")}
                  errors={errors.created_by?.message}
                  required
                >
                  <Controller
                    name="created_by"
                    control={control}
                    render={({ field }) => (
                      <Select
                        defaultOptions
                        placeholder={t("select_from_list")}
                        loadOptions={loadUsers}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("category")}
                  tooltip={t("articles.category_select_tooltip")}
                  className="mb-0"
                >
                  <Controller
                    name="taxonomies"
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <Select
                        defaultOptions
                        isCreatable={true}
                        placeholder={t("articles.category_select_placeholder")}
                        loadOptions={loadArticleTaxonomies}
                        onChange={(value) => {
                          onChange(isArray(value) ? value : [value]);
                        }}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </Form.Section>

              <Form.Section
                title={t("articles.settings.seo.title")}
                description={t("articles.settings.seo.description")}
                className="mb-6"
              >
                <Form.Group
                  label={t("meta_title")}
                  tooltip={t("meta_title_input_tooltip")}
                >
                  <Controller
                    name="meta_title"
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("meta_title_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("meta_description")}
                  tooltip={t("meta_description_input_tooltip")}
                >
                  <Controller
                    name="meta_description"
                    control={control}
                    render={({ field }) => (
                      <Form.Textarea
                        rows={5}
                        placeholder={t("articles.meta_description_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group
                  label={t("meta_keywords")}
                  tooltip={t("meta_keywords_input_tooltip")}
                  className="mb-0"
                >
                  <Controller
                    name="meta_keywords"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isMulti
                        isCreatable={true}
                        hasDropdownIndicator={false}
                        placeholder={t("meta_keywords_input_placeholder")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </Form.Section>
            </Layout.FormGrid>
          </Form>
        </AddonController>
      </Layout.Container>

      <SuccessModal
        open={showSuccessModal}
        onDismiss={() => setShowSuccessModal(false)}
        title={t("articles.publishing.success_modal_title")}
        description={t("articles.publishing.success_modal_description")}
        actionLink={article?.url ?? ""}
        actionLinkLabel={t("articles.show_article")}
        shareButtonLabel={t("share")}
        shareButtonOnClick={() => {
          setShowSuccessModal(false);
          share([
            {
              label: t("products.product_landing_page_url"),
              url: article.url
            }
          ]);
        }}
      />
    </Layout>
  );
}
