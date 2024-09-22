import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useConfirmableDelete } from "@/hooks";
import { useDeleteCommentMutation } from "@/store/slices/api/commentsSlice";
import { useDeleteReviewMutation } from "@/store/slices/api/reviewsSlice";
import { Comment, Product } from "@/types";

import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Avatar, Button, Dropdown, Icon, Title, Typography } from "@msaaqcom/abjad";

export interface EnrollmentColumnsProps {
  sortables: Array<string>;
  isReviews?: boolean;
}

const CommentsCols = ({ sortables = [], isReviews }: EnrollmentColumnsProps) => [
  {
    Header: <Trans i18nKey="the_student">student</Trans>,
    id: "member",
    accessor: "member",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { member }
      }
    }: any) => {
      return (
        <Title
          prepend={
            <Avatar
              imageUrl={member?.avatar}
              name={member.name}
            />
          }
          title={member.name}
          subtitle={member.email}
        />
      );
    }
  },
  ...(isReviews
    ? [
        {
          Header: <Trans i18nKey="title">Title</Trans>,
          id: "title",
          accessor: "title",
          disableSortBy: !sortables?.includes("title"),

          Cell: ({ row: { original } }: CellProps<Product>) => (
            <Typography.Paragraph
              as="span"
              size="md"
              weight="medium"
              className="truncate"
              children={original.title}
            />
          )
        }
      ]
    : []),
  {
    Header: <Trans i18nKey={isReviews ? "review_content" : "comment_content"}>review_content</Trans>,
    id: "content",
    accessor: "content",
    disableSortBy: true,
    Cell: ({ row: { original } }: CellProps<Comment>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        className="truncate"
        children={original.content}
      />
    )
  },
  ...(isReviews
    ? [
        {
          Header: <Trans i18nKey={isReviews ? "reviews" : "comment"}>reviews</Trans>,
          id: "rating",
          accessor: "rating",
          disableSortBy: !sortables?.includes("rating"),
          Cell: ({
            row: {
              original: { rating }
            }
          }: CellProps<Comment>) => {
            return (
              <Typography.Paragraph
                as="span"
                size="md"
                weight="medium"
              >
                {rating}
              </Typography.Paragraph>
            );
          }
        }
      ]
    : []),
  {
    Header: <Trans i18nKey="date_created">created date</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({ row: { original } }: CellProps<Comment>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={<Time date={original.created_at} />}
      />
    )
  },
  {
    id: "actions",
    className: "justify-end",

    Cell: ({ row: { original } }: CellProps<Comment>) => {
      const { t } = useTranslation();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: isReviews ? useDeleteReviewMutation : useDeleteCommentMutation
      });

      return (
        <div className="flex flex-row">
          <Button
            as={Link}
            href={original.path ?? "/"}
            variant="default"
            size="sm"
            className="ml-2"
            children={isReviews ? t("view_review") : t("replay_to_comment")}
          />

          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="default"
                size="sm"
                icon={
                  <Icon
                    size="md"
                    children={<EllipsisHorizontalIcon />}
                  />
                }
              />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item
                as={Link}
                href={original.path ?? "/"}
                children={isReviews ? t("view_review") : t("replay_to_comment")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<EyeIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={isReviews ? t("delete_review") : t("delete_comment")}
                className="text-danger"
                iconAlign="end"
                onClick={() => {
                  confirmableDelete({
                    id: original.id,
                    title: isReviews ? t("delete_review") : t("delete_comment"),
                    children: isReviews ? t("delete_review_confirm") : t("delete_comment_confirm")
                  });
                }}
                icon={
                  <Icon
                    size="sm"
                    children={<TrashIcon />}
                  />
                }
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default CommentsCols;
