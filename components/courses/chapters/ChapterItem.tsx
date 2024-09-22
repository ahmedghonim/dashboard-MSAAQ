import React, { FC, useMemo } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { DraggableSyntheticListeners } from "@dnd-kit/core";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";

import { DragIcon } from "@/components/Icons/solid";
import MeetingMeta from "@/components/courses/meeting-meta";
import dayjs from "@/lib/dayjs";
import { Chapter, Content } from "@/types";
import { classNames, stripHtmlTags, truncateString } from "@/utils";

import {
  Bars3BottomRightIcon,
  CalendarIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  GlobeAltIcon,
  ListBulletIcon,
  LockClosedIcon,
  MicrophoneIcon,
  PencilSquareIcon,
  TrashIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";

import { Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export interface ChapterContentProps {
  dragOverlay?: boolean;
  dragging?: boolean;
  handleProps?: any;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  data: Content<any> & { parent: Chapter };
  handle?: boolean;
  isDragging?: boolean;
  isSorting?: boolean;

  onRemove?(chapter: Content<any>): void;

  onDuplicate?(chapter: Content<any>): void;

  readOnly?: boolean;
}

const ChapterItem: FC<ChapterContentProps> = ({
  dragOverlay,
  dragging,
  handleProps,
  listeners,
  onRemove,
  onDuplicate,
  sorting,
  data,
  readOnly,
  handle,
  isDragging,
  isSorting,
  ...props
}: ChapterContentProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { courseId }
  } = useRouter();

  const contentIcons = useMemo<any>(
    () => ({
      video: <VideoCameraIcon />,
      pdf: <DocumentTextIcon />,
      audio: <MicrophoneIcon />,
      meeting: <CalendarIcon />,
      text: <Bars3BottomRightIcon />,
      quiz: <DocumentCheckIcon />,
      assignment: <DocumentDuplicateIcon />,
      poll: <ListBulletIcon />
    }),
    []
  );

  const ContentDescription = () => {
    if (data.type == "meeting") {
      return <MeetingMeta content={data} />;
    }

    return (
      (data.meta?.content ?? data.summary) && (
        <Typography.Paragraph
          size="md"
          weight="normal"
          className="text-gray-700"
          children={truncateString(stripHtmlTags(data.meta?.content ?? data.summary ?? ""), 55)}
        />
      )
    );
  };

  return (
    <div
      onClick={() => {
        router.push({
          pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/${data.type}/${
            data.type == "quiz" ? "builder" : "edit"
          }`,
          query: { courseId: courseId, chapterId: data.parent.id, contentId: data.id }
        });
      }}
      style={{
        backgroundImage: dragOverlay
          ? "repeating-linear-gradient(0deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 15px, #A9B9B6 15px), repeating-linear-gradient(90deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 15px, #A9B9B6 15px), repeating-linear-gradient(180deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 15px, #A9B9B6 15px), repeating-linear-gradient(270deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 15px, #A9B9B6 15px)"
          : undefined,
        backgroundSize: dragOverlay ? "1px 100%, 100% 1px, 1px 100% , 100% 1px" : undefined,
        backgroundPosition: dragOverlay ? "0 0, 0 0, 100% 0, 0 100%" : undefined,
        backgroundRepeat: dragOverlay ? "no-repeat" : undefined
      }}
      className={classNames(
        "flex cursor-pointer flex-row items-center rounded-lg bg-white px-2 py-2.5 transition-all duration-300 ease-in-out hover:bg-black/5",
        dragOverlay ? "-rotate-1" : "rotate-0"
      )}
    >
      {!readOnly && (
        <Button
          variant="default"
          className="ml-4"
          size="sm"
          ghost
          icon={
            <Icon className="text-gray-900">
              <DragIcon />
            </Icon>
          }
          {...handleProps}
        />
      )}
      <div className="rounded-full bg-primary-50 p-2.5">
        <Icon className="text-primary-800">{contentIcons[data.type ?? "pdf"] || <DocumentTextIcon />}</Icon>
      </div>
      <Icon
        size="sm"
        className="mx-4 text-gray-950"
      >
        {data.premium ? <LockClosedIcon /> : <GlobeAltIcon />}
      </Icon>

      <div className="flex flex-col">
        <Typography.Paragraph
          size="lg"
          weight="medium"
          className="mb-1"
          children={data.title}
        />

        <ContentDescription />
      </div>

      <div className="mr-auto">
        {!readOnly && (
          <Dropdown>
            <Dropdown.Trigger>
              <Button
                variant="default"
                size="md"
                ghost
                icon={
                  <Icon size="md">
                    <EllipsisHorizontalIcon />
                  </Icon>
                }
              />
            </Dropdown.Trigger>
            <Dropdown.Menu
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Dropdown.Item
                children={t("edit")}
                iconAlign="end"
                icon={
                  <Icon size="sm">
                    <PencilSquareIcon />
                  </Icon>
                }
                as={Link}
                // @ts-ignore
                href={{
                  pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/${data.type}/${
                    data.type == "quiz" ? "builder" : "edit"
                  }`,
                  query: { courseId: courseId, chapterId: data.parent.id, contentId: data.id }
                }}
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("duplicate")}
                iconAlign="end"
                icon={
                  <Icon size="sm">
                    <DocumentDuplicateIcon />
                  </Icon>
                }
                onClick={() => {
                  onDuplicate?.(data);
                }}
              />
              <Dropdown.Divider />
              <Dropdown.Item
                children={t("contents.delete_content")}
                className="text-danger"
                iconAlign="end"
                icon={
                  <Icon
                    className="text-danger"
                    size="sm"
                  >
                    <TrashIcon />
                  </Icon>
                }
                onClick={() => {
                  onRemove?.(data);
                }}
              />
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default ChapterItem;
