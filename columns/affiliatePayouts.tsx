import React from "react";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { PaymentMethodLogo, Time, UserAvatar } from "@/components";
import { useFormatPrice } from "@/hooks";
import { AffiliatePayout } from "@/types/models/affiliatePayout";

import { Badge, Button, Typography } from "@msaaqcom/abjad";

interface AffiliateRequestColumnsProps {
  sortables: Array<string>;

  approveAffiliateHandler: (payout: AffiliatePayout) => void;
}

const AffiliatePayoutsCols = ({ sortables = [], approveAffiliateHandler }: AffiliateRequestColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="marketing.affiliates.member_name">Member name</Trans>,
      id: "member_name",
      accessor: "member_name",
      disableSortBy: !sortables?.includes("member_name"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="marketing.affiliates.method">Method</Trans>,
      id: "method",
      accessor: "method",
      disableSortBy: !sortables?.includes("method"),
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => <PaymentMethodLogo method={original.method} />
    },
    {
      Header: <Trans i18nKey="marketing.affiliates.status">Status</Trans>,
      id: "confirmed",
      accessor: "confirmed",
      disableSortBy: !sortables?.includes("confirmed"),
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={
              <Badge
                size="xs"
                variant={original.confirmed ? "success" : "warning"}
                className="ml-2"
                soft
              >
                <Trans
                  i18nKey={
                    original.confirmed
                      ? "marketing.affiliates.statuses.confirmed"
                      : "marketing.affiliates.statuses.pending"
                  }
                  children={original.confirmed ? "Confirmed" : "Pending"}
                />
              </Badge>
            }
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.affiliates.amount">Amount</Trans>,
      id: "amount",
      accessor: "amount",
      disableSortBy: !sortables?.includes("amount"),
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => {
        const { formatPrice } = useFormatPrice();
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={formatPrice(original.amount)}
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.affiliates.created_at">Created At</Trans>,
      id: "created_at",
      accessor: "created_at",
      disableSortBy: !sortables?.includes("created_at"),
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => (
        <Time
          className={"text-gray-950"}
          date={original.created_at}
          format={"DD MMMM YYYY"}
        />
      )
    },
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<AffiliatePayout>) => {
        const { t } = useTranslation();

        return !original.confirmed ? (
          <div className="flex flex-row">
            <Button
              onClick={() => {
                approveAffiliateHandler(original);
              }}
              variant="primary"
              size="sm"
              className="ml-2 min-w-[110px]"
              children={t("marketing.affiliates.actions.approve")}
            />
          </div>
        ) : null;
      }
    }
  ];
};

export default AffiliatePayoutsCols;
