import React from "react";

import { isString } from "lodash";
import { useTranslation } from "next-i18next";

import { Card } from "@/components";

import { Avatar, Title } from "@msaaqcom/abjad";

type Props = {
  items: any[];
  formatPrice: (price: number) => string;
};

export const CartItems = ({ items, formatPrice }: Props) => {
  const { t } = useTranslation();

  return (
    <Card
      label={t("orders.cart")}
      className="h-full"
    >
      <Card.Body className="flex flex-col divide-y">
        {items?.map((item, i) =>
          item.product ? (
            <Title
              key={i}
              prepend={
                <Avatar
                  size="lg"
                  type="rounded"
                  imageUrl={isString(item.product.thumbnail) ? item.product.thumbnail : undefined}
                  name={item.product.title}
                />
              }
              title={item.product.title}
              subtitle={formatPrice(item.total ?? item.price)}
              className="py-4 first:pt-0 last:pb-0"
            />
          ) : (
            <Title
              key={i}
              prepend={
                <Avatar
                  size="lg"
                  type="rounded"
                  name={"منتج محذوف"}
                />
              }
              title={"منتج محذوف"}
              subtitle={formatPrice(item.total ?? item.price)}
              className="py-4 first:pt-0 last:pb-0"
            />
          )
        )}
      </Card.Body>
    </Card>
  );
};
