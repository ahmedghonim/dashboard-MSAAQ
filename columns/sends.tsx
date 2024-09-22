import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { Send } from "@/types/models/send";
import { getStatusColor } from "@/utils";

import { Badge, Typography } from "@msaaqcom/abjad";

interface SendColumnsProps {
  sortables: Array<string>;
}

const SendCols = ({ sortables = [] }: SendColumnsProps) => {
  return [
    {
      Header: <Trans i18nKey="marketing.campaigns.sends.client_name">client_name</Trans>,
      id: "member",
      accessor: "member",
      disableSortBy: true,
      width: 250,
      Cell: ({ row: { original } }: CellProps<Send>) => <UserAvatar user={original.member} />
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.sends.created_at">created_at</Trans>,
      id: "created_at",
      accessor: "created_at",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Send>) => (
        <Time
          className={"text-gray-950"}
          date={original.created_at}
          format={"DD MMMM YYYY"}
        />
      )
    },

    {
      Header: <Trans i18nKey="marketing.campaigns.sends.status">status</Trans>,
      id: "status",
      accessor: "status",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Send>) => {
        return (
          <Badge
            size="xs"
            variant={getStatusColor(original.status)}
            soft
            children={
              <Trans
                i18nKey={`marketing.campaigns.sends.statuses.${original.status}`}
                children={original.status}
              />
            }
          />
        );
      }
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.sends.opened_at">opened_at</Trans>,
      id: "opened_at",
      accessor: "opened_at",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Send>) =>
        original.opened_at ? (
          <Time
            className={"text-gray-950"}
            date={original.opened_at ?? "-"}
            format={"DD MMMM YYYY"}
          />
        ) : (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={"-"}
          />
        )
    },
    {
      Header: <Trans i18nKey="marketing.campaigns.sends.clicks_count">clicks_count</Trans>,
      id: "clicks_count",
      accessor: "clicks_count",
      disableSortBy: true,
      Cell: ({ row: { original } }: CellProps<Send>) => {
        return (
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.clicks_count}
          />
        );
      }
    }
  ];
};

export default SendCols;
