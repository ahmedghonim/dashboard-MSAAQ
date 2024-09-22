import React, { FC } from "react";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import ShareModalBody from "@/components/shared/ShareModalBody";
import { useFormatPrice } from "@/hooks";
import { Course, Product, ProductModelType, ProductType } from "@/types";
import { getProductType, secondsToHMS, stripHtmlTags } from "@/utils";

import { ArrowDownTrayIcon, ClockIcon, EyeIcon, FolderOpenIcon, RssIcon } from "@heroicons/react/24/outline";

import { Button, Grid, Icon, Typography } from "@msaaqcom/abjad";

interface ProductPreviewCardProps {
  product: Product | Course;
  title: string;
  product_landing_page_label: string;
}

const ProductPreviewCard: FC<ProductPreviewCardProps> = ({ product, title, product_landing_page_label }) => {
  const { t } = useTranslation();

  const { formatPrice } = useFormatPrice();

  const RenderProductIcon = () => {
    if (getProductType(product) === ProductModelType.COURSE && product.type == "online") {
      return (
        <div className="flex flex-row items-center text-gray-700">
          <Icon
            size="sm"
            className="ml-1"
          >
            <ClockIcon />
          </Icon>
          <Typography.Paragraph
            size="md"
            weight="normal"
          >
            {secondsToHMS((product as Course)?.duration ?? 0).hours} {t("hour")}{" "}
            {secondsToHMS((product as Course)?.duration ?? 0).minutes} {t("minute")}
          </Typography.Paragraph>
        </div>
      );
    }
    switch ((product as Product).type) {
      case ProductType.DIGITAL:
        return (
          <div className="flex items-center gap-2 text-gray-700">
            <Icon>
              <ArrowDownTrayIcon />
            </Icon>
            <Typography.Paragraph
              size="md"
              weight="normal"
              children={t("products.digital_product")}
            />
          </div>
        );
      case ProductType.COACHING_SESSION:
        return (
          <div className="flex items-center gap-2 text-gray-700">
            <Icon>
              <RssIcon />
            </Icon>
            <Typography.Paragraph
              size="md"
              weight="normal"
              children={t("coaching_sessions.coaching_session")}
            />
          </div>
        );
      case ProductType.BUNDLE:
        const courses_count = (product as Product).bundle?.filter(
          (product) => getProductType(product) === ProductModelType.COURSE
        ).length;
        const products_count = (product as Product).bundle?.filter(
          (product) => getProductType(product) === ProductModelType.PRODUCT
        ).length;
        const hasOnlyCourses = courses_count > 0 && products_count === 0;
        const hasOnlyProducts = products_count > 0 && courses_count === 0;
        const hasBoth = courses_count > 0 && products_count > 0;
        return (
          <div className="flex items-center gap-2 text-gray-700">
            <Icon>
              <FolderOpenIcon />
            </Icon>
            <Typography.Paragraph
              size="md"
              weight="normal"
            >
              {hasOnlyCourses && t("courses_count", { count: courses_count })}
              {hasOnlyProducts && t("products_count", { count: products_count })}
              {hasBoth && t("courses_count_and_products_count", { courses_count, products_count })}
            </Typography.Paragraph>
          </div>
        );
    }
  };

  return (
    <Card>
      <Card.Header>
        <Typography.Paragraph
          as="span"
          size="lg"
          weight="medium"
          children={title}
          className="mb-2"
        />
      </Card.Header>
      <Card.Body>
        <Grid
          columns={{
            md: 12,
            lg: 12
          }}
        >
          <Grid.Cell
            columnSpan={{
              md: 6,
              lg: 6
            }}
          >
            <Card className="h-full bg-gray-100">
              <Card.Body className="flex h-full flex-col">
                <div
                  style={{
                    height: "172px",
                    backgroundImage: `url(${product?.thumbnail?.url})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                  }}
                  className="rounded"
                />

                <Typography.Paragraph
                  size="lg"
                  weight="medium"
                  className="mt-4"
                >
                  {product?.title}
                </Typography.Paragraph>
                <Typography.Paragraph
                  size="md"
                  weight="normal"
                  className="truncate text-gray-700"
                >
                  {stripHtmlTags(product?.description ?? "")}
                </Typography.Paragraph>
                <div className="mt-auto flex flex-col space-y-6">
                  <div className="mt-4 flex items-center justify-between">
                    {RenderProductIcon()}
                    {product?.sales_price > 0 ? (
                      <div className="flex flex-col text-center">
                        <Typography.Paragraph
                          size="sm"
                          weight="medium"
                          className="text-gray-600 line-through"
                        >
                          {formatPrice(product?.sales_price ?? 0)}
                        </Typography.Paragraph>
                        <Typography.Paragraph
                          size="md"
                          weight="medium"
                          className="text-primary"
                        >
                          {formatPrice(product?.price ?? 0)}
                        </Typography.Paragraph>
                      </div>
                    ) : (
                      <Typography.Paragraph
                        size="lg"
                        weight="bold"
                      >
                        {formatPrice(product.price)}
                      </Typography.Paragraph>
                    )}
                  </div>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="primary"
                      isFetching
                      style={{ width: "188.5px" }}
                    />
                    <Button
                      variant="secondary"
                      isFetching
                      style={{ width: "133px" }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Grid.Cell>
          <Grid.Cell
            columnSpan={{
              md: 6,
              lg: 6
            }}
            className="rounded-md border border-gray-300 p-4"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="rounded-full bg-primary-50 p-2">
                  <Icon>
                    <EyeIcon />
                  </Icon>
                </div>
                <Typography.Paragraph
                  size="lg"
                  weight="medium"
                  className="mr-2.5"
                >
                  روابط سريعة
                </Typography.Paragraph>
              </div>

              <ShareModalBody
                productLabel={product_landing_page_label}
                productLink={product.url}
                checkoutLink={product.checkout_url}
              />
            </div>
          </Grid.Cell>
        </Grid>
      </Card.Body>
    </Card>
  );
};
export default ProductPreviewCard;
