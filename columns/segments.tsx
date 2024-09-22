import React from "react";

import { Trans, useTranslation } from "next-i18next";
import { ErrorBoundary } from "react-error-boundary";

import { CellProps } from "@/columns/index";
import { Time } from "@/components";
import { useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Segment, SegmentConditionOperatorType, SegmentConditionType } from "@/types";

import { PencilSquareIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export interface SegmentsColumnsProps {
  editSegmentHandler: (segment: Segment) => void;
  exportSegmentHandler: (segment: Segment) => Promise<void>;
  deleteSegmentHandler: (segment: Segment) => Promise<void>;
  sortables: Array<string>;
}

const SegmentsCols = ({
  sortables = [],
  editSegmentHandler,
  exportSegmentHandler,
  deleteSegmentHandler
}: SegmentsColumnsProps) => [
  {
    Header: <Trans i18nKey="students_flow.segments.segment">segment</Trans>,
    id: "segment",
    accessor: "segment",
    disableSortBy: true,
    Cell: ({ row: { original } }: CellProps<Segment>) => (
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-black p-2">
          <Icon className="h-6 w-6 text-white">
            <ErrorBoundary fallback={<XCircleIcon className="h-6 w-6 text-white" />}>
              {React.createElement(require("@heroicons/react/24/solid")[original.icon])}
            </ErrorBoundary>
          </Icon>
        </div>
        <Typography.Paragraph
          as="span"
          size="lg"
          weight="medium"
        >
          {original.name}
        </Typography.Paragraph>
      </div>
    )
  },
  {
    Header: <Trans i18nKey="created_at">joined at</Trans>,
    id: "created_at",
    accessor: "created_at",
    disableSortBy: !sortables?.includes("created_at"),
    width: 100,
    Cell: ({
      row: {
        original: { created_at }
      }
    }: CellProps<Segment>) => (
      <Time
        date={created_at}
        format={"D MMMM YYYY"}
      />
    )
  },
  {
    Header: <Trans i18nKey="analytics.visits.users">users</Trans>,
    id: "members_count",
    accessor: "members_count",
    disableSortBy: true,
    width: 100,
    Cell: ({
      row: {
        original: { members_count }
      }
    }: CellProps<Segment>) => (
      <Typography.Paragraph
        as="span"
        size="md"
        weight="medium"
        children={members_count}
      />
    )
  },
  {
    Header: <Trans i18nKey="students_flow.segments.segment_condition">شروط المجموعة</Trans>,
    id: "conditions",
    accessor: "conditions",
    disableSortBy: true,
    width: 250,
    Cell: ({
      row: {
        original: { conditions }
      }
    }: CellProps<Segment>) => {
      const { t } = useTranslation();
      const { formatPrice } = useFormatPrice();
      return (
        <div className="flex flex-wrap gap-1">
          {conditions.map((condition, index) => {
            return (
              <Badge
                size="sm"
                soft
                rounded
                variant="success"
                key={index}
              >
                {[
                  t(`students_flow.segments.condition_type_${condition.type}`),
                  condition.type === SegmentConditionType.GENDER
                    ? ""
                    : t(`students_flow.segments.condition_operator_${condition.operator}`),
                  ...(condition.operator === SegmentConditionOperatorType.BETWEEN
                    ? condition.type === SegmentConditionType.TOTAL_ORDERS ||
                      condition.type === SegmentConditionType.TOTAL_PURCHASES
                      ? condition.type === SegmentConditionType.TOTAL_ORDERS
                        ? [condition.min_value as number, "-", condition.max_value as number]
                        : [formatPrice(condition.min_value as number), "-", formatPrice(condition.max_value as number)]
                      : [
                          dayjs(condition.min_value).format("DD/MM/YYYY"),
                          "-",
                          dayjs(condition.max_value).format("DD/MM/YYYY")
                        ]
                    : condition.type === SegmentConditionType.TOTAL_ORDERS ||
                      condition.type === SegmentConditionType.TOTAL_PURCHASES
                    ? condition.type === SegmentConditionType.TOTAL_ORDERS
                      ? [condition.value as number]
                      : [formatPrice(condition.value as number)]
                    : condition.type === SegmentConditionType.GENDER
                    ? [t(condition.value as string)]
                    : [dayjs(condition.value).format("DD/MM/YYYY")])
                ].join(" ")}
              </Badge>
            );
          })}
        </div>
      );
    }
  },
  {
    id: "actions",
    className: "justify-end",
    width: 100,
    Cell: ({ row: { original } }: CellProps<Segment>) => {
      const { t } = useTranslation();
      return (
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
              children={t("students_flow.segments.edit_segment")}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<PencilSquareIcon />}
                />
              }
              onClick={() => editSegmentHandler(original)}
            />
            <Dropdown.Divider />
            <Dropdown.Item
              children={t("students_flow.segments.export_segment")}
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<ArrowDownTrayIcon />}
                />
              }
              onClick={() => exportSegmentHandler(original)}
            />
            <Dropdown.Divider />
            <Dropdown.Item
              children={t("students_flow.segments.delete_segment")}
              className="text-danger"
              iconAlign="end"
              icon={
                <Icon
                  size="sm"
                  children={<TrashIcon />}
                />
              }
              onClick={() => deleteSegmentHandler(original)}
            />
          </Dropdown.Menu>
        </Dropdown>
      );
    }
  }
];

export default SegmentsCols;
