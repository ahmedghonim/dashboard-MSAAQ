import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const StudentNotificationsTabs: FC = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/students/notifications")}
        href={{
          pathname: "/students/notifications"
        }}
        children={t("the_student")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/students/notifications/academy")}
        href={{
          pathname: "/students/notifications/academy"
        }}
        children={t("the_academy")}
      />
    </Tabs>
  );
};

export default StudentNotificationsTabs;
