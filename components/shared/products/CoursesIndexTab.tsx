import { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

import { Badge } from "@msaaqcom/abjad";

const CoursesIndexTab: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/courses")}
        href={{
          pathname: "/courses"
        }}
        children={t("courses.tabs.online_courses")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/courses/on-site")}
        href={{
          pathname: "/courses/on-site"
        }}
        children={
          <span className="flex gap-2">
            {t("courses.tabs.onsite_courses")}
            <Badge
              variant="success"
              size="xs"
              rounded
              children={t("new")}
            />
          </span>
        }
      />
    </Tabs>
  );
};

export default CoursesIndexTab;
