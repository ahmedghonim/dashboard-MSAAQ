import React from "react";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Time, UserAvatar } from "@/components";
import { Course, Enrollment } from "@/types";
import { classNames } from "@/utils";

import { CheckCircleIcon, EyeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export interface EnrollmentColumnsProps {
  sortables: Array<string>;
  giveCertificateHandler: (enrollment: Enrollment) => void;
  cancelCertificateHandler: (enrollment: Enrollment) => Promise<void>;
  showRowActions?: boolean;
}

const EnrollmentCols = ({
  sortables = [],
  giveCertificateHandler,
  cancelCertificateHandler,
  showRowActions
}: EnrollmentColumnsProps) => [
  {
    Header: <Trans i18nKey="the_student">student</Trans>,
    id: "member",
    accessor: "member",
    disableSortBy: true,
    width: 250,
    Cell: ({
      row: {
        original: { member }
      }
    }: any) => {
      return <UserAvatar user={member} />;
    }
  },
  {
    Header: <Trans i18nKey="courses.enrollment_date">enrollment_date</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={<Time date={original.created_at} />}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.quizzes_score">quizzes_score</Trans>,
    id: "quizzes_score",
    accessor: "quizzes_score",
    disableSortBy: !sortables?.includes("quizzes_score"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.quizzes_score ? `${original.quizzes_score}%` : "—"}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.meetings_attendance_percentage">meetings_attendance_percentage</Trans>,
    id: "meetings_attendance_percentage",
    accessor: "meetings_attendance_percentage",
    width: 200,

    disableSortBy: !sortables?.includes("meetings_attendance_percentage"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.meetings_attendance_percentage ? `${original.meetings_attendance_percentage}%` : "—"}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.meetings_attendance_duration">meetings_attendance_duration</Trans>,
    id: "meetings_attendance_duration",
    accessor: "meetings_attendance_duration",
    width: 200,
    disableSortBy: !sortables?.includes("meetings_attendance_duration"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.meetings_attendance_duration ? `${original.meetings_attendance_duration} دقيقة` : "—"}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.started_at">started_at</Trans>,
    id: "started_at",
    accessor: "started_at",
    disableSortBy: !sortables?.includes("started_at"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.started_at ? <Time date={original.started_at} /> : "—"}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.completed_at">completed_at</Trans>,
    id: "completed_at",
    accessor: "completed_at",
    disableSortBy: !sortables?.includes("completed_at"),
    Cell: ({ row: { original } }: CellProps<Course>) => (
      <Typography.Paragraph
        as="span"
        weight="medium"
        children={original.completed_at ? <Time date={original.completed_at} /> : "—"}
      />
    )
  },
  {
    Header: <Trans i18nKey="courses.progress_rate">progress</Trans>,
    id: "percentage_completed",
    accessor: "percentage_completed",
    disableSortBy: !sortables?.includes("percentage_completed"),
    Cell: ({
      row: {
        original: { percentage_completed }
      }
    }: any) => {
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
        >
          {percentage_completed ? `${percentage_completed}%` : "—"}
        </Typography.Paragraph>
      );
    }
  },
  {
    Header: <Trans i18nKey="courses.watched_contents"></Trans>,
    id: "contents_count",
    accessor: "contents_count",
    disableSortBy: !sortables?.includes("contents_count"),
    Cell: ({
      row: {
        original: { contents_count }
      }
    }: any) => {
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
        >
          {contents_count ? (
            <Trans
              i18nKey="courses.chapters.contents"
              values={{
                count: contents_count
              }}
            />
          ) : (
            "—"
          )}
        </Typography.Paragraph>
      );
    }
  },
  {
    Header: <Trans i18nKey="courses.certified">certified</Trans>,
    id: "has_certification",
    accessor: "has_certification",
    disableSortBy: true,
    Cell: ({
      row: {
        original: { has_certification }
      }
    }: any) => {
      return (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          className={classNames(has_certification && "text-info")}
        >
          {has_certification ? <Trans i18nKey="yes" /> : <Trans i18nKey="no" />}
        </Typography.Paragraph>
      );
    }
  },
  ...(showRowActions
    ? [
        {
          id: "actions",
          className: "justify-end",
          //@ts-ignore
          Cell: ({ row: { original } }: Enrollment) => {
            const { t } = useTranslation();

            return (
              <div className="flex flex-row">
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
                    {original.has_certification ? (
                      <>
                        <Dropdown.Item
                          as="a"
                          href={original.certificate.path}
                          target="_blank"
                          children={t("certificates.preview_certificate")}
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
                          onClick={() => cancelCertificateHandler(original)}
                          children={t("certificates.cancel_certificate")}
                          iconAlign="end"
                          icon={
                            <Icon
                              size="sm"
                              children={<XCircleIcon />}
                            />
                          }
                        />
                      </>
                    ) : (
                      <Dropdown.Item
                        onClick={() => giveCertificateHandler(original)}
                        children={t("certificates.issue_certificate")}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<CheckCircleIcon />}
                          />
                        }
                      />
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            );
          }
        }
      ]
    : [])
];

export default EnrollmentCols;
