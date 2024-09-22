import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Price } from "@/components";
import { Course, Product } from "@/types";

import { Badge, Typography } from "@msaaqcom/abjad";

interface Props {
  sortables: Array<string>;
}

const analyticsProductsCol = ({ sortables = [] }: Props) => [
  {
    Header: <Trans i18nKey="analytics.products.table.title">title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({ row: { original } }: CellProps<Course | Product>) => {
      const { category } = original as Course;
      return (
        <div className="flex flex-col">
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.title}
          />
          {category && (
            <div className="mt-4px flex flex-row">
              <Badge
                size="xs"
                className="ml-2"
                rounded
                soft
              >
                <Trans
                  i18nKey={category?.name}
                  children={category?.name}
                />
              </Badge>
            </div>
          )}
        </div>
      );
    }
  },
  {
    Header: <Trans i18nKey="analytics.products.table.total_orders" />,
    id: "enrollments_count",
    accessor: "enrollments_count",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Course | Product>) => {
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.sales ?? "-"}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="analytics.products.table.orders_number" />,
    id: "orders_number",
    accessor: "orders_number",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Course | Product>) => {
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={original.sales_this_period ?? "-"}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="analytics.products.table.price" />,
    id: "price",
    accessor: "price",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Course | Product>) => {
      return <Price price={original.price} />;
    }
  },
  {
    Header: <Trans i18nKey="analytics.products.table.total_earnings" />,
    id: "total_earnings",
    accessor: "total_earnings",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Course | Product>) => {
      return <Price price={original.earnings} />;
    }
  }
];
export default analyticsProductsCol;
