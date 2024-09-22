import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

const ArticlesIndexTabs: FC<any> = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/blog")}
        href="/blog"
        children={t("articles.articles")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/blog/categories")}
        href="blog/categories"
        children={t("categories.title")}
      />
    </Tabs>
  );
};

export default ArticlesIndexTabs;
