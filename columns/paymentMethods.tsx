import React from "react";

import isEmpty from "lodash/isEmpty";
import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { PaymentMethodLogo } from "@/components";
import { useAppDispatch, useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useDeleteCardMutation, useMarkCardAsDefaultMutation } from "@/store/slices/api/billing/paymentMethodsSlice";
import { APIActionResponse, Card } from "@/types";

import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

const PaymentMethodsCols = () => [
  {
    Header: <Trans i18nKey="billing.payment_methods.card.brand">brand</Trans>,
    id: "card.brand",
    accessor: "card",
    disableSortBy: true,
    width: 100,
    Cell: ({ row: { original } }: CellProps<Card>) => <PaymentMethodLogo method={original.scheme.toLowerCase()} />
  },
  {
    Header: <Trans i18nKey="billing.payment_methods.card.last_four">last_four</Trans>,
    id: "card.last_four",
    accessor: "card",
    disableSortBy: true,
    width: 100,
    Cell: ({ row: { original } }: CellProps<Card>) =>
      !isEmpty(original.last_four) ? (
        <Typography.Paragraph
          dir="auto"
          children={`**** ${original.last_four}`}
        />
      ) : (
        "-"
      )
  },
  {
    Header: <Trans i18nKey="billing.payment_methods.card.expiration_date">expiration_date</Trans>,
    id: "card.expiration_date",
    accessor: "card",
    disableSortBy: true,
    width: 100,
    Cell: ({ row: { original } }: CellProps<Card>) =>
      original.expiry_year ? (
        <Typography.Paragraph
          dir="auto"
          children={original.expiry_month + "/" + original.expiry_year}
        />
      ) : (
        "-"
      )
  },
  {
    Header: "",
    id: "status",
    accessor: "status",
    disableSortBy: true,
    width: 100,
    Cell: ({ row: { original } }: CellProps<Card>) =>
      original.is_default ? (
        <Badge
          variant="success"
          size="sm"
          soft
          rounded
          children={<Trans i18nKey="billing.payment_methods.card.default" />}
        />
      ) : (
        ""
      )
  },
  {
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<Card>) => {
      const { t } = useTranslation();
      const [confirmableDelete] = useConfirmableDelete({
        mutation: useDeleteCardMutation
      });
      const { display } = useResponseToastHandler({});
      const dispatch = useAppDispatch();
      const [makeCardAsDefault] = useMarkCardAsDefaultMutation();

      return (
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
            {!original.is_default && (
              <>
                <Dropdown.Item
                  children={"تعيين كبطاقة افتراضية"}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<CheckCircleIcon />}
                    />
                  }
                  onClick={async () => {
                    display((await makeCardAsDefault(original)) as APIActionResponse<any>);

                    dispatch(apiSlice.util.invalidateTags(["payment-methods.index"]));
                  }}
                />
                <Dropdown.Divider />
              </>
            )}

            <Dropdown.Item
              children={t("delete")}
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
                  title: "حذف طريقة الدفع",
                  children: `تأكَّد من قرار الحذف قبل الضغط على "تأكيد"، إذ لن تستطيع استخدام طريقة الدفع المُحدَّدة بعد ذلك.`
                });
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      );
    }
  }
];

export default PaymentMethodsCols;
