import React, { useEffect } from "react";

import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";

import CommentsCols from "@/columns/comments";
import { Datatable, Layout } from "@/components";
import { useAppDispatch } from "@/hooks";
import { useFetchCommentsQuery } from "@/store/slices/api/commentsSlice";
import { useFetchReviewsQuery } from "@/store/slices/api/reviewsSlice";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import { Breadcrumbs, Button, Icon, Typography } from "@msaaqcom/abjad";

interface Props {
  commentsFetcher: typeof useFetchReviewsQuery | typeof useFetchCommentsQuery;
  product: any;
  sectionId: string;
  isReviews: boolean;
  filters: {
    [key: string]: any;
  };
}

const CommentsTable = ({ sectionId, isReviews, commentsFetcher, filters, product }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/${sectionId}/${product?.id}` });
    dispatch({ type: "app/setTitle", payload: product?.title });
  }, []);

  return (
    <Layout title={product?.title}>
      <Layout.Container>
        <Breadcrumbs className="mb-6">
          <Link href="/">
            <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
          </Link>
          <Link href={`/${sectionId}`}>
            <Typography.Paragraph as="span">{t(`${sectionId}.title`)}</Typography.Paragraph>
          </Link>
          <Link href={`/${sectionId}/${product?.id}`}>
            <Typography.Paragraph as="span">{product?.title}</Typography.Paragraph>
          </Link>
          <Typography.Paragraph
            className="text-gray-800"
            as="span"
          >
            {isReviews ? t("reviews") : t("comments.title")}
          </Typography.Paragraph>
        </Breadcrumbs>
        <Datatable
          fetcher={commentsFetcher}
          params={{
            filters: {
              ...filters,
              has_replies: 0
            }
          }}
          columns={{
            columns: CommentsCols,
            props: { isReviews }
          }}
          toolbar={() => (
            <>
              <Button
                variant="default"
                icon={
                  <Icon>
                    <ArrowDownTrayIcon />
                  </Icon>
                }
                children={t("export")}
              />
            </>
          )}
        />
      </Layout.Container>
    </Layout>
  );
};
export default CommentsTable;
