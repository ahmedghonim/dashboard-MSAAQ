import React from "react";

import Link from "next/link";

import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { useFormatPrice } from "@/hooks";
import { Course, bestSellers } from "@/types";
import { getStatusColor } from "@/utils";

import { Badge, Typography } from "@msaaqcom/abjad";

const bestSellingCoursesCol = () => [
  {
    Header: <Trans i18nKey="courses.course_title">Title</Trans>,
    id: "title",
    accessor: "product.title",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { product }
      }
    }: CellProps<bestSellers>) => {
      return product?.id ? (
        <Link
          href={`/courses/${product.id}`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={product.title}
          />
          <div className="mt-4px flex flex-row">
            <Badge
              size="xs"
              variant={getStatusColor(product.status)}
              className="ml-2"
              soft
            >
              <Trans
                i18nKey={`statuses.${product.status}`}
                children={product.status}
              />
            </Badge>
            <Typography.Paragraph
              as="span"
              size="sm"
              weight="normal"
              className="text-gray-700"
              children={(product as Course).category?.name}
            />
          </div>
        </Link>
      ) : (
        "-"
      );
    }
  },
  {
    Header: <Trans i18nKey="common:price">Price</Trans>,
    id: "price",
    accessor: "product.price",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { product }
      }
    }: CellProps<bestSellers>) => {
      const { formatPrice } = useFormatPrice();
      return product?.id ? (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={formatPrice(product?.price)}
        />
      ) : null;
    }
  }
];
export default bestSellingCoursesCol;
