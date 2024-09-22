import React from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { classNames } from "@/utils";

import { Badge, Button, Icon } from "@msaaqcom/abjad";

const ContentButton = ({
  pathname,
  soon,
  newBadge,
  text,
  icon,
  chapterId,
  courseId,
  sort,
  className
}: {
  className?: string;
  icon: React.ReactNode;
  pathname: string | null;
  sort: number | string;
  text: string;
  soon?: boolean;
  newBadge?: boolean;
  courseId: any;
  chapterId: any;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      as={pathname ? Link : "button"}
      variant="default"
      size="md"
      outline
      ghost
      icon={<Icon size="sm">{icon}</Icon>}
      className={classNames(className, soon ? "relative cursor-default" : "", "w-full", newBadge ? "relative" : "")}
      {...(pathname
        ? {
            href: {
              pathname: pathname,
              query: { courseId: courseId, chapterId: chapterId, sort: sort }
            }
          }
        : {})}
    >
      {text}
      {soon && (
        <Badge
          variant="default"
          rounded
          size="sm"
          className="absolute left-[24px] top-[-8px]"
        >
          {t("soon")}
        </Badge>
      )}
      {newBadge && (
        <Badge
          variant="success"
          rounded
          size="sm"
          className="absolute left-[24px] top-[-8px]"
        >
          {t("new")}
        </Badge>
      )}
    </Button>
  );
};

export default ContentButton;
