import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Payout } from "@/types";
import { getStatusColor, middleTruncate } from "@/utils";

import { Badge, Button, Title, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
  columns: Array<string>;
}

const PayoutsCols = ({ sortables = [], columns = [] }: CourseColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="msaaq_pay.payouts.id">id</Trans>,
      id: "id",
      accessor: "id",
      disableSortBy: !sortables?.includes("id"),
      width: 100,
      Cell: ({ row: { original } }: CellProps<Payout>) => (
        <Link
          href={`/msaaq-pay/payouts/${original.id}`}
          children={original.id}
        />
      )
    },
    {
      Header: <Trans i18nKey="msaaq_pay.payouts.amount" />,
      id: "amount",
      accessor: "amount",
      disableSortBy: !sortables?.includes("amount"),
      Cell: ({ row: { original } }: CellProps<Payout>) => {
        const { formatPrice } = useFormatPrice(original.currency);
        return <Typography.Paragraph children={formatPrice(original.amount)} />;
      }
    },
    {
      Header: <Trans i18nKey="msaaq_pay.payouts.bank_account" />,
      id: "bank",
      accessor: "bank",
      disableSortBy: !sortables?.includes("bank"),
      Cell: ({ row: { original } }: CellProps<Payout>) => (
        <Title
          title={original.bank ? middleTruncate(original.bank.account_number, 2, 4, "****") : "-"}
          subtitle={original.bank ? original.bank.bank_name : ""}
        />
      )
    },
    {
      Header: <Trans i18nKey="msaaq_pay.payouts.status" />,
      id: "status",
      accessor: "status",
      disableSortBy: !sortables?.includes("status"),
      Cell: ({ row: { original } }: CellProps<Payout>) => (
        <Badge
          size="sm"
          variant={getStatusColor(original.status ?? original.description)}
          rounded
          soft
          children={<Trans i18nKey={`msaaq_pay.payouts.statuses.${original.status}`} />}
        />
      )
    },
    {
      Header: <Trans i18nKey="msaaq_pay.payouts.created_at" />,
      id: "created_at",
      accessor: "created_at",
      disableSortBy: !sortables?.includes("created_at"),
      Cell: ({ row: { original } }: CellProps<Payout>) => (
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
      Cell: ({ row: { original } }: CellProps<Payout>) => {
        const { t } = useTranslation();

        return (
          <Button
            as={Link}
            href={`/msaaq-pay/payouts/${original.id}`}
            size="sm"
            variant={"default"}
            children={t("msaaq_pay.payouts.show_details")}
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

export default PayoutsCols;
