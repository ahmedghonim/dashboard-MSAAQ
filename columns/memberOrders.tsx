import React from "react";

import Link from "next/link";

import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { PaymentMethodLogo, Time } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Order } from "@/types";
import { getStatusColor } from "@/utils";

import { Badge, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
}

const MemberOrdersCols = ({ sortables = [] }: CourseColumnsProps) => [
  {
    Header: <Trans i18nKey="orders.id">id</Trans>,
    id: "id",
    accessor: "id",
    disableSortBy: !sortables?.includes("id"),
    width: 100,
    Cell: ({ row: { original } }: CellProps<Order>) => (
      <Typography.Paragraph
        as={Link}
        href={`/orders/${original.id}`}
        className="text-info"
        children={`#${original.id}`}
      />
    )
  },
  {
    Header: <Trans i18nKey="orders.status" />,
    id: "status",
    accessor: "status",
    disableSortBy: !sortables?.includes("status"),
    width: 120,
    Cell: ({ row: { original } }: CellProps<Order>) => (
      <Badge
        size="sm"
        variant={getStatusColor(original.status)}
        children={<Trans i18nKey={`orders.statuses.${original.status}`} />}
        rounded
        soft
      />
    )
  },
  {
    Header: <Trans i18nKey="orders.total" />,
    id: "total",
    accessor: "total",
    disableSortBy: !sortables?.includes("total"),
    Cell: ({ row: { original } }: CellProps<Order>) => {
      const { formatPrice } = useFormatPrice();
      return <Typography.Paragraph children={formatPrice(original.total)} />;
    }
  },
  {
    Header: <Trans i18nKey="orders.payment_method" />,
    id: "payment_method",
    accessor: "payment_method",
    disableSortBy: !sortables?.includes("payment_method"),
    Cell: ({ row: { original } }: CellProps<Order>) => <PaymentMethodLogo method={original.payment_method} />
  },
  {
    Header: <Trans i18nKey="orders.created_at" />,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({ row: { original } }: CellProps<Order>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={<Time date={original.created_at} />}
      />
    )
  }
];

export default MemberOrdersCols;
