import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, useShareable } from "@/components";
import { useConfirmableDelete, useReplicateAction } from "@/hooks";
import { useDeleteArticleMutation, useReplicateArticleMutation } from "@/store/slices/api/articlesSlice";
import { User } from "@/types";
import { Article } from "@/types/models/article";
import { classNames, firstName, getStatusColor } from "@/utils";

import { DocumentDuplicateIcon, PencilSquareIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Dropdown, Icon, Title, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
}

const ArticlesCols = ({ sortables = [] }: CourseColumnsProps) => [
  {
    Header: <Trans i18nKey="articles.article_title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({ row: { original } }: CellProps<Article>) => (
      <Link
        href={`/blog/${original.id}/edit`}
        className="flex flex-col"
      >
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.title}
        />
        <div className="mt-4px flex flex-row">
          <Badge
            size="xs"
            variant={getStatusColor(original.status)}
            className="ml-2"
            soft
          >
            <Trans
              i18nKey={`statuses.${original.status}`}
              children={original.status}
            />
          </Badge>

          {original.taxonomies.length > 0 && (
            <Typography.Paragraph
              as="span"
              size="sm"
              weight="normal"
              className="text-gray-700"
              children={original.taxonomies?.map((taxonomy) => taxonomy.name).join(", ")}
            />
          )}
        </div>
      </Link>
    )
  },
  {
    Header: <Trans i18nKey="articles.author">Author</Trans>,
    id: "created_by",
    accessor: "created_by",
    disableSortBy: !sortables?.includes("created_by"),
    Cell: ({ row: { original } }: CellProps<Article>) => {
      const { t } = useTranslation();
      const users: User[] = [original.created_by].filter(Boolean);

      return (
        <React.Fragment>
          <div className="flex items-center ltr:mr-2 rtl:ml-2">
            {users.map((user, i) => (
              <Avatar
                key={i}
                imageUrl={user.avatar?.url}
                name={user.name}
                className={classNames("border-2 border-white", i != 0 ? "-mr-2" : "")}
              />
            ))}
          </div>
          <Typography.Paragraph
            title={users.map((user) => user.name).join(`${t("comma")} `)}
            as="div"
          >
            {users.length > 1
              ? t("x_and_count_others", {
                  name: firstName(users[0].name),
                  count: users.length - 1
                })
              : users.length == 1 && <Title title={users[0].name} />}
          </Typography.Paragraph>
        </React.Fragment>
      );
    }
  },
  {
    Header: <Trans i18nKey="articles.published_at">Published At</Trans>,
    id: "published_at",
    accessor: "published_at",
    disableSortBy: !sortables?.includes("published_at"),
    Cell: ({ row: { original } }: CellProps<Article>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={<Time date={original.published_at ?? original.created_at} />}
      />
    )
  },
  {
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<Article>) => {
      const { t } = useTranslation();
      const share = useShareable();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteArticleMutation
      });
      const [replicate] = useReplicateAction({
        mutation: useReplicateArticleMutation
      });

      return (
        <div className="flex flex-row">
          <Button
            as={Link}
            href={`/blog/${original.id}/edit`}
            variant="default"
            size="sm"
            className="ml-2"
            children={t("edit")}
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
                href={`/blog/${original.id}/edit`}
                children={t("edit")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<PencilSquareIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("share")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<ShareIcon />}
                  />
                }
                onClick={() => {
                  share([
                    {
                      label: t("articles.article_url"),
                      url: original.url
                    }
                  ]);
                }}
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("duplicate")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<DocumentDuplicateIcon />}
                  />
                }
                onClick={() => replicate(original.id)}
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("articles.delete_article")}
                className="text-danger"
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<TrashIcon />}
                  />
                }
                onClick={() => {
                  confirmableDelete({
                    id: original.id,
                    title: t("articles.delete_article"),
                    label: t("articles.delete_article_confirm"),
                    children: t("articles.delete_article_confirm_message")
                  });
                }}
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default ArticlesCols;
