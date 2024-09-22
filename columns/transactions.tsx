import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { PaymentMethodLogo, Time, UserAvatar } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Transaction, TransactionStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Icon, Title, Tooltip, Typography } from "@msaaqcom/abjad";

export const TransactionAvatar = ({ transaction, className }: { transaction: Transaction; className?: string }) => {
  return transaction.payer ? (
    <UserAvatar
      user={transaction.payer}
      className={className}
    />
  ) : !transaction.payer && !transaction.status ? (
    <Title
      title={<Trans i18nKey="msaaq_pay.title" />}
      className={className}
      prepend={
        <div className="pointer-events-none flex h-[32px] w-[32px] rounded-full border-2 border-secondary bg-white p-1">
          <img
            src="https://cdn.msaaq.com/assets/images/logo/pay/short-logo.png"
            className="m-auto"
            alt=""
          />
        </div>
      }
    />
  ) : (
    <>-</>
  );
};

interface CourseColumnsProps {
  sortables: Array<string>;
  columns: Array<string>;
}

const TransactionsCols = ({ sortables = [], columns = [] }: CourseColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.id">id</Trans>,
      id: "id",
      accessor: "id",
      disableSortBy: !sortables?.includes("id"),
      width: 90,
      Cell: ({ row: { original } }: CellProps<Transaction>) =>
        original.description == "transfer" ? (
          <span children={original.id} />
        ) : (
          <Link
            href={`/msaaq-pay/transactions/${original.id}`}
            children={original.id}
          />
        )
    },
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.payer" />,
      id: "payer",
      accessor: "payer",
      disableSortBy: !sortables?.includes("payer"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Transaction>) => <TransactionAvatar transaction={original} />
    },
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.amount" />,
      id: "amount",
      accessor: "amount",
      disableSortBy: !sortables?.includes("amount"),
      Cell: ({ row: { original } }: CellProps<Transaction>) => {
        const { formatPrice } = useFormatPrice(original.currency);
        return <Typography.Paragraph children={formatPrice(original?.payment_details?.amount ?? original?.amount)} />;
      }
    },
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.status" />,
      id: "status",
      accessor: "status",
      width: 100,
      disableSortBy: !sortables?.includes("status"),
      Cell: ({ row: { original } }: CellProps<Transaction>) => {
        const { formatPrice } = useFormatPrice(original.currency);
        const { t } = useTranslation();
        return [TransactionStatus.FULLY_REFUNDED, TransactionStatus.PARTIALLY_REFUNDED].includes(original.status) ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Badge
                size="sm"
                variant={getStatusColor(original.status)}
                rounded
                soft
              >
                <span className="flex items-center gap-2">
                  {t(`msaaq_pay.transactions.statuses.${original.status}`)}
                  <Icon
                    children={<ExclamationCircleIcon />}
                    size="sm"
                    className={`text-${getStatusColor(original.status)}-600`}
                  />
                </span>
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {t("msaaq_pay.transactions.refunded_amount", {
                amount: formatPrice(original.refunds_amount)
              })}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <Badge
            size="sm"
            variant={getStatusColor(original.status ?? original.description)}
            rounded
            soft
            children={
              <Trans
                i18nKey={
                  original.status
                    ? `msaaq_pay.transactions.statuses.${original.status}`
                    : `msaaq_pay.transactions.descriptions.${original.description}`
                }
              />
            }
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.payment_method" />,
      id: "payment_method",
      accessor: "payment_method",
      width: 120,
      disableSortBy: !sortables?.includes("payment_method"),
      Cell: ({ row: { original } }: CellProps<Transaction>) => (
        <PaymentMethodLogo
          method={original.payment_method ? original.payment_method : original.payment_gateway ?? "wallet"}
          last4={original.card?.last4}
        />
      )
    },
    {
      Header: <Trans i18nKey="msaaq_pay.transactions.created_at" />,
      id: "created_at",
      accessor: "created_at",
      width: 200,
      disableSortBy: !sortables?.includes("created_at"),
      Cell: ({ row: { original } }: CellProps<Transaction>) => (
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
      Cell: ({ row: { original } }: CellProps<Transaction>) =>
        original.description !== "transfer" ? (
          <Button
            as={Link}
            href={`/msaaq-pay/transactions/${original.id}`}
            size="sm"
            variant={"default"}
            children={<Trans i18nKey={"msaaq_pay.transactions.show_details"} />}
          />
        ) : null
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

export default TransactionsCols;
