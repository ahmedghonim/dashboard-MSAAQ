import React from "react";

import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { ProductDownload } from "@/types";

import { Typography } from "@msaaqcom/abjad";

interface ProductColumnsProps {
  sortables: Array<string>;
}

const productDownloadsCol = ({ sortables = [] }: ProductColumnsProps) => [
  {
    Header: <Trans i18nKey="the_student">student</Trans>,
    id: "member",
    accessor: "member",
    style: {
      width: "185px"
    },
    disableSortBy: true,
    Cell: ({
      row: {
        original: { member }
      }
    }: CellProps<ProductDownload>) => <UserAvatar user={member} />
  },
  {
    Header: <Trans i18nKey="products.downloaded_at">downloaded at</Trans>,
    id: "downloaded_at",
    accessor: "downloaded_at",
    disableSortBy: !sortables?.includes("downloaded_at"),
    Cell: ({
      row: {
        original: { created_at }
      }
    }: CellProps<ProductDownload>) => (
      <Typography.Paragraph
        size="md"
        weight="medium"
        className="text-gray-700"
        children={<Time date={created_at} />}
      />
    )
  }
];

export default productDownloadsCol;
