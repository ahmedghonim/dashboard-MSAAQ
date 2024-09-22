import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const StudentsTabs = () => {
  const { isActive } = useIsRouteActive();
  const router = useRouter();
  const { t } = useTranslation();
  const { memberId } = router.query;

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/students/[memberId]")}
        href={{
          pathname: "/students/[memberId]",
          query: { memberId }
        }}
        children={t("students_flow.tabs.student_information")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/students/[memberId]/courses")}
        href={{
          pathname: "/students/[memberId]/courses",
          query: { memberId }
        }}
        children={t("courses.title")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/students/[memberId]/products")}
        href={{
          pathname: "/students/[memberId]/products",
          query: { memberId }
        }}
        children={t("students_flow.tabs.products")}
      />

      <Tabs.Link
        as={Link}
        active={isActive("/students/[memberId]/orders")}
        href={{
          pathname: "/students/[memberId]/orders",
          query: { memberId }
        }}
        children={t("students_flow.tabs.orders")}
      />
    </Tabs>
  );
};

export default StudentsTabs;
