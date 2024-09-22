import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Tabs } from "@/components";
import { useIsRouteActive } from "@/hooks";

import { Badge } from "@msaaqcom/abjad";

const SettingsTabs: FC = () => {
  const { isActive } = useIsRouteActive();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Link
        as={Link}
        active={isActive("/settings")}
        href={{
          pathname: "/settings"
        }}
        children={t("academy_settings.general_settings.title")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/forms")}
        href={{
          pathname: "/settings/forms"
        }}
        children={
          <div className="flex gap-[6px]">
            {t("academy_settings.forms.title")}
            <Badge
              variant="success"
              rounded
              size="sm"
              children={t("new")}
            />
          </div>
        }
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/translations")}
        href={{
          pathname: "/settings/translations"
        }}
        children={t("academy_settings.translations.title")}
      />
      <Tabs.Link
        as={Link}
        active={isActive("/settings/code-snippets")}
        href={{
          pathname: "/settings/code-snippets"
        }}
        children={t("academy_settings.code_snippets.title")}
      />
    </Tabs>
  );
};

export default SettingsTabs;
