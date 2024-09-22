import React, { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const ArticlesTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const router = useRouter();
  const { t } = useTranslation();
  const { articleId } = router.query;

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/blog/[articleId]/edit")}
        href={{
          pathname: "/blog/[articleId]/edit",
          query: { articleId }
        }}
        children={t("articles.tabs.article_content")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/blog/[articleId]/settings")}
        href={{
          pathname: "/blog/[articleId]/settings",
          query: { articleId }
        }}
        children={t("articles.tabs.article_settings")}
      />
    </Tabs>
  );
};

export default ArticlesTabs;
