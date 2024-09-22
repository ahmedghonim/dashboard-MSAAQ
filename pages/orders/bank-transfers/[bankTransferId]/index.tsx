import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout, PaymentMethodLogo, Time } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { CartItems } from "@/components/shared/cart/CartItems";
import { CartSource } from "@/components/shared/cart/CartSource";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchBankTransferQuery, useUpdateBankTransferMutation } from "@/store/slices/api/bankTransfersSlice";
import { APIActionResponse, BankTransferStatus, Order } from "@/types";
import { BankTransfer } from "@/types/models/bank-transfer";
import { getStatusColor, randomUUID } from "@/utils";

import { Alert, Avatar, Badge, Button, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function OrderShowPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPrice, setCurrency } = useFormatPrice();
  const [updateMutation] = useUpdateBankTransferMutation();
  const { data: bankTransfer = {} as BankTransfer } = useFetchBankTransferQuery(router.query.bankTransferId as any);
  const order = (bankTransfer.order as Order) || (bankTransfer.cart as Order) || ({} as Order);
  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  useEffect(() => {
    if (order.currency) {
      setCurrency(order.currency);
    }
  }, [order]);

  const AlertStatus = () => {
    let variant = "default";
    switch (bankTransfer.status) {
      case BankTransferStatus.CANCELLED:
        variant = "info";
        break;
      case BankTransferStatus.PAID:
        variant = "success";
        break;
    }

    return (
      <Alert
        variant={variant}
        title={t(`bank_transfers.alerts.${bankTransfer.status}.title`)}
      >
        {t(`bank_transfers.alerts.${bankTransfer.status}.description`)}

        {bankTransfer.status === BankTransferStatus.PENDING ? " " : null}
        {bankTransfer.status === BankTransferStatus.PENDING && (
          <a
            href={bankTransfer.receipt.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-info underline"
            children={t("bank_transfers.alerts.pending.show_receipt")}
          />
        )}
      </Alert>
    );
  };

  const handleStatus = async (status: BankTransferStatus) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("cancel"),
        title: t(`bank_transfers.confirmation_alerts.${status}.title`),
        children: t(`bank_transfers.confirmation_alerts.${status}.description`)
      }))
    ) {
      return;
    }

    const response = (await updateMutation({
      id: bankTransfer.id,
      status
    })) as APIActionResponse<BankTransfer>;

    if (displayErrors(response)) {
      return;
    }

    displaySuccess(response);

    const { data } = response.data;
    if (data.order?.id) {
      await router.push({
        pathname: `/orders/[orderId]`,
        query: { orderId: response.data.data.order.id }
      });
    } else {
      await router.push({
        pathname: `/orders`
      });
    }
  };

  return (
    <Layout title={t("sidebar.orders.title")}>
      <Layout.Container>
        <Layout.FormGrid
          sidebar={
            <Layout.FormGrid.DefaultSidebar>
              <div className="flex flex-col gap-4">
                <Card label={t("orders.financial_details")}>
                  <Card.Body className="flex flex-col gap-2">
                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(order.subtotal)}
                      subtitle={t("orders.total")}
                    />

                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(order.tax)}
                      subtitle={t("orders.tax_with_percentage", { percentage: order.tax_percentage ?? 0 })}
                    />

                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={
                        <span
                          children={formatPrice(order.discount)}
                          className={order.discount ? "text-success" : ""}
                        />
                      }
                      subtitle={t("orders.discount_amount")}
                    />
                  </Card.Body>

                  <Card.Actions>
                    <Title
                      reverse
                      className="w-full [&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(order.total)}
                      subtitle={
                        <span
                          className="font-bold text-gray-950"
                          children={t("orders.subtotal_amount")}
                        />
                      }
                    />
                  </Card.Actions>
                </Card>

                {bankTransfer.status === BankTransferStatus.PENDING ? (
                  <Card>
                    <Card.Body className="flex flex-col gap-2">
                      <AlertStatus />
                    </Card.Body>

                    <Card.Actions className="flex-col space-y-2">
                      <Button
                        variant="primary"
                        className="w-full"
                        children={t("orders.confirm_order")}
                        onClick={() => handleStatus(BankTransferStatus.PAID)}
                      />
                      <Button
                        variant="dismiss"
                        className="w-full"
                        children={t("orders.reject_order")}
                        onClick={() => handleStatus(BankTransferStatus.CANCELLED)}
                      />
                    </Card.Actions>
                  </Card>
                ) : (
                  <AlertStatus />
                )}
              </div>
            </Layout.FormGrid.DefaultSidebar>
          }
        >
          <div className="flex flex-col gap-4">
            <Card label={t("orders.transaction_details")}>
              <Card.Body className="flex justify-between py-6">
                <div className="flex items-center gap-2">
                  <Typography.Subtitle
                    size="lg"
                    children={formatPrice(order.total)}
                  />

                  <Badge
                    size="sm"
                    variant={getStatusColor(bankTransfer.status)}
                    children={<Trans i18nKey={`bank_transfers.statuses.${bankTransfer.status}`} />}
                    rounded
                    soft
                  />
                </div>

                <Button
                  as="a"
                  href={bankTransfer.receipt?.url}
                  target="_blank"
                  variant="default"
                  children={t("bank_transfers.receipt_url")}
                />
              </Card.Body>
              <Card.Actions className="card-divide-x grid grid-cols-5">
                <Title
                  className="col-span-2"
                  prepend={
                    <Avatar
                      imageUrl={bankTransfer.member?.avatar?.url}
                      name={bankTransfer.member?.name}
                    />
                  }
                  title={bankTransfer.member?.name}
                  subtitle={bankTransfer.member?.email}
                />

                <Title
                  reverse
                  title={<Time date={bankTransfer.created_at} />}
                  subtitle={t("orders.created_at")}
                />

                <Title
                  reverse
                  title={<PaymentMethodLogo method={order.payment_method ?? "bank_transfer"} />}
                  subtitle={t("orders.payment_method")}
                />

                <Title
                  reverse
                  title={bankTransfer.order?.id ?? "—"}
                  subtitle={t("orders.id")}
                />
              </Card.Actions>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <CartItems
                items={order.items}
                formatPrice={formatPrice}
              />

              <CartSource source={order.source} />
            </div>
          </div>
        </Layout.FormGrid>
      </Layout.Container>
    </Layout>
  );
}
