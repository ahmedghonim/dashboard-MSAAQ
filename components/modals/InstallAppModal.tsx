import React, { FC, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosResponse } from "axios";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, HelpdeskLink } from "@/components";
import { Select } from "@/components/select";
import { GTM_EVENTS, useAppDispatch, useCopyToClipboard, useGTM, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import { fetchInstalledApps } from "@/store/slices/app-slice";
import { APIActionResponse, App, Field as FieldType } from "@/types";
import { classNames } from "@/utils";

import { DocumentCheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

import { Alert, Badge, Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface InstallAppModalProps extends ModalProps {
  app: App | null;
  titleI18Key: string;
  actionText: string;
  instructionsText: string;
  appInstallMutation: any;
  refetch?: () => void;
}

interface FieldProps extends Omit<FieldType, "fields" | "items" | "tooltip"> {
  className: string;
  control: any;
  errors: any;
  getValues: any;
  setError: any;
  watch: any;
  copy: (value: string) => void;
  copiedValues: any;
}

const loadSelectOptions = async (ajax: FieldType["ajax"], params: object = {}) => {
  if (!ajax) return Promise.resolve([]);
  return await axios({
    method: ajax.method,
    url: `/${ajax.url}`,
    params: {
      ...params
    }
  }).then((res: AxiosResponse) => {
    return res.data.data.map((item: any) => ({
      label: item.name,
      value: item.id
    }));
  });
};
const Field: FC<FieldProps> = ({
  type,
  based_on,
  copy,
  copiedValues,
  validation,
  copiable,
  label,
  className,
  required,
  help,
  getValues,
  watch,
  setError,
  ajax,
  ...props
}) => {
  switch (type) {
    case "select":
      const params = based_on?.reduce((acc: any, curr) => {
        if (watch(curr)) {
          acc[curr] = watch(curr);
        }
        return acc;
      }, {});

      return (
        <Form.Group
          label={label}
          help={help}
          required={required}
          className={className}
          errors={props.errors[props.name]?.message}
        >
          <Controller
            render={({ field }) => (
              <Select
                key={watch(based_on)}
                required={required}
                disabled={based_on?.some((item) => !getValues(item)) || props.readonly}
                loadOptions={(inputValue, callback) => {
                  if (!ajax || !params) {
                    callback([]);
                    return;
                  }

                  loadSelectOptions(ajax, params)
                    .then((data) => {
                      callback(data);
                    })
                    .catch((err) => {
                      Object.keys(params).forEach((key) => {
                        setError(key, {
                          type: "manual",
                          message: err.response?.data?.message || "Something went wrong"
                        });
                      });
                      callback([]);
                    });
                }}
                {...props}
                {...field}
              />
            )}
            name={props.name}
            control={props.control}
            defaultValue={props.value}
          />
        </Form.Group>
      );
    case "text":
      return (
        <Form.Group
          label={label}
          help={help}
          required={required}
          className={className}
          errors={props.errors[props.name]?.message}
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                required={required}
                disabled={props.readonly}
                readOnly={props.readonly}
                append={
                  copiable ? (
                    <Button
                      ghost
                      variant="default"
                      onClick={() => copy(props.value)}
                      icon={
                        <Icon
                          size="sm"
                          className={classNames(copiedValues.includes(props.value) ? "text-success" : "")}
                          children={
                            copiedValues.includes(props.value) ? <DocumentCheckIcon /> : <DocumentDuplicateIcon />
                          }
                        />
                      }
                    />
                  ) : null
                }
                {...props}
                {...field}
              />
            )}
            name={props.name}
            control={props.control}
            defaultValue={props.value}
          />
        </Form.Group>
      );
    case "textarea":
      return (
        <Form.Group
          label={label}
          required={required}
          className={className}
        >
          <Controller
            render={({ field }) => (
              <Form.Textarea
                rows={5}
                required={required}
                disabled={props.readonly}
                readOnly={props.readonly}
                {...props}
                {...field}
              />
            )}
            name={props.name}
            control={props.control}
            defaultValue={props.value}
          />
        </Form.Group>
      );
    case "checkbox":
      return (
        <Form.Group className={className}>
          <Controller
            render={({ field: { value, ...rest } }) => (
              <Form.Checkbox
                id={rest.name}
                label={label}
                checked={value}
                {...props}
                value={Number(value ?? 0)}
                {...rest}
              />
            )}
            name={props.name}
            control={props.control}
            defaultValue={props.value}
          />
        </Form.Group>
      );
    default:
      return <Form.Input />;
  }
};

const InstallAppModal: FC<InstallAppModalProps> = ({
  open,
  onDismiss,
  titleI18Key,
  actionText,
  instructionsText,
  className,
  children,
  appInstallMutation,
  refetch,
  app
}) => {
  const { t } = useTranslation();

  const [copy, value] = useCopyToClipboard();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState<boolean>(false);
  const [installAppMutation] = appInstallMutation();

  const schema = useMemo(() => {
    if (!app) return yup.object();

    const fields = {} as any;

    app.fields?.forEach((field) => {
      switch (field.type) {
        case "text":
        case "textarea":
          fields[field.name] = yup.string().nullable();
          /* if (field.validation?.min) {
            fields[field.name] = fields[field.name].min(field.validation.min);
          }
          if (field.validation?.max) {
            fields[field.name] = fields[field.name].max(field.validation.max);
          }*/
          if (field.required) {
            fields[field.name] = fields[field.name].required();
          }
          break;
        case "checkbox":
          fields[field.name] = yup.boolean().nullable();
          break;
        case "select":
          fields[field.name] = yup.mixed();
          if (field.required) {
            fields[field.name] = fields[field.name].required();
          }
          break;
        default:
          break;
      }
    });

    return yup.object().shape(fields);
  }, [app]);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const {
    handleSubmit,
    control,
    setError,
    getValues,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset
  } = useForm<any>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  useEffect(() => {
    if (app) {
      reset(
        app.fields?.reduce<{ [key: string]: any }>((result, currentObject) => {
          result[currentObject.name] = currentObject.value;
          return result;
        }, {})
      );
    }
  }, [app]);

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });
  const { sendGTMEvent } = useGTM();

  const onSubmit: SubmitHandler<any> = async (data) => {
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
        return acc;
      }, {})
    })) as APIActionResponse<App>;

    if (displayErrors(installed)) return;

    sendGTMEvent(GTM_EVENTS.APP_INSTALLED, {
      id: app.id,
      title: app.title
    });

    dispatch(fetchInstalledApps());

    displaySuccess(installed);
    if (app.slug == "google-analytics") {
      window.open(app.install_url, "_blank");
    }
    if (refetch) {
      await refetch();
    }
    setShow(false);
    onDismiss?.();
  };

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

  return app ? (
    <Modal
      size="xl"
      open={show}
      onDismiss={onDismiss}
      className={className}
    >
      <Modal.Header>
        <Modal.HeaderTitle
          children={t(app.installed ? "apps_marketplace.app_settings" : titleI18Key, { title: app.title })}
        />
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="space-y-4">
            <Card className="bg-gray-100">
              <Card.Body className="flex flex-col gap-y-6">
                <div className="flex items-center justify-between">
                  {app.icon && (
                    <img
                      src={app.icon.url}
                      alt={app.title}
                      width={45}
                      height={45}
                    />
                  )}
                  <div className="flex flex-row gap-x-2">
                    {!app.installed && (
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
                          app.installed
                            ? t("apps_marketplace.badges.installed")
                            : t(`apps_marketplace.badges.${app.badge}`)
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
                  children={<span dangerouslySetInnerHTML={{ __html: app.description }} />}
                />
                {app.help_url && (
                  <Alert variant="default">
                    <Trans
                      i18nKey="apps_marketplace.help_url_content"
                      values={{ title: app.title }}
                      components={{
                        a: (
                          <HelpdeskLink
                            slug={app?.help_url.split("/article")[1]}
                            className="text-info hover:underline"
                          />
                        )
                      }}
                    />
                  </Alert>
                )}
                {app.slug == "google-calendar" || app.slug == "google-analytics" ? (
                  <div className="text-xs text-gray-800">
                    <Trans
                      i18nKey="apps_marketplace.google_api_link"
                      components={{
                        privacyPolicyLink: (
                          <a
                            className="text-info hover:underline"
                            href="https://msaaq.com/privacy/"
                            target="_blank"
                            rel="noreferrer"
                          ></a>
                        ),
                        termsOfServiceLink: (
                          <a
                            className="text-info hover:underline"
                            href="https://msaaq.com/terms/"
                            target="_blank"
                            rel="noreferrer"
                          ></a>
                        ),
                        googleApiUserPolicyLink: (
                          <a
                            className="text-info hover:underline"
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            target="_blank"
                            rel="noreferrer"
                          ></a>
                        )
                      }}
                    />
                  </div>
                ) : null}
              </Card.Body>
            </Card>
            {!app.installed && app.install_instructions && app.install_instructions.length > 0 && (
              <div>
                <Typography.Paragraph
                  size="lg"
                  weight="medium"
                  children={app.slug == "zapier" ? t("apps_marketplace.how_to_install_zapier") : instructionsText}
                />
                <ol className="list-decimal space-y-1 pr-4 marker:font-medium marker:text-gray-700">
                  {app.install_instructions.map((how, index) => (
                    <li key={index}>
                      <Typography.Paragraph
                        size="lg"
                        weight="medium"
                        className="text-gray-700"
                        children={how}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {app.fields && app.slug == "google-analytics" ? (
              <Field
                getValues={getValues}
                setError={setError}
                watch={watch}
                key={`${app.fields[0].name}-analytics`}
                control={control}
                errors={errors}
                copy={copy}
                copiedValues={value}
                className="mb-0"
                {...app.fields[0]}
              />
            ) : (
              app.fields?.map((field, index) => {
                return (
                  <Field
                    getValues={getValues}
                    setError={setError}
                    watch={watch}
                    key={`${field.name}-${index}`}
                    control={control}
                    errors={errors}
                    copy={copy}
                    copiedValues={value}
                    className="mb-0"
                    {...field}
                  />
                );
              })
            )}

            {children}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="gap-x-2">
          {app.slug == "google-calendar" || app.slug == "google-analytics" ? (
            <Button
              size="lg"
              type="submit"
              rounded
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              variant="default"
              icon={
                <Icon
                  size="lg"
                  children={
                    <Image
                      width={20}
                      height={20}
                      alt="google"
                      src="/images/google-icon.svg"
                    />
                  }
                />
              }
              children={t("apps_marketplace.continue_using_your_google")}
            />
          ) : (
            <Button
              size="lg"
              type="submit"
              children={app.installed ? t("save_changes") : actionText}
              isLoading={isSubmitting}
              disabled={isSubmitting || !isValid}
            />
          )}

          <Button
            variant="dismiss"
            size="lg"
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  ) : null;
};

export default InstallAppModal;
