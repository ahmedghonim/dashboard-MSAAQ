import React from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { AssignmentMember, AssignmentMemberStatus } from "@/types";
import { getStatusColor } from "@/utils";

import { ArrowDownTrayIcon, DocumentCheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface AssignmentMembersColsProps {
  sortables: Array<string>;
}

const AssignmentMembersCols = ({ sortables = [] }: AssignmentMembersColsProps) => [
  {
    Header: <Trans i18nKey="assignments.assignment_title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: true,
    Cell: ({
      row: {
        original: {
          assignment: { title }
        }
      }
    }: CellProps<AssignmentMember>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={title}
      />
    )
  },
  {
    Header: <Trans i18nKey="students_flow.student_name">student name</Trans>,
    id: "member",
    accessor: "member",
    disableSortBy: !sortables?.includes("member"),
    width: 250,
    Cell: ({ row: { original } }: CellProps<AssignmentMember>) => <UserAvatar user={original.member} />
  },
  {
    Header: <Trans i18nKey="courses.course_title">course title</Trans>,
    id: "course",
    accessor: "course",
    disableSortBy: true,
    width: 180,
    Cell: ({ row: { original } }: CellProps<AssignmentMember>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.course?.title ?? "-"}
      />
    )
  },
  {
    Header: <Trans i18nKey="assignments.submitted_at">submitted at</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({
      row: {
        original: { created_at }
      }
    }: CellProps<AssignmentMember>) => (
      <Typography.Paragraph
        as="span"
        size="sm"
        weight="medium"
        className="text-gray-800"
        children={
          <Time
            date={created_at}
            format={"D MMM YYYY, h:mm a"}
          />
        }
      />
    )
  },
  {
    Header: <Trans i18nKey="status">status</Trans>,
    id: "status",
    accessor: "status",
    disableSortBy: !sortables?.includes("status"),
    Cell: ({
      row: {
        original: { status }
      }
    }: CellProps<AssignmentMember>) => (
      <Badge
        size="sm"
        variant={getStatusColor(status)}
        children={<Trans i18nKey={`assignments.statuses.${status}`} />}
        rounded
        soft
      />
    )
  },
  {
    id: "actions",
    className: "justify-end",
    width: 180,
    Cell: ({ row: { original } }: CellProps<AssignmentMember>) => {
      const { t } = useTranslation();
      return (
        <div className="flex flex-row">
          <Button
            as={Link}
            href={`/students/assignments/${original.id}`}
            variant={original.status === AssignmentMemberStatus.PROCESSING ? "primary" : "default"}
            size="sm"
            className="ml-2"
            children={
              <Trans
                i18nKey={
                  original.status === AssignmentMemberStatus.PROCESSING ? "assignments.review_assignment" : "view"
                }
              >
                assignment review
              </Trans>
            }
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
                href={`/students/assignments/${original.id}`}
                children={t("assignments.view_assignment")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<DocumentCheckIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("assignments.download_assignment")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<ArrowDownTrayIcon />}
                  />
                }
              />
              {original.course && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    as={Link}
                    href={`/courses/${original.course.id}/settings`}
                    children={t("courses.edit_course")}
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<PencilSquareIcon />}
                      />
                    }
                  />
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default AssignmentMembersCols;
