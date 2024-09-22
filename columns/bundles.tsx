import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { useShareable } from "@/components";
import { useConfirmableDelete, useFormatPrice, useReplicateAction } from "@/hooks";
import { useDeleteProductMutation, useReplicateProductMutation } from "@/store/slices/api/productsSlice";
import { Product } from "@/types";
import { getStatusColor } from "@/utils";

import { DocumentDuplicateIcon, EyeIcon, PencilSquareIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface ProductColumnsProps {
  sortables: Array<string>;
}

const BundlesCols = ({ sortables = [] }: ProductColumnsProps) => [
  {
    Header: <Trans i18nKey="bundles.bundle_title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({ row: { original } }: CellProps<Product>) => (
      <Link
        href={`/bundles/${original.id}/edit`}
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
        </div>
      </Link>
    )
  },
  {
    Header: <Trans i18nKey="price">Price</Trans>,
    id: "price",
    accessor: "price",
    disableSortBy: !sortables?.includes("price"),
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
    Header: <Trans i18nKey="bundles.products_count">Downloads Count</Trans>,
    id: "bundle_items_count",
    accessor: "bundle_items_count",
    disableSortBy: !sortables?.includes("bundle_items_count"),
    Cell: ({
      row: {
        original: { bundle_items_count }
      }
    }: CellProps<Product>) => (
      <Typography.Paragraph
        as="span"
        size="md"
        weight="medium"
        children={bundle_items_count}
      />
    )
  },
  {
    Header: <Trans i18nKey="bundles.number_of_buyers">Profits</Trans>,
    id: "downloads_count",
    accessor: "downloads_count",
    disableSortBy: !sortables?.includes("number_of_buyers"),
    Cell: ({
      row: {
        original: { downloads_count }
      }
    }: any) => (
      <Typography.Paragraph
        as="span"
        size="md"
        weight="medium"
        children={downloads_count ?? 0}
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
            href={`/bundles/${original.id}/edit`}
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
                href={`/bundles/${original.id}/edit`}
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
                children={t("bundles.share_bundle")}
                onClick={() => {
                  share([
                    {
                      label: t("bundles.bundle_landing_page_url"),
                      url: original.url
                    },
                    {
                      label: t("bundles.bundle_direct_checkout_url"),
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
                children={t("bundles.delete_bundle")}
                className="text-danger"
                iconAlign="end"
                onClick={() => {
                  confirmableDelete({
                    id: original.id,
                    title: t("bundles.delete_bundle_confirm_modal_title"),
                    label: t("bundles.delete_bundle_confirm"),
                    children: t("bundles.delete_bundle_confirm_modal_description", { title: original.title })
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

export default BundlesCols;
