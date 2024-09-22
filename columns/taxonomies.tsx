import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, useShareable } from "@/components";
import { useConfirmableDelete, useReplicateAction } from "@/hooks";
import { useDeleteTaxonomyMutation, useReplicateTaxonomyMutation } from "@/store/slices/api/taxonomiesSlice";
import { Taxonomy, TaxonomyType } from "@/types";
import { getStatusColor } from "@/utils";

import {
  ArrowUpLeftIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface TaxonomyColumnsProps {
  type: any;
  sortables: Array<string>;
  editHandler: (category: Taxonomy) => void;
  deleteTaxonomyHandler: (taxonomy: Taxonomy) => void;
  tenantUrl?: string;
}

const TaxonomiesCols = ({
  type,
  tenantUrl,
  sortables = [],
  deleteTaxonomyHandler,
  editHandler
}: TaxonomyColumnsProps) => {
  const isCategory = type.includes(
    TaxonomyType.COURSE_CATEGORY || TaxonomyType.PRODUCT_CATEGORY || TaxonomyType.POST_CATEGORY
  );

  const shouldBeCourseOrProductCategory = type.includes(TaxonomyType.COURSE_CATEGORY || TaxonomyType.PRODUCT_CATEGORY);

  const transNamespace = isCategory ? "categories" : "levels";
  const typeSingular = isCategory ? "category" : "level";

  const cells = [];

  cells.push({
    Header: <Trans i18nKey={`${transNamespace}.${typeSingular}_name`}>Name</Trans>,
    id: "name",
    width: 200,
    accessor: "name",
    disableSortBy: !sortables?.includes("name"),
    //@ts-ignore
    Cell: ({ row: { original } }: Taxonomy) => (
      <div className="flex w-full flex-col">
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.name}
        />
        {shouldBeCourseOrProductCategory && (
          <Badge
            children={<Trans i18nKey={original.type}>{original.type}</Trans>}
            variant={getStatusColor(original.type)}
            size="xs"
            rounded
            soft
            className="w-fit"
          />
        )}
      </div>
    )
  });

  if (isCategory) {
    cells.push({
      Header: <Trans i18nKey={`${transNamespace}.${typeSingular}_icon`}>Icon</Trans>,
      id: "icon",
      accessor: "icon",
      disableSortBy: true,
      //@ts-ignore
      Cell: ({ row: { original } }: Taxonomy) => (
        <div className="flex flex-row items-center">
          <Avatar
            name={original.name}
            imageUrl={original.icon?.url}
            className={`h-8 w-8`}
          />
        </div>
      )
    });
  }

  cells.push({
    Header: <Trans i18nKey={`${transNamespace}.${typeSingular}_url`}>Url</Trans>,
    id: "url",
    accessor: "url",
    disableSortBy: true,
    //@ts-ignore
    Cell: ({ row: { original } }: Taxonomy) => (
      <Link
        href={
          original.type == "course_difficulty"
            ? `https://${tenantUrl}/courses/difficulties/${original.slug}`
            : original.type == TaxonomyType.COURSE_CATEGORY
            ? `https://${tenantUrl}/courses/categories/${original.slug}`
            : original.type == TaxonomyType.PRODUCT_CATEGORY
            ? `https://${tenantUrl}/products/categories/${original.slug}`
            : `https://${tenantUrl}/blog/categories/${original.slug}`
        }
        target={"_blank"}
        className="flex items-center justify-between"
      >
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.slug}
          className={`text-blue-600`}
        />

        <Icon as="span">
          <ArrowUpLeftIcon className="mr-2 h-4 w-4 text-gray-950" />
        </Icon>
      </Link>
    )
  });

  if (isCategory) {
    cells.push({
      Header: <Trans i18nKey="categories.category_items_count">Items</Trans>,
      id: "items_count",
      accessor: "items_count",
      disableSortBy: true,
      //@ts-ignore
      Cell: ({ row: { original } }: Taxonomy) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          className={`text-left text-gray-950`}
          children={original.items_count}
        />
      )
    });
  }

  cells.push({
    Header: <Trans i18nKey="created_at">Created At</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: true,
    //@ts-ignore
    Cell: ({ row: { original } }: Taxonomy) => (
      <Time
        className={"text-gray-950"}
        date={original.created_at}
        format={"DD MMMM YYYY"}
      />
    )
  });

  cells.push({
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<Taxonomy>) => {
      const { t } = useTranslation();
      const share = useShareable();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteTaxonomyMutation
      });
      const [replicate] = useReplicateAction({
        mutation: useReplicateTaxonomyMutation
      });

      return (
        <div className="flex flex-row">
          <Button
            onClick={() => editHandler(original)}
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
                onClick={() => editHandler(original)}
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
                children={t(`${transNamespace}.${typeSingular}_share`)}
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
                      label: t(`${transNamespace}.${typeSingular}_url`),
                      url: `https://${tenantUrl}/${original.slug}`
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
                children={t(`${transNamespace}.delete_${typeSingular}`)}
                className="text-danger"
                iconAlign="end"
                onClick={() => {
                  // deleteTaxonomyHandler(original);
                  if (original.items_count > 0) {
                    deleteTaxonomyHandler(original);
                    return;
                  } else {
                    confirmableDelete({
                      id: original.id,
                      title: t("taxonomies.taxonomy_removal"),
                      label: t("taxonomies.confirm_taxonomy_deletion"),
                      children: t("taxonomies.delete_taxonomy_confirm_message", {
                        name: original.name
                      })
                    });
                    return;
                  }
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
  });

  return cells;
};

export default TaxonomiesCols;
