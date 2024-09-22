import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Control, Controller, FieldErrors, SubmitHandler, UseFormWatch, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Card, Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { SortableList } from "@/components/SortableList";
import { Select } from "@/components/select";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useCreateFormMutation, useFetchFormQuery } from "@/store/slices/api/formsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { APIActionResponse } from "@/types";
import { IForm } from "@/types/models/form";
import { classNames, convertBooleans } from "@/utils";

import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Collapse, Form, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormFields {
  fields: {
    name: string;
    field_type: {
      value: "email" | "text" | "number" | "phone" | "select";
      label: string;
    };
    label: string;
    required: boolean;
    status: boolean;
    placeholder: string;
    $new?: boolean;
    options?: {
      label: string;
      value: string;
    }[];
  }[];
}

interface OptionType {
  value: "email" | "text" | "number" | "phone" | "select";
  label: string;
}

const SelectOptions = ({
  control,
  index,
  errors
}: {
  errors: FieldErrors<IFormFields>;
  control: Control<IFormFields>;
  index: number;
}) => {
  const { t } = useTranslation();

  const { fields, remove, append } = useFieldArray({
    control,
    name: `fields.${index}.options`
  });

  const addNewOptions = () => {
    append({
      label: "",
      value: ""
    });
  };

  useEffect(() => {
    if (!fields.length) {
      append({
        label: "",
        value: ""
      });
    }
  }, [fields]);

  return (
    <div className="mb-4 flex flex-col gap-3">
      {fields.map((field: any, fieldIndex: number) => (
        <div
          className="flex items-end gap-3"
          key={fieldIndex}
        >
          <Form.Group
            className="!mb-auto w-full"
            errors={errors?.fields?.[index]?.options?.[fieldIndex]?.label?.message}
            label={t("forms.select_name_label", { index: fieldIndex + 1 })}
            required
          >
            <Controller
              name={`fields.${index}.options.${fieldIndex}.label`}
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("forms.select_name_placeholder", { index: fieldIndex + 1 })}
                  {...field}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            className="!mb-auto w-full"
            errors={errors?.fields?.[index]?.options?.[fieldIndex]?.value?.message}
            required
            label={t("forms.select_value_label")}
          >
            <Controller
              name={`fields.${index}.options.${fieldIndex}.value`}
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("forms.select_value_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>

          <Button
            variant="default"
            type="button"
            disabled={fields.length === 1}
            className={classNames(
              errors?.fields?.[index]?.options?.[fieldIndex]?.value ||
                errors?.fields?.[index]?.options?.[fieldIndex]?.label
                ? "my-auto"
                : "mt-auto"
            )}
            onClick={() => remove(fieldIndex)}
            icon={
              <Icon>
                <TrashIcon />
              </Icon>
            }
          />
        </div>
      ))}
      <Button
        variant={"default"}
        children={t("forms.add_new_option")}
        onClick={() => {
          addNewOptions();
        }}
      />
    </div>
  );
};

