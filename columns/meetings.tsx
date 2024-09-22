import React from "react";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import MeetingMeta from "@/components/courses/meeting-meta";
import { useCopyToClipboard } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Content, Meeting } from "@/types";
import { getStatusColor } from "@/utils";

import { ArrowTopRightOnSquareIcon, LinkIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

const MeetingsCols = [
  {
    Header: <Trans i18nKey="contents.meeting.title">Title</Trans>,
    id: "title",
    accessor: "title",
    disableSortBy: true,
    width: 200,
    Cell: ({ row: { original } }: CellProps<Content<Meeting>>) => {
      return (
        <div>
          <Typography.Paragraph
            weight="medium"
            className="mb-1"
            children={original.title}
          />

          <MeetingMeta
            content={original}
            size="sm"
          />
        </div>
      );
    }
  },
  {
    Header: <Trans i18nKey="contents.meeting.status">Status</Trans>,
    id: "meta.status",
    accessor: "meta.status",
    disableSortBy: true,
    width: 80,
    Cell: ({ row: { original } }: CellProps<Content<Meeting>>) => {
      const { meta } = original;

      return (
        <Badge
          size="sm"
          variant={getStatusColor(meta.meeting_status)}
          children={<Trans i18nKey={`contents.meeting.statuses.${meta.meeting_status}`} />}
          rounded
          soft
        />
      );
    }
  },
  {
    id: "actions",
    className: "justify-end",
    Cell: ({ row: { original } }: CellProps<Content<Meeting>>) => {
      const { t } = useTranslation();
      const [copy] = useCopyToClipboard();
      const startAt = dayjs(original.meta.start_at).tz(original.meta.timezone);

      return (
        <div className="flex flex-row">
          {original.meta.meeting_status == "upcoming" && (
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  as="a"
                  href={original?.meta.start_url}
                  target="_blank"
                  size="sm"
                  disabled={!startAt.isToday()}
                  className={`ml-2 ${!startAt.isToday() ? "pointer-events-none" : ""}`}
                  children={t("courses.alerts.zoom.start_meeting")}
                />
              </Tooltip.Trigger>
              {!startAt.isToday() && <Tooltip.Content children={t("contents.meeting.start_at_meeting_data_tooltip")} />}
            </Tooltip>
          )}

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
                as="a"
                href={original.meta.join_url}
                target="_blank"
                children={t("courses.alerts.zoom.open_in_zoom")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<ArrowTopRightOnSquareIcon />}
                  />
                }
              />
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => copy(original.meta.join_url)}
                href="#!"
                children={t("courses.alerts.zoom.copy_meeting_link")}
                iconAlign="end"
                icon={
                  <Icon
                    size="sm"
                    children={<LinkIcon />}
                  />
                }
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    }
  }
];

export default MeetingsCols;
