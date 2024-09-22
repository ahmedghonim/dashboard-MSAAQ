import { FC, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Card } from "@/components";
import { useAppDispatch, useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useInstallAppMutation } from "@/store/slices/api/appsSlice";
import { fetchInstalledApps } from "@/store/slices/app-slice";
import { APIActionResponse, App } from "@/types";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Form, Icon, Typography } from "@msaaqcom/abjad";

import { Select } from "../select";

interface AppCardProps {
  app: App;
  actionText: string;
  cardActionClickHandler: () => void;
  appUninstallMutation: any;
  properties?: any;
  refetch?: any;
}

const InstalledAppCard: FC<AppCardProps> = ({
  app,
  cardActionClickHandler,
  appUninstallMutation,
  actionText,
  properties = [],
  refetch
}) => {
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

  const schema = yup
    .object({
      property_id: yup.object().required()
    })
    .required();

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset
  } = useForm<{
    property_id: { value: string; label: string };
  }>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [installAppMutation] = useInstallAppMutation();

  const onSubmit: SubmitHandler<{
    property_id: { value: string; label: string };
  }> = async (data) => {
    if (isSubmitting || !app || !isValid) return;

    if (app.slug != "google-analytics" && app.install_way === "external") {
      window.open(app.install_url, "_blank");
      return;
    }

    const installed = (await installAppMutation({
      id: app.id,
      ...Object.entries(data).reduce<{ [key: string]: any }>((acc, [key, value]) => {
        if (value && typeof value === "object") {
          acc[key] = (value as any).value;
        } else {
          acc[key] = value;
        }
        if (app) {
          acc["tracking_id"] = app?.fields?.find((field) => field.name === "tracking_id")?.value;
        }
        return acc;
      }, {})
    })) as APIActionResponse<App>;

    if (displayErrors(installed)) return;

    if (app.slug == "google-analytics") {
      dispatch(apiSlice.util.invalidateTags(["apps.index"]));
    }
    dispatch(fetchInstalledApps());

    displaySuccess(installed);
  };

  useEffect(() => {
    if (app && app.slug == "google-analytics" && properties) {
      let property = properties?.data?.find(
        (property: any) => property.property == app?.fields?.find((field) => field.name === "property_id")?.value
      );
      let appFieldValue = app?.fields?.find((field) => field.name === "property_id");
      if ((appFieldValue && appFieldValue.value) || property) {
        reset({
          property_id: {
            value: property ? property.value : appFieldValue?.value,
            label: property ? `${property.displayName} - ${property.property}` : `${appFieldValue?.value}`
          }
        });
      }
    }
  }, [app, properties]);

  return (
    <AddonController
      // @ts-ignore
      addon={`apps.${app.slug}`}
    >
      <Card className="h-full">
        <Card.Body className="flex flex-col gap-y-4">
          {app.installed && (
            <div className="flex items-center gap-2">
              <Image
                src={"/images/check-success.gif"}
                alt={"check-success"}
                width={80}
                height={80}
              />
              <Typography.Paragraph
                size="lg"
                className="text-success"
                weight="bold"
                children={
                  app.slug == "google-analytics"
                    ? t("apps_marketplace.add_property_id")
                    : t("apps_marketplace.app_installed_successfully")
                }
              />
            </div>
          )}

          {app.installed && app.slug == "google-analytics" && (
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className=""
            >
              <Typography.Paragraph
                children={t("apps_marketplace.property_id_description")}
                size="md"
                weight="bold"
                className="mb-4"
              />
              <Form.Group
                className="!mb-4"
                required
                label={t("apps_marketplace.property_id_label")}
                errors={errors?.property_id?.message}
              >
                <Controller
                  control={control}
                  name="property_id"
                  render={({ field }) => (
                    <Select
                      options={properties?.data?.map((property: any) => {
                        return {
                          label: `${property.displayName} - ${property.property}`,
                          value: property.property
                        };
                      })}
                      {...field}
                      placeholder={t("apps_marketplace.property_id_label")}
                    />
                  )}
                />
              </Form.Group>
              {properties.error && (
                <div className="flex items-center gap-3">
                  <Typography.Paragraph children={t("apps_marketplace.sync_failed")} />
                  <Button
                    className="w-fit"
                    target="_blank"
                    size="sm"
                    as={Link}
                    href={app.install_url}
                    children={t("apps_marketplace.sync")}
                  />
                </div>
              )}
            </Form>
          )}
          <div className="rounded-lg bg-gray-100 p-4">
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
          </div>
        </Card.Body>
        <Card.Actions className="justify-between">
          {!app.installed ? (
            <Button
              children={actionText}
              onClick={cardActionClickHandler}
            />
          ) : (
            <>
              {app.slug == "google-analytics" ? (
                <Button
                  variant="primary"
                  children={t("apps_marketplace.save")}
                  disabled={isSubmitting || !isValid}
                  onClick={handleSubmit(onSubmit)}
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
                </>
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
                      as={"button"}
                      children={t("apps_marketplace.edit_tracking_id")}
                      onClick={cardActionClickHandler}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<PencilIcon />}
                        />
                      }
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
                        callback: async () => {
                          if (refetch) {
                            await refetch();
                            dispatch(fetchInstalledApps());
                          }
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

export default InstalledAppCard;
