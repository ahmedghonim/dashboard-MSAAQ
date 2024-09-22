import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { useShareable } from "@/components";
import { useConfirmableDelete, useFormatPrice, useReplicateAction } from "@/hooks";
import { useDeleteProductMutation, useReplicateProductMutation } from "@/store/slices/api/productsSlice";
import { Product } from "@/types";
import { getStatusColor } from "@/utils";

import {
  DocumentDuplicateIcon,
  EyeIcon,
  PencilSquareIcon,
  ShareIcon,
  StarIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface ProductColumnsProps {
  sortables: Array<string>;
}

const CoachingSessionsCols = ({ sortables = [] }: ProductColumnsProps) => [
  {
    Header: <Trans i18nKey="title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: !sortables?.includes("title"),
    //@ts-ignore
    Cell: ({ row: { original } }: Product) => (
      <Link
        href={`/coaching-sessions/${original.id}`}
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
            rounded
          >
            <Trans
              i18nKey={`statuses.${original.status}`}
              children={original.status}
            />
          </Badge>
          <Typography.Paragraph
            as="span"
            size="sm"
            weight="normal"
            className="text-gray-700"
            children={original.category?.name}
          />
        </div>
      </Link>
    )
  },
  {
    Header: <Trans i18nKey="price">Price</Trans>,
    id: "price",
    accessor: "price",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({
      row: {
        original: { price }
      }
    }: any) => {
      const { formatPrice } = useFormatPrice();
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={formatPrice(price)}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="earnings">Earnings</Trans>,
    id: "earnings",
    accessor: "earnings",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({
      row: {
        original: { earnings }
      }
    }: any) => {
      const { formatPrice } = useFormatPrice();
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={formatPrice(earnings)}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="coaching_sessions.bookings_count">Downloads Count</Trans>,
    id: "downloads_count",
    accessor: "downloads_count",
    disableSortBy: !sortables?.includes("downloads_count"),
    Cell: ({
      row: {
        original: { downloads_count }
      }
    }: any) => (
      <Typography.Paragraph
        as="span"
        size="md"
        weight="medium"
        children={downloads_count}
      />
    )
  },
  {
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<Product>) => {
      const { t } = useTranslation();
      const share = useShareable();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteProductMutation
      });
      const [replicate] = useReplicateAction({
        mutation: useReplicateProductMutation
      });

      return (
        <div className="flex flex-row">
          <Button
            as={Link}
            href={`/coaching-sessions/${original.id}/edit`}
            variant="default"
            size="sm"
            className="ml-2"
            children={<Trans i18nKey="edit">Edit</Trans>}
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
                href={`/coaching-sessions/${original.id}/edit`}
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
                children={t("coaching_sessions.share_session")}
                onClick={() => {
                  share([
                    {
                      label: t("coaching_sessions.session_landing_page_url"),
                      url: original.url
                    },
                    {
                      label: t("coaching_sessions.session_direct_checkout_url"),
                      url: original.checkout_url
                    }
                  ]);
                }}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<ShareIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("preview_as_student")}
                as="a"
                href={original.url}
                target="_blank"
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
                children={t("duplicate")}
                onClick={() => {
                  replicate(original.id);
                }}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<DocumentDuplicateIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                as={Link}
                href={`/coaching-sessions/${original.id}#reviews`}
                children={t("show_reviews")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<StarIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("coaching_sessions.delete_session")}
                className="text-danger"
                iconAlign="end"
                onClick={() => {
                  confirmableDelete({
                    id: original.id,
                    title: t("coaching_sessions.delete_session"),
                    label: t("coaching_sessions.delete_session_confirm"),
                    children: t("coaching_sessions.delete_session_confirm_message", { title: original.title })
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

export default CoachingSessionsCols;
