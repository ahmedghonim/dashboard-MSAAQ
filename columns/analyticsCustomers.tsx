import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Price, UserAvatar } from "@/components";
import dayjs from "@/lib/dayjs";
import { Member, Receipt } from "@/types";

import { Title, Typography } from "@msaaqcom/abjad";

interface CustomersColumnsProps {
  sortables: Array<string>;
  columns?: Array<string>;
}
const analyticsCustomersCol = ({ sortables = [], columns = [] }: CustomersColumnsProps) => [
  {
    Header: <Trans i18nKey="analytics.customers.table.customer">customer</Trans>,
    id: "name",
    accessor: "name",
    disableSortBy: !sortables?.includes("name"),
    Cell: ({ row: { original } }: CellProps<Member>) => <UserAvatar user={original} />
  },
  {
    Header: <Trans i18nKey="analytics.customers.table.created_at" />,
    id: "created_at",
    accessor: "created_at",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Member>) => {
      return (
        <Title
          reverse
          title={
            <>
              <span className="flex justify-between gap-x-1">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  size="md"
                  // @ts-ignore
                  children={dayjs(original?.created_at).fromNow(false)}
                />
              </span>
            </>
          }
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="analytics.customers.table.total_purchases" />,
    id: "total_purchases",
    accessor: "total_purchases",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Member>) => {
      return <Price price={original.total_purchases} />;
    }
  },
  {
    Header: <Trans i18nKey="analytics.customers.table.orders_number" />,
    id: "orders_count",
    accessor: "orders_count",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Member>) => {
      return (
        <Typography.Paragraph
          as="span"
          weight="medium"
          size="md"
          children={original?.orders_count ?? "-"}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="analytics.customers.table.last_seen" />,
    id: "last_seen_at",
    accessor: "last_seen_at",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Member>) => {
      return (
        <Title
          reverse
          title={
            <>
              <span className="flex justify-between gap-x-1">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  size="md"
                  // @ts-ignore
                  children={original?.last_seen_at ? dayjs(original?.last_seen_at).fromNow(false) : "-"}
                />
              </span>
            </>
          }
        />
      );
    }
  }
];
export default analyticsCustomersCol;
