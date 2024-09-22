import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { UserAvatar } from "@/components";
import { CouponUse } from "@/types/models/coupon";

import { Typography } from "@msaaqcom/abjad";

interface CouponUseColumnsProps {
  sortables: Array<string>;
}

const CouponUsesCols = ({ sortables = [] }: CouponUseColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="marketing.coupons.stats.member_name">Member Name</Trans>,
      id: "member_name",
      accessor: "member_name",
      disableSortBy: !sortables?.includes("member_name"),
      Cell: ({ row: { original } }: CellProps<CouponUse>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="marketing.coupons.stats.usage">Amount</Trans>,
      id: "usage",
      accessor: "usage",
      disableSortBy: !sortables?.includes("usage"),
      Cell: ({ row: { original } }: CellProps<CouponUse>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.usage}
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.coupons.stats.remaining">Amount</Trans>,
      id: "remaining",
      accessor: "remaining",
      disableSortBy: !sortables?.includes("remaining"),
      Cell: ({ row: { original } }: CellProps<CouponUse>) => {
        const { t } = useTranslation();
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={
              original.coupon.usage_limit_per_user
                ? original.coupon.usage_limit_per_user - original.usage
                : t("marketing.coupons.infinity")
            }
          />
        );
      }
    }
  ];
};

export default CouponUsesCols;
