import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { PaymentMethodLogo, Price, Time, UserAvatar } from "@/components";
import { Order, OrderStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { Badge, Button, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
  columns?: Array<string>;
}

const OrdersCols = ({ sortables = [], columns = [] }: CourseColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="orders.id">id</Trans>,
      id: "id",
      accessor: "id",
      disableSortBy: !sortables?.includes("id"),
      width: 100,
      Cell: ({ row: { original } }: CellProps<Order>) => (
        <Link
          href={`/orders/${original.id}`}
          children={original.id}
        />
      )
    },
    {
      Header: <Trans i18nKey="orders.order_owner" />,
      id: "member",
      accessor: "member",
      disableSortBy: !sortables?.includes("member"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Order>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="orders.total" />,
      id: "total",
      accessor: "total",
      disableSortBy: !sortables?.includes("total"),
      Cell: ({ row: { original } }: CellProps<Order>) => {
        return (
          <Typography.Paragraph
            children={
              <Price
                price={original.total}
                currency={original.currency}
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
      Header: <Trans i18nKey="orders.coupon_code" />,
      id: "coupon_code",
      accessor: "coupon_code",
      width: 150,
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Order>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.coupon_code ?? "-"}
        />
      )
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
    },
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Order>) => {
        const { t } = useTranslation();

        return (
          <Button
            as={Link}
            href={`/orders/${original.id}`}
            size="sm"
            variant={original.status === OrderStatus.PROCESSING ? "primary" : "default"}
            children={t(original.status === OrderStatus.PROCESSING ? "orders.confirm_order" : "orders.show_details")}
          />
        );
      }
    }
  ]
    .filter((col) => {
      if (columns.length) {
        return columns.includes(col.id);
      }

      return true;
    })
    .sort((a, b) => {
      return columns.indexOf(a.id) - columns.indexOf(b.id);
    });

export default OrdersCols;
