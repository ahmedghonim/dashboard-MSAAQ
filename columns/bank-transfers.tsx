import React from "react";

import Link from "next/link";

import isEmpty from "lodash/isEmpty";
import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Price, Time, UserAvatar } from "@/components";
import { BankTransfer, BankTransferStatus } from "@/types/models/bank-transfer";
import { getStatusColor } from "@/utils";

import { Badge, Button, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
}

const bankTransfersCols = ({ sortables = [] }: CourseColumnsProps) => [
  {
    Header: <Trans i18nKey="orders.id">id</Trans>,
    id: "id",
    accessor: "id",
    disableSortBy: !sortables?.includes("id"),
    width: 100
  },
  {
    Header: <Trans i18nKey="orders.order_owner" />,
    id: "member",
    accessor: "member",
    disableSortBy: !sortables?.includes("member"),
    width: 250,
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => {
      return !isEmpty(original.member) && <UserAvatar user={original.member} />;
    }
  },
  {
    Header: <Trans i18nKey="orders.total" />,
    id: "total",
    accessor: "total",
    disableSortBy: !sortables?.includes("total"),
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => {
      const order = original.order ?? original.cart ?? {};
      return (
        <Typography.Paragraph
          children={
            <Price
              price={order.total}
              currency={order.currency}
            />
          }
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="orders.status" />,
    id: "status",
    accessor: "status",
    disableSortBy: !sortables?.includes("status"),
    width: 120,
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => (
      <Badge
        size="sm"
        variant={getStatusColor(original.status)}
        children={<Trans i18nKey={`bank_transfers.statuses.${original.status}`} />}
        rounded
        soft
      />
    )
  },
  {
    Header: <Trans i18nKey="orders.products_count" />,
    id: "items_count",
    accessor: "items_count",
    width: 120,
    disableSortBy: !sortables?.includes("items_count"),
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => {
      const order = original.order ?? original.cart ?? {};
      return order.items_count;
    }
  },
  {
    Header: <Trans i18nKey="orders.created_at" />,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => (
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
    Cell: ({ row: { original } }: CellProps<BankTransfer>) => {
      const { t } = useTranslation();

      return (
        <Button
          as={Link}
          href={`/orders/bank-transfers/${original.id}`}
          size="sm"
          variant={original.status === BankTransferStatus.PENDING ? "primary" : "default"}
          children={t(original.status === BankTransferStatus.PENDING ? "orders.confirm_order" : "orders.show_details")}
        />
      );
    }
  }
];

export default bankTransfersCols;
