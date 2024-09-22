import React, { useContext } from "react";

import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";

import { CellProps } from "@/columns/index";
import { Price, useShareable } from "@/components";
import { AuthContext } from "@/contextes";
import { useConfirmableDelete, useReplicateAction } from "@/hooks";
import { useDeleteCourseMutation, useReplicateCourseMutation } from "@/store/slices/api/coursesSlice";
import { Course, User } from "@/types";
import { classNames, firstName, getStatusColor } from "@/utils";

import {
  DocumentDuplicateIcon,
  EyeIcon,
  PencilSquareIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Dropdown, Icon, Title, Typography } from "@msaaqcom/abjad";

interface CourseColumnsProps {
  sortables: Array<string>;
  columns: Array<string>;
}

const CoursesCols = ({ sortables = [], columns = [] }: CourseColumnsProps) =>
  [
    {
      Header: <Trans i18nKey="courses.course_title">Title</Trans>,
      id: "title",
      accessor: "title",
      disableSortBy: !sortables?.includes("title"),
      width: 250,
      Cell: ({ row: { original } }: CellProps<Course>) => (
        <Link
          href={`/courses/${original.id}`}
          className="flex flex-col"
        >
          <Typography.Paragraph
            as="span"
            size="md"
            weight="medium"
            children={original.title}
          />
          <div className="mt-4px flex flex-row">
            <Badge
              size="xs"
              variant={getStatusColor(original.status)}
              className="ml-2"
              soft
            >
              <Trans
                i18nKey={`statuses.${original.status}`}
                children={original.status}
              />
            </Badge>
            <Typography.Paragraph
              as="span"
              size="sm"
              weight="normal"
              className="text-gray-700"
              children={original.category?.name}
            />
          </div>
        </Link>
      )
    },
    {
      Header: <Trans i18nKey="common:price">Price</Trans>,
      id: "price",
      accessor: "price",
      disableSortBy: !sortables?.includes("price"),
      Cell: ({
        row: {
          original: { price }
        }
      }: CellProps<Course>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={<Price price={price} />}
        />
      )
    },
    {
      Header: <Trans i18nKey="common:earnings">earnings</Trans>,
      id: "earnings",
      accessor: "earnings",
      disableSortBy: !sortables?.includes("earnings"),
      Cell: ({
        row: {
          original: { earnings }
        }
      }: CellProps<Course>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={<Price price={earnings} />}
        />
      )
    },
    {
      Header: <Trans i18nKey="courses.instructors">Instructors</Trans>,
      id: "instructors",
      accessor: "instructors",
      disableSortBy: !sortables?.includes("instructors"),
      Cell: ({
        row: {
          original: { instructors }
        }
      }: CellProps<Course>) => {
        const { t } = useTranslation();
        return (
          <React.Fragment>
            <div className="flex items-center ltr:mr-2 rtl:ml-2">
              {instructors.map((instructor: User, index: number) => (
                <Avatar
                  key={index}
                  imageUrl={instructor.avatar?.url}
                  name={instructor.name}
                  className={classNames("border-2 border-white", index != 0 ? "-mr-2" : "")}
                />
              ))}
            </div>
            <Typography.Paragraph
              title={instructors.map((instructor: User) => instructor.name).join(`${t("comma")} `)}
              as="div"
            >
              {instructors.length > 1
                ? t("x_and_count_others", {
                    name: firstName(instructors[0].name),
                    count: instructors.length - 1
                  })
                : instructors.length == 1 && <Title title={instructors[0].name} />}
            </Typography.Paragraph>
          </React.Fragment>
        );
      }
    },
    {
      Header: <Trans i18nKey="courses.enrolled_students">Enrolled Students</Trans>,
      id: "enrollments_count",
      accessor: "enrollments_count",
      disableSortBy: !sortables?.includes("enrollments_count"),
      Cell: ({
        row: {
          original: { enrollments_count }
        }
      }: CellProps<Course>) => (
        <Typography.Paragraph
          as="span"
          size="md"
          weight="medium"
          children={enrollments_count}
        />
      )
    },
    {
      id: "actions",
      className: "justify-end",
      Cell: ({ row: { original } }: CellProps<Course>) => {
        const { t } = useTranslation();
        const { hasPermission } = useContext(AuthContext);
        const share = useShareable();
        const [confirmableDelete] = useConfirmableDelete({
          mutation: useDeleteCourseMutation
        });
        const [replicate] = useReplicateAction({
          mutation: useReplicateCourseMutation
        });

        return (
          <div className="flex flex-row">
            {hasPermission("courses.update") && (
              <Button
                as={Link}
                href={
                  original.type == "online" ? `/courses/${original.id}/chapters` : `/courses/${original.id}/details`
                }
                variant="default"
                size="sm"
                className="ml-2"
                children={<Trans i18nKey="edit">Edit</Trans>}
              />
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
                {hasPermission("courses.update") && (
                  <Dropdown.Item
                    as={Link}
                    href={`/courses/${original.id}/chapters`}
                    children={t("edit")}
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<PencilSquareIcon />}
                      />
                    }
                  />
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  children={t("courses.share")}
                  onClick={() => {
                    share([
                      {
                        label: t("courses.course_landing_page_url"),
                        url: original.url
                      },
                      {
                        label: t("courses.course_direct_checkout_url"),
                        url: original.checkout_url
                      }
                    ]);
                  }}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<ShareIcon />}
                    />
                  }
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  children={t("preview_as_student")}
                  as="a"
                  href={original.url}
                  target="_blank"
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
                  children={t("duplicate")}
                  onClick={() => {
                    replicate(original.id);
                  }}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<DocumentDuplicateIcon />}
                    />
                  }
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  as={Link}
                  href={`/courses/${original.id}/enrollments`}
                  children={t("courses.view_students")}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<UsersIcon />}
                    />
                  }
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  as={Link}
                  href={`/courses/${original.id}#reviews`}
                  children={t("show_reviews")}
                  iconAlign="end"
                  icon={
                    <Icon
                      size="sm"
                      children={<StarIcon />}
                    />
                  }
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  children={t("courses.delete_course")}
                  className="text-danger"
                  iconAlign="end"
                  onClick={() => {
                    confirmableDelete({
                      id: original.id,
                      title: t("courses.delete_course"),
                      label: t("courses.delete_course_confirm"),
                      children: t("courses.delete_course_confirm_message", { title: original.title })
                    });
                  }}
                  icon={
                    <Icon
                      size="sm"
                      children={<TrashIcon />}
                    />
                  }
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        );
      }
    }
  ]
    .filter((col) => {
      if (columns.length) {
        return columns.includes(col.id);
      }

      return true;
    })
    .sort((a, b) => {
      return columns.indexOf(a.id) - columns.indexOf(b.id);
    });

export default CoursesCols;
