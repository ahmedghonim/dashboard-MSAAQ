import React, { useContext } from "react";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Price, Time } from "@/components";
import { AppContext } from "@/contextes";
import { StripeContext } from "@/contextes/StripeContext";
import { Receipt } from "@/types";
import { getStatusColor } from "@/utils";

import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface Props {
  sortables: Array<string>;
}

const ReceiptsCols = ({ sortables = [] }: Props) => [
  {
    Header: <Trans i18nKey="billing.invoices.amount" />,
    id: "amount",
    accessor: "amount",
    disableSortBy: !sortables?.includes("amount"),
    Cell: ({ row: { original } }: CellProps<Receipt>) => (
      <Price
        price={original.total}
        currency={original.currency}
      />
    )
  },
  // {
  //   Header: <Trans i18nKey="billing.invoices.vat" />,
  //   id: "tax",
  //   accessor: "tax",
  //   disableSortBy: !sortables?.includes("tax"),
  //   Cell: ({ row: { original } }: CellProps<Receipt>) => (
  //     <Price
  //       price={original.tax}
  //       currency={original.currency}
  //     />
  //   )
  // },
  {
    Header: <Trans i18nKey="billing.invoices.status" />,
    id: "status",
    accessor: "status",
    disableSortBy: !sortables?.includes("status"),
    width: 120,
    Cell: ({ row: { original } }: CellProps<Receipt>) => (
      <Badge
        size="sm"
        variant={getStatusColor(original.status)}
        children={<Trans i18nKey={`billing.invoices.statuses.${original.status}`} />}
        rounded
        soft
      />
    )
  },
  {
    Header: <Trans i18nKey="billing.invoices.paid_at" />,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({ row: { original } }: CellProps<Receipt>) => (
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
    Cell: ({ row: { original } }: CellProps<Receipt>) => {
      const { t } = useTranslation();
      const { isLoading } = useContext(AppContext);
      const { handleIncompletePayment } = useContext(StripeContext);

      return (
        <div className="flex flex-row gap-4">
          {original.status !== "paid" && original.payment_intent && (
            <Button
              variant="primary"
              size="sm"
              children={"دفع الفاتورة"}
              disabled={isLoading}
              onClick={() => handleIncompletePayment(original)}
            />
          )}

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
                as={"a"}
                target={"_blank"}
                href={original.receipt_url}
                children={t("billing.invoices.download_receipt")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<DocumentArrowDownIcon />}
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

export default ReceiptsCols;
