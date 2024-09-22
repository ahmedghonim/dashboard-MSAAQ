import { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { AddonController, Card } from "@/components";
import { useAppDispatch, useConfirmableDelete } from "@/hooks";
import { fetchInstalledApps } from "@/store/slices/app-slice";
import { App } from "@/types";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

interface AppCardProps {
  app: App;
  actionText: string;
  cardActionClickHandler: () => void;
  appUninstallMutation: any;
}

const AppCard: FC<AppCardProps> = ({ app, cardActionClickHandler, appUninstallMutation, actionText }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [confirmableUninstallApp] = useConfirmableDelete({
    mutation: appUninstallMutation
  });
  const colors = {
    popular: {
      variant: "info",
      soft: true
    },
    featured: {
      variant: "purple",
      soft: true
    },
    soon: {
      variant: "default"
    },
    new: {
      variant: "primary"
    },
    installed: {
      variant: "success",
      soft: true
    }
  };

  return (
    <AddonController
      // @ts-ignore
      addon={`apps.${app.slug}`}
    >
      <Card className="h-full">
        <Card.Body className="flex flex-col gap-y-4">
          <div className="flex items-center justify-between">
            {app.icon && (
              <div className="pointer-events-none flex h-[45px] w-[45px] select-none overflow-hidden rounded-lg border border-gray-300 bg-white">
                <img
                  src={app.icon.url}
                  alt={app.title}
                  className="m-auto max-w-full"
                  width="100%"
                  height="100%"
                />
              </div>
            )}
            <div className="flex flex-row gap-x-2">
              {app.category !== "payment" && !app.installed && (
                <Badge
                  variant="default"
                  soft
                  rounded
                  size="sm"
                  children={t(`apps_marketplace.category.${app.category}`)}
                />
              )}
              {(app.installed || app.badge) && (
                <Badge
                  {...colors[app.installed ? "installed" : (app.badge as keyof typeof colors)]}
                  rounded
                  size="sm"
                  children={
                    app.installed ? t("apps_marketplace.badges.installed") : t(`apps_marketplace.badges.${app.badge}`)
                  }
                />
              )}
            </div>
          </div>
          <Typography.Paragraph
            as={"h3"}
            weight="medium"
            size="md"
            children={app.title}
          />
          <Typography.Paragraph
            className="text-gray-700"
            as={"div"}
            children={<div dangerouslySetInnerHTML={{ __html: app.description }} />}
          />
        </Card.Body>
        <Card.Actions className="justify-between">
          {!app.installed ? (
            <Button
              children={actionText}
              onClick={cardActionClickHandler}
            />
          ) : (
            <>
              {app.slug != "google-calendar" && (
                <Button
                  variant="default"
                  children={t("sidebar.settings.title")}
                  onClick={cardActionClickHandler}
                />
              )}
              <Dropdown>
                <Dropdown.Trigger>
                  <Button
                    variant="default"
                    icon={
                      <Icon
                        size="md"
                        children={<EllipsisHorizontalIcon />}
                      />
                    }
                  />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  {app.slug == "google-analytics" && (
                    <Dropdown.Item
                      children={t("apps_marketplace.edit_property_id")}
                      as={Link}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<PencilIcon />}
                        />
                      }
                      href={`/apps/${app.slug}`}
                    />
                  )}
                  <Dropdown.Item
                    children={t("apps_marketplace.uninstall")}
                    className="text-danger"
                    iconAlign="end"
                    icon={
                      <Icon
                        size="sm"
                        children={<TrashIcon />}
                      />
                    }
                    onClick={() => {
                      confirmableUninstallApp({
                        id: app.id,
                        okLabel: t("apps_marketplace.uninstall_app_confirm_button_title"),
                        title: t("apps_marketplace.uninstall_app_confirm_modal_title"),
                        children: t("apps_marketplace.uninstall_app_confirm_modal_description"),
                        callback: () => {
                          dispatch(fetchInstalledApps());
                        }
                      });
                    }}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </Card.Actions>
      </Card>
    </AddonController>
  );
};

export default AppCard;
