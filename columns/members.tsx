import React from "react";

import Link from "next/link";

import { Trans } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { useFormatPrice } from "@/hooks";
import { Member } from "@/types";

import { CheckCircleIcon, EyeIcon, GiftIcon, InboxIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export interface MembersColumnsProps {
  deactivateAccountHandler: (member: Member) => Promise<void>;
  activateAccountHandler: (member: Member) => Promise<void>;
  freeProductHandler: (member: Member) => void;
  restPasswordHandler: (member: Member) => Promise<void>;
  sortables: Array<string>;
}

const MembersCols = ({
  sortables = [],
  deactivateAccountHandler,
  activateAccountHandler,
  freeProductHandler,
  restPasswordHandler
}: MembersColumnsProps) => [
  {
    Header: <Trans i18nKey="the_student">student</Trans>,
    id: "member",
    accessor: "member",
    disableSortBy: true,
    width: 250,
    Cell: ({ row: { original } }: CellProps<Member>) => <UserAvatar user={original} />
  },
  {
    Header: <Trans i18nKey="students_flow.total_purchases">total purchases</Trans>,
    id: "total_purchases",
    accessor: "total_purchases",
    disableSortBy: !sortables?.includes("title"),
    Cell: ({ row: { original } }: CellProps<Member>) => {
      const { formatPrice } = useFormatPrice();
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={formatPrice(original.total_purchases)}
        />
      );
    }
  },
  {
    Header: <Trans i18nKey="students_flow.joined_at">joined at</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({
      row: {
        original: { created_at }
      }
    }: CellProps<Member>) => (
      <Time
        date={created_at}
        format={"D MMMM YYYY"}
      />
    )
  },
  {
    Header: <Trans i18nKey="students_flow.account_status">account status</Trans>,
    id: "status",
    accessor: "status",
    disableSortBy: true,
    style: {
      width: "133px"
    },
    Cell: ({
      row: {
        original: { status }
      }
    }: CellProps<Member>) => (
      <Badge
        soft
        rounded
        variant={status === "active" ? "success" : "danger"}
      >
        <Trans i18nKey={`students_flow.account_statuses.${status}`}>account status</Trans>
      </Badge>
    )
  },
  {
    Header: <Trans i18nKey="students_flow.newsletter_status">newsletter status</Trans>,
    id: "newsletter_status",
    accessor: "newsletter_status",
    disableSortBy: true,

    Cell: ({
      row: {
        original: { newsletter_status }
      }
    }: CellProps<Member>) => (
      <Badge
        soft
        rounded
        variant={newsletter_status === "subscribed" ? "success" : "default"}
      >
        <Trans i18nKey={`students_flow.newsletter_${newsletter_status}`}>newsletter_status</Trans>
      </Badge>
    )
  },
  {
    id: "actions",
    className: "justify-end",

    Cell: ({ row: { original } }: CellProps<Member>) => (
      <div className="flex flex-row">
        <Button
          as={Link}
          href={`/students/${original.id}`}
          variant="default"
          size="sm"
          className="ml-2"
          children={<Trans i18nKey="view">view profile</Trans>}
        />

        <Dropdown>
          <Dropdown.Trigger>
            <Button
              variant="default"
              size="sm"
              icon={
                <Icon
                  size="md"
                  children={<EllipsisHorizontalIcon />}
                />
              }
            />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item
              as={Link}
              href={`/students/${original.id}`}
              children={<Trans i18nKey="students_flow.view_profile">view profile</Trans>}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<EyeIcon />}
                />
              }
            />
            <Dropdown.Divider />
            <Dropdown.Item
              children={<Trans i18nKey="students_flow.send_gift">send free product</Trans>}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<GiftIcon />}
                />
              }
              onClick={() => freeProductHandler(original)}
            />
            <Dropdown.Divider />
            <Dropdown.Item
              children={<Trans i18nKey="students_flow.rest_password_link">rest password link</Trans>}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<InboxIcon />}
                />
              }
              onClick={() => restPasswordHandler(original)}
            />
            <Dropdown.Divider />
            {original.status === "inactive" ? (
              <Dropdown.Item
                children={<Trans i18nKey="students_flow.activate_account">activate account</Trans>}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<CheckCircleIcon />}
                  />
                }
                onClick={() => activateAccountHandler(original)}
              />
            ) : (
              <Dropdown.Item
                children={<Trans i18nKey="students_flow.deactivate_account">deactivate account</Trans>}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<XCircleIcon />}
                  />
                }
                onClick={() => deactivateAccountHandler(original)}
              />
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }
];

export default MembersCols;