const FormCard = ({
  errors,
  index,
  options,
  label,
  control,
  watch,
  actions
}: {
  label?: string;
  index: number;
  errors: FieldErrors<IFormFields>;
  control: Control<IFormFields>;
  actions: ReactNode;
  watch: UseFormWatch<IFormFields>;
  options: Array<OptionType>;
}) => {
  const { t } = useTranslation();

  return (
    <Card className="mt-4 overflow-visible">
      <Card.Body>
        <Typography.Paragraph
          size="sm"
          className="mb-3 text-gray-700"
          weight="medium"
          children={label ?? t("forms.add_field")}
        />
        <div>
          <Form.Group
            className="!mb-3"
            errors={errors?.fields?.[index]?.name?.message}
            label={t("forms.field_input_name")}
            tooltip={t("forms.name_field_tooltip")}
            required
          >
            <Controller
              name={`fields.${index}.name`}
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Form.Input
                  dir="auto"
                  placeholder={t("forms.field_placeholder_input_name")}
                  onChange={(e) => {
                    onChange(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s/g, "_")
                        .replace(/_+/g, "_")
                        .replace(/^_+|_+$/g, "")
                        .replace(/[^a-z_]/g, "_")
                    );
                  }}
                  {...rest}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            className="!mb-3"
            errors={errors?.fields?.[index]?.label?.message}
            label={t("forms.field_input_label")}
            required
          >
            <Controller
              name={`fields.${index}.label`}
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("forms.field_label_input_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            className="!mb-3"
            errors={errors?.fields?.[index]?.placeholder?.message}
            label={t("forms.field_placeholder_input_label")}
            required
          >
            <Controller
              name={`fields.${index}.placeholder`}
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("forms.field_placeholder_input_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            className="!mb-3"
            errors={errors?.fields?.[index]?.field_type?.message}
            label={t("forms.field_select_label")}
            required
          >
            <Controller
              name={`fields.${index}.field_type`}
              control={control}
              render={({ field }) => (
                <Select
                  menuPlacement="top"
                  placeholder={t("forms.field_select_placeholder")}
                  isClearable
                  options={options}
                  {...field}
                />
              )}
            />
          </Form.Group>
          {watch(`fields.${index}`).field_type?.value === "select" && (
            <div className="mb-3">
              <div className="my-3 flex items-center gap-3">
                <Typography.Paragraph
                  size="sm"
                  weight="medium"
                  className=" flex-shrink-0 text-gray-800"
                  children={t("forms.select_fields_title")}
                />
                <div className="h-[1px] w-full bg-gray-400"></div>
              </div>
              <SelectOptions
                errors={errors}
                index={index}
                control={control}
              />
            </div>
          )}
          <Form.Group className="!mb-3">
            <Controller
              control={control}
              name={`fields.${index}.required`}
              render={({ field: { value, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  value={Number(value ?? 0)}
                  checked={value}
                  label={t("forms.field_required_label")}
                  {...rest}
                />
              )}
            />
          </Form.Group>
        </div>
      </Card.Body>
      <div className="border-t p-4">
        <div className="flex items-center justify-between">{actions}</div>
      </div>
    </Card>
  );
};

export default function Forms() {
  const { t } = useTranslation();
  const [isNelcInstalled, setIsNelcInstalled] = useState(false);
  const fieldsNames = useRef<string[]>([]);

  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);

  useEffect(() => {
    if (installedApps) {
      const app = installedApps.find((app) => app.slug === "nelc");
      if (app) {
        setIsNelcInstalled(app.installed);
      }
    }
  }, [installedApps]);

  const options = useMemo<Array<OptionType>>(
    () => [
      {
        value: "text",
        label: t("forms.field_type_text")
      },
      {
        value: "number",
        label: t("forms.field_type_number")
      },
      {
        value: "phone",
        label: t("forms.field_type_phone")
      },
      {
        value: "email",
        label: t("forms.field_type_email")
      },
      {
        value: "select",
        label: t("forms.field_type_select")
      }
    ],
    [t]
  );

  const englishPattern = /^[a-z]+(?:_[a-z]+)*$/;

  const schema = yup.object().shape({
    fields: yup.array().of(
      yup.object().shape({
        name: yup
          .string()
          .required()
          .notOneOf(
            [
              "avatar",
              "name",
              "username",
              "email",
              "password",
              "gender",
              "country_code",
              "phone",
              "phone_code",
              "dob",
              "job_title",
              "bio",
              "education",
              "skills",
              "roles",
              "status",
              "national_id"
            ],
            t("forms.field_name_error")
          )
          .test("unique-in-names", t("forms.field_name_unique"), (value) => {
            return fieldsNames.current.filter((name) => name === value).length <= 1;
          })
          .matches(englishPattern, t("forms.field_pattern")),
        label: yup.string().required(),
        placeholder: yup.string().required(),
        field_type: yup
          .object()
          .shape({
            label: yup.string().required(),
            value: yup.string().required()
          })
          .nullable()
          .required(),
        options: yup
          .array()
          .of(
            yup.object().shape({
              label: yup.string().required(),
              value: yup.string().required()
            })
          )
          .when("field_type.value", {
            is: "select",
            then: yup
              .array()
              .of(
                yup.object().shape({
                  label: yup.string().required(),
                  value: yup.string().required()
                })
              )
              .nullable()
              .required(),
            otherwise: yup
              .array()
              .of(
                yup.object().shape({
                  label: yup.string(),
                  value: yup.string()
                })
              )
              .nullable()
          })
      })
    )
  });

  const { data: fetchForm, isLoading } = useFetchFormQuery("complete_profile");

  const form = useForm<IFormFields>({
    defaultValues: {
      fields: []
    },
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setError,
    reset,
    getValues,
    watch
  } = form;

  const { fields, append, remove, update, move } = useFieldArray({
    name: "fields",
    control
  });

  useEffect(() => {
    if (fetchForm?.data) {
      reset({
        fields: fetchForm.data.fields.map((field) => ({
          name: field.name,
          label: field.label,
          required: field.required,
          status: field.status,
          options: field.options,
          placeholder: field.placeholder,
          field_type: options.find((option) => option.value === field.type),
          $new: false
        }))
      });
    }
  }, [fetchForm]);

  useEffect(() => {
    fieldsNames.current = watch("fields").map((field) => field.name);
  }, [watch()]);

  const newField = useMemo(() => fields.find((f) => f.$new), [fields]);
  const formFields = useMemo(() => fields.filter((f) => !f.$new), [fields]);

  const resetFields = () => {
    getValues("fields").map((field, index) => {
      update(index, { ...field, $new: false });
    });
  };

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const [createForm] = useCreateFormMutation();

  const onSubmit: SubmitHandler<IFormFields> = async (data) => {
    const response = (await createForm({
      type: "complete_profile",
      fields: data.fields.map((field) => ({
        name: field.name,
        label: field.label,
        required: field.required,
        ...(field.field_type.value === "select" && field.options && field.options.length > 0
          ? { options: field.options }
          : {}),
        status: field.status,
        placeholder: field.placeholder,
        type: field.field_type.value
      }))
    })) as APIActionResponse<IForm>;

    if (displayErrors(response)) {
      return;
    }

    displaySuccess(response);

    if (response?.data?.data) {
      reset({
        fields: response.data.data.fields.map((field) => ({
          name: field.name,
          label: field.label,
          options: field.options,
          status: field.status,
          required: field.required,
          placeholder: field.placeholder,
          field_type: options.find((option) => option.value === field.type),
          $new: false
        }))
      });
    }
  };

  const handleDeleteClick = async (index: number, label: string) => {
    const confirmed = await confirm({
      title: t("forms.delete_title"),
      variant: "danger",
      okLabel: t("forms.delete_label"),
      cancelLabel: t("cancel"),
      checkboxLabel: "label",
      children: t("forms.delete_field_confirm", { label })
    });

    if (confirmed) {
      remove(index);
    }
  };

  return (
    <Layout title={t("academy_settings.forms.title")}>
      <SettingsTabs />
      <Layout.Container>
        <AddonController addon="forms.complete-profile">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Layout.FormGrid
              sidebar={
                <Layout.FormGrid.Actions
                  product={fetchForm?.data}
                  redirect={`/settings/forms`}
                  form={form}
                />
              }
            >
              <Form.Section
                title={t("forms.section_title")}
                description={t("forms.section_description")}
              >
                {isLoading ? (
                  <div className="flex animate-pulse flex-col gap-3">
                    <div className=" h-16 w-full rounded-lg bg-gray"></div>
                    <div className=" h-16 w-full rounded-lg bg-gray"></div>
                    <div className=" h-16 w-full rounded-lg bg-gray"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-col gap-4">
                      <Tooltip>
                        <Tooltip.Trigger>
                          <div className="flex h-[56px] cursor-not-allowed items-center rounded-lg bg-primary-50 p-4">
                            <div className="flex items-center gap-3">
                              <Typography.Paragraph
                                size="md"
                                weight="medium"
                                className="text-black"
                                children={t("forms.nelc.email")}
                              />
                            </div>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{t("forms.nelc.field_is_required")}</Tooltip.Content>
                      </Tooltip>
                      <Tooltip>
                        <Tooltip.Trigger>
                          <div className="flex h-[56px] cursor-not-allowed items-center rounded-lg bg-primary-50 p-4 ">
                            <div className="flex items-center gap-3">
                              <Typography.Paragraph
                                size="md"
                                weight="medium"
                                className="text-black"
                                children={t("forms.nelc.phone")}
                              />
                            </div>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{t("forms.nelc.field_is_required")}</Tooltip.Content>
                      </Tooltip>
                      {isNelcInstalled && (
                        <div className="flex h-[56px] cursor-not-allowed items-center rounded-lg bg-primary-50 p-4">
                          <div className="flex items-center gap-3">
                            <Typography.Paragraph
                              size="md"
                              weight="medium"
                              className="text-black"
                              children={t("forms.nelc.id_number")}
                            />

                            <Tooltip>
                              <Tooltip.Trigger>
                                <Icon>
                                  <ExclamationCircleIcon className="text-gray-700" />
                                </Icon>
                              </Tooltip.Trigger>
                              <Tooltip.Content>{t("forms.nelc.id_number_tooltip")}</Tooltip.Content>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <SortableList
                        items={formFields}
                        onChange={(item1, item2) => {
                          move(item1, item2);
                        }}
                        renderItem={(item, index, dragOverlay) => (
                          <Collapse
                            className={classNames(
                              "transform rounded-lg",
                              dragOverlay ? "-rotate-1 border-gray-400" : "rotate-0"
                            )}
                            key={index}
                          >
                            {({ toggle, close }) => (
                              <>
                                <Collapse.Button
                                  as={"div"}
                                  prepend={<SortableList.DragHandle />}
                                  onClick={() => {
                                    return null;
                                  }}
                                  append={
                                    <>
                                      <Button
                                        variant="default"
                                        ghost
                                        className="ltr:mr-2 rtl:ml-2"
                                        icon={
                                          <Icon>
                                            <TrashIcon />
                                          </Icon>
                                        }
                                        onClick={async () => {
                                          await handleDeleteClick(index, item.label);
                                        }}
                                      />

                                      <Button
                                        variant="default"
                                        ghost
                                        className="ltr:mr-2 rtl:ml-2"
                                        icon={
                                          <Icon>
                                            <Cog6ToothIcon />
                                          </Icon>
                                        }
                                        onClick={() => {
                                          toggle();
                                        }}
                                      />
                                    </>
                                  }
                                  className={classNames(
                                    "rounded-lg bg-white",
                                    convertBooleans(errors?.fields?.[index]) ? "ring-1 ring-danger" : ""
                                  )}
                                >
                                  <div className="flex flex-grow flex-row justify-between">
                                    <div className="flex items-center">
                                      <Form.Group className="!mb-0">
                                        <Controller
                                          control={control}
                                          name={`fields.${index}.status`}
                                          render={({ field: { value, ...rest } }) => (
                                            <Form.Toggle
                                              id={rest.name}
                                              value={Number(value ?? 0)}
                                              checked={value}
                                              {...rest}
                                            />
                                          )}
                                        />
                                      </Form.Group>
                                      <Typography.Paragraph
                                        size="md"
                                        weight="medium"
                                        children={item.label}
                                      />
                                    </div>
                                  </div>
                                </Collapse.Button>
                                <Collapse.Content className="overflow-visible">
                                  <FormCard
                                    index={index}
                                    options={options}
                                    control={control}
                                    errors={errors}
                                    label={item.label}
                                    watch={watch}
                                    actions={
                                      <>
                                        <Button
                                          variant={"primary"}
                                          children={t("forms.update_field")}
                                          disabled={
                                            !(
                                              watch(`fields.${index}`)?.label !== "" &&
                                              watch(`fields.${index}`)?.name !== "" &&
                                              watch(`fields.${index}`)?.placeholder !== "" &&
                                              (watch(`fields.${index}`).field_type?.value !== "select" ||
                                                watch(`fields.${index}`)?.options?.every(
                                                  (option) => option.label !== "" && option.value !== ""
                                                ))
                                            )
                                          }
                                          onClick={() => {
                                            resetFields();
                                          }}
                                        />
                                        <Button
                                          variant={"default"}
                                          children={t("forms.cancel")}
                                          onClick={() => {
                                            close();
                                          }}
                                        />
                                      </>
                                    }
                                  />
                                </Collapse.Content>
                              </>
                            )}
                          </Collapse>
                        )}
                      />
                    </div>
                    {newField ? (
                      <FormCard
                        index={formFields.length}
                        control={control}
                        options={options}
                        errors={errors}
                        watch={watch}
                        actions={
                          <>
                            <Button
                              variant={"primary"}
                              disabled={
                                !(
                                  watch(`fields.${formFields.length}`)?.label !== "" &&
                                  watch(`fields.${formFields.length}`)?.name !== "" &&
                                  watch(`fields.${formFields.length}`)?.placeholder !== "" &&
                                  (watch(`fields.${formFields.length}`).field_type?.value !== "select" ||
                                    watch(`fields.${formFields.length}`)?.options?.every(
                                      (option) => option.label !== "" && option.value !== ""
                                    ))
                                )
                              }
                              children={t("forms.add_field")}
                              onClick={() => {
                                resetFields();
                              }}
                            />
                            <Button
                              variant={"default"}
                              children={t("forms.cancel")}
                              onClick={() => {
                                remove(formFields.length);
                              }}
                            />
                          </>
                        }
                      />
                    ) : null}
                    <Button
                      disabled={newField !== undefined}
                      children={t("forms.create_new_field")}
                      variant={"default"}
                      className="mt-4 w-full"
                      onClick={() => {
                        resetFields();
                        append({
                          name: "",
                          field_type: options[0],
                          label: "",
                          placeholder: "",
                          $new: true,
                          required: false,
                          status: true
                        });
                      }}
                    />
                  </>
                )}
              </Form.Section>
            </Layout.FormGrid>
          </Form>
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
