import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useConfirmableDelete, useFormatPrice } from "@/hooks";
import { useDeleteCouponMutation } from "@/store/slices/api/couponsSlice";
import { Coupon, CouponType } from "@/types/models/coupon";

import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Form, Icon, Typography } from "@msaaqcom/abjad";

interface CouponColumnsProps {
  sortables: Array<string>;

  toggleCouponStatusHandler: (coupon: Coupon) => void;
}

const CouponsCols = ({ sortables = [], toggleCouponStatusHandler }: CouponColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="marketing.coupons.code">Code</Trans>,
      id: "code",
      accessor: "code",
      disableSortBy: !sortables?.includes("code"),
      Cell: ({ row: { original } }: CellProps<Coupon>) => (
        <Link
          href={`/marketing/coupons/${original.id}/stats`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.code}
          />
          <div className="mt-4px flex flex-row">
            <Badge
              size="xs"
              variant={original.expired ? "warning" : original.enabled ? "success" : "danger"}
              className="ml-2"
              soft
            >
              <Trans
                i18nKey={`marketing.coupons.statuses.${
                  original.expired ? "expired" : original.enabled ? "enabled" : "disabled"
                }`}
                children={original.expired ? "expired" : original.enabled ? "enabled" : "disabled"}
              />
            </Badge>
          </div>
        </Link>
      )
    },
    {
      Header: <Trans i18nKey="marketing.coupons.amount">Amount</Trans>,
      id: "amount",
      accessor: "amount",
      disableSortBy: !sortables?.includes("amount"),
      Cell: ({ row: { original } }: CellProps<Coupon>) => {
        const { formatPrice } = useFormatPrice();
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.type === CouponType.PERCENTAGE ? `${original.amount}%` : formatPrice(original.amount)}
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.coupons.type">Type</Trans>,
      id: "type",
      accessor: "type",
      disableSortBy: !sortables?.includes("type"),
      Cell: ({ row: { original } }: CellProps<Coupon>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={
            <Trans
              i18nKey={`marketing.coupons.types.${original.type}`}
              children={original.type}
            />
          }
        />
      )
    },
    {
      Header: <Trans i18nKey="marketing.coupons.usage_limit">Usage Limit</Trans>,
      id: "usage_limit",
      accessor: "usage_limit",
      disableSortBy: !sortables?.includes("usage_limit"),
      Cell: ({ row: { original } }: CellProps<Coupon>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={
            original.usage_limit || (
              <Trans
                i18nKey={`marketing.coupons.infinity`}
                children="Infinity"
              />
            )
          }
        />
      )
    },
    {
      Header: <Trans i18nKey="marketing.coupons.expiry_at">Expiry At</Trans>,
      id: "expiry_at",
      accessor: "expiry_at",
      disableSortBy: !sortables?.includes("expiry_at"),
      Cell: ({ row: { original } }: CellProps<Coupon>) => (
        <>
          {original.expiry_at ? (
            <Time
              className={"text-gray-950"}
              date={original.expiry_at}
              format={"DD MMMM YYYY"}
            />
          ) : (
            <Typography.Paragraph
              as="span"
              size="md"
              weight="medium"
              children="—"
            />
          )}
        </>
      )
    },
    {
      Header: <Trans i18nKey="marketing.coupons.change_status">Expiry At</Trans>,
      id: "enabled",
      Cell: ({ row: { original } }: CellProps<Coupon>) => {
        return (
          <>
            {!original.expired ? (
              <Form.Toggle
                id={`enabled-${original.id}`}
                value={Number(original.enabled)}
                checked={original.enabled}
                label={null}
                description={null}
                onChange={() => toggleCouponStatusHandler(original)}
              />
            ) : (
              <Typography.Paragraph
                as="span"
                size="md"
                weight="medium"
                children="—"
              />
            )}
          </>
        );
      }
    },
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Coupon>) => {
        const { t } = useTranslation();
        const [confirmableDelete] = useConfirmableDelete({
          mutation: useDeleteCouponMutation
        });

        return (
          <div className="flex flex-row">
            <Button
              as={Link}
              href={`/marketing/coupons/${original.id}/stats`}
              variant="default"
              size="sm"
              className="ml-2 min-w-[110px]"
              children={t("marketing.coupons.show_stats")}
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
                  href={`/marketing/coupons/${original.id}/stats`}
                  children={t("marketing.coupons.show_stats")}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<EyeIcon />}
                    />
                  }
                />
                <Dropdown.Item
                  as={Link}
                  href={`/marketing/coupons/${original.id}/edit`}
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
                  children={t("marketing.coupons.delete_coupon")}
                  className="text-danger"
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<TrashIcon />}
                    />
                  }
                  onClick={() => {
                    confirmableDelete({
                      id: original.id,
                      title: t("marketing.coupons.delete_coupon"),
                      label: t("marketing.coupons.delete_coupon_confirm"),
                      children: t("marketing.coupons.delete_coupon_confirm_message")
                    });
                  }}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        );
      }
    }
  ];
};

export default CouponsCols;
