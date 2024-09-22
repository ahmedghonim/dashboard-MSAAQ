import { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const Taps: FC<any> = ({ preview_url, type }: { preview_url: string; type: "online" | "on_site" }) => {
  const { isActive } = useIsRouteActive();
  const router = useRouter();
  const { t } = useTranslation();
  const { courseId } = router.query;

  return (
    <Tabs preview_url={preview_url}>
      {type == "online" ? (
        <Tabs.Link
          as={Link}
          active={isActive("/courses/[courseId]/chapters")}
          href={{
            pathname: "/courses/[courseId]/chapters",
            query: { courseId }
          }}
          children={t("courses.taps.course_content")}
        />
      ) : (
        <Tabs.Link
          as={Link}
          active={isActive("/courses/[courseId]/details")}
          href={{
            pathname: "/courses/[courseId]/details",
            query: { courseId }
          }}
          children={t("courses.taps.course_details")}
        />
      )}
      <Tabs.Link
        as={Link}
        active={isActive("/courses/[courseId]/settings")}
        href={{
          pathname: "/courses/[courseId]/settings",
          query: { courseId }
        }}
        children={t("courses.taps.course_settings")}
      />
      {type == "online" && (
        <Tabs.Link
          as={Link}
          active={isActive("/courses/[courseId]/drip-content")}
          href={{
            pathname: "/courses/[courseId]/drip-content",
            query: { courseId }
          }}
          children={t("courses.taps.drip_content")}
        />
      )}
      <Tabs.Link
        as={Link}
        active={isActive("/courses/[courseId]/pricing")}
        href={{
          pathname: "/courses/[courseId]/pricing",
          query: { courseId }
        }}
        children={t("courses.taps.pricing")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/courses/[courseId]/students-management")}
        href={{
          pathname: "/courses/[courseId]/students-management",
          query: { courseId }
        }}
        children={t("courses.taps.students_management")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/courses/[courseId]/publishing")}
        href={{
          pathname: "/courses/[courseId]/publishing",
          query: { courseId }
        }}
        children={t("courses.taps.publishing")}
      />
    </Tabs>
  );
};

export default Taps;
