import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Cart } from "@/types";

import { BellIcon } from "@heroicons/react/24/outline";

import { Button, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

interface CartColumnsProps {
  sortables: Array<string>;
}

const CartsCols = ({ sortables = [] }: CartColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="the_student">student</Trans>,
      id: "member",
      accessor: "member",
      disableSortBy: true,
      width: 250,
      Cell: ({ row: { original } }: CellProps<Cart>) => {
        const { t } = useTranslation();
        return (
          original.member && (
            <UserAvatar
              user={{
                ...original.member,
                ...(original.member?.__temp_member ? { name: t("common:guest") } : {})
              }}
            />
          )
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.abandoned_carts.created_at">تاريخ إنشاء السلة</Trans>,
      id: "created_at",
      accessor: "created_at",
      disableSortBy: !sortables?.includes("created_at"),
      Cell: ({ row: { original } }: CellProps<Cart>) => (
        <Time
          className={"text-gray-950"}
          date={original.created_at}
          format={"DD MMMM YYYY"}
        />
      )
    },
    {
      Header: <Trans i18nKey="marketing.abandoned_carts.products_count">عدد المنتجات</Trans>,
      id: "products_count",
      accessor: "products_count",
      disableSortBy: !sortables?.includes("products_count"),
      Cell: ({ row: { original } }: CellProps<Cart>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.items_count}
        />
      )
    },
    {
      Header: <Trans i18nKey="marketing.abandoned_carts.total">قيمة السلة</Trans>,
      id: "total",
      accessor: "total",
      disableSortBy: !sortables?.includes("total"),
      Cell: ({ row: { original } }: CellProps<Cart>) => {
        const { formatPrice } = useFormatPrice();
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={formatPrice(original.total)}
          />
        );
      }
    },
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Cart>) => {
        const { t, i18n } = useTranslation();

        return original.member?.__temp_member ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                disabled
                variant="default"
                size="sm"
                className="min-w-[110px]"
                icon={
                  <Icon size="sm">
                    <BellIcon />
                  </Icon>
                }
              >
                {t("marketing.abandoned_carts.create_custom_reminder")}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content key={i18n.language}>
              {t("marketing.abandoned_carts.create_custom_reminder_guest_tooltip")}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <Button
            as={Link}
            href={`/marketing/abandoned-carts/reminders/${original.id}/custom`}
            variant="default"
            size="sm"
            className="min-w-[110px]"
            icon={
              <Icon size="sm">
                <BellIcon />
              </Icon>
            }
            children={t("marketing.abandoned_carts.create_custom_reminder")}
          />
        );
      }
    }
  ];
};

export default CartsCols;
