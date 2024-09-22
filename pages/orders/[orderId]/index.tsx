import React, { useEffect } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { saveAs } from "file-saver";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout, PaymentMethodLogo, Time } from "@/components";
import { CartItems } from "@/components/shared/cart/CartItems";
import { CartSource } from "@/components/shared/cart/CartSource";
import { useAppDispatch, useFormatPrice } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchOrderQuery } from "@/store/slices/api/ordersSlice";
import { Order, OrderStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { Alert, Avatar, Badge, Button, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function OrderShowPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { formatPrice, setCurrency } = useFormatPrice();
  const { data: order = {} as Order } = useFetchOrderQuery(router.query.orderId as any);

  useEffect(() => {
    if (order.currency) {
      setCurrency(order.currency);
    }
  }, [order]);
  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/orders` });
  }, []);

  const downloadInvoice = async () => {
    const data = await axios
      .get(`/orders/${order.id}/invoice`, {
        responseType: "blob"
      })
      .then((res) => res.data);

    saveAs(data, `invoice-${order.id}.pdf`);
  };

  const AlertStatus = () => {
    let variant = "default";
    switch (order?.status) {
      case OrderStatus.COMPLETED:
        variant = "success";
        break;
      case OrderStatus.CANCELLED:
        variant = "info";
        break;
    }
    if (order?.status == OrderStatus.COMPLETED || order?.status == OrderStatus.CANCELLED) {
      return (
        <Alert
          variant={variant}
          title={t(`orders.alerts.${order?.status}.title`)}
        >
          {t(`orders.alerts.${order?.status}.description`)}
        </Alert>
      );
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
                      subtitle={t("orders.subtotal")}
                    />

                    <Title
                      reverse
                      className="[&>*]:flex-row-reverse [&>*]:justify-between"
                      title={formatPrice(order.tax)}
                      subtitle={t("orders.tax_with_percentage", { percentage: order.tax_percentage ?? 0 })}
                    />
                    {order.payment_method === "Bank Transfer" && (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={formatPrice(order.gateway_fees)}
                        subtitle={t("orders.gateway_fees")}
                      />
                    )}

                    {order.discount > 0 && (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={
                          <span
                            children={formatPrice(order.discount)}
                            className={order.discount ? "text-success" : ""}
                          />
                        }
                        subtitle={
                          <div className="flex items-center gap-1">
                            {t("orders.discount_amount")} {order?.coupon_code ? `(${order?.coupon_code})` : ""}
                          </div>
                        }
                      />
                    )}
                    {order.affiliate_split > 0 && (
                      <Title
                        reverse
                        className="[&>*]:flex-row-reverse [&>*]:justify-between"
                        title={<span children={formatPrice(order.affiliate_split)} />}
                        subtitle={t("orders.affiliate_split")}
                      />
                    )}
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
                {order.payment_method === "Bank Transfer" && AlertStatus()}
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
                    variant={getStatusColor(order.status)}
                    children={<Trans i18nKey={`orders.statuses.${order.status}`} />}
                    rounded
                    soft
                  />
                </div>

                <Button
                  variant="default"
                  children={t("orders.invoice")}
                  onClick={downloadInvoice}
                />
              </Card.Body>
              <Card.Actions className="card-divide-x grid grid-cols-5">
                <Title
                  className="col-span-2"
                  prepend={
                    <Avatar
                      imageUrl={order.member?.avatar?.url}
                      name={order.member?.name}
                    />
                  }
                  title={order.member?.name}
                  subtitle={order.member?.email}
                />

                <Title
                  reverse
                  title={<Time date={order.created_at} />}
                  subtitle={t("orders.created_at")}
                />

                <Title
                  reverse
                  title={<PaymentMethodLogo method={order.payment_method} />}
                  subtitle={t("orders.payment_method")}
                />
                <Title
                  reverse
                  title={order.id}
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
