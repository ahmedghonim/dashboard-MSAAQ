import React, { FC, ReactNode } from "react";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Course, Product } from "@/types";

import { BanknotesIcon, LinkIcon } from "@heroicons/react/24/outline";

import { Icon, Title, Typography } from "@msaaqcom/abjad";

const ProductDetailsCard: FC<{
  product: Product | Course;
  items?: Array<{
    icon: ReactNode;
    title: string;
    subtitle: string;
  }>;
}> = ({ product, items }) => {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice();

  return (
    <Card>
      <Card.Header>
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          children={t("details")}
        />
      </Card.Header>
      <Card.Body className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="bg-black/2 ml-4 rounded-full p-2">
            <Icon
              size="md"
              className="text-gray-800"
            >
              <BanknotesIcon />
            </Icon>
          </div>
          <Title
            reverse
            title={product.price > 0 ? formatPrice(product.price) : t("undefined")}
            subtitle={t("price")}
          />
        </div>
        {items?.map((item, index) => (
          <div
            className="flex items-center"
            key={index}
          >
            <div className="bg-black/2 ml-4 rounded-full p-2">
              <Icon
                size="md"
                className="text-gray-800"
              >
                {item.icon}
              </Icon>
            </div>
            <Title
              reverse
              title={item.title ?? "—"}
              subtitle={item.subtitle}
            />
          </div>
        ))}
        <div className="flex items-center">
          <div className="bg-black/2 ml-4 rounded-full p-2">
            <Icon
              size="md"
              className="text-gray-800"
            >
              <LinkIcon />
            </Icon>
          </div>
          <Title
            reverse
            title={product.status ? t(`statuses.${product.status}`) : "—"}
            subtitle={t("publish_status")}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductDetailsCard;
