import React, { FC, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { sortBy } from "lodash";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Datatable } from "@/components";
import { Select } from "@/components/select";
import { useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import {
  useCreateDomainDnsMutation,
  useDeleteDomainDnsMutation,
  useFetchDomainDnsQuery,
  useUpdateDomainDnsMutation
} from "@/store/slices/api/domainsSlice";
import { APIActionResponse, Course, DomainRecord } from "@/types";
import { Domain } from "@/types/models/domain";

import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Dropdown, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface RecordType {
  label: string;
  value: "MX" | "TXT" | "A" | "CNAME";
}

interface IFormInputs {
  id?: string | number;
  name: string;
  content: string;
  priority?: number;
  ttl: {
    label: string;
    value: number;
  };
  type: RecordType;
}

interface Props extends ModalProps {
  domain: Domain;
}

const ttls = [
  {
    label: "Auto",
    value: 1
  },
  {
    label: "1 Minute",
    value: 1 * 60
  },
  {
    label: "2 Minutes",
    value: 2 * 60
  },
  {
    label: "5 Minutes",
    value: 5 * 60
  },
  {
    label: "10 Minutes",
    value: 10 * 60
  },
  {
    label: "15 Minutes",
    value: 15 * 60
  },
  {
    label: "30 Minutes",
    value: 30 * 60
  },
  {
    label: "1 Hour",
    value: 1 * 60 * 60
  },
  {
    label: "2 Hours",
    value: 2 * 60 * 60
  },
  {
    label: "5 Hours",
    value: 5 * 60 * 60
  },
  {
    label: "12 Hours",
    value: 12 * 60 * 60
  },
  {
    label: "1 Day",
    value: 1 * 60 * 60 * 24
  }
];

const types: RecordType[] = [
  {
    label: "MX",
    value: "MX"
  },
  {
    label: "TXT",
    value: "TXT"
  },
  {
    label: "A",
    value: "A"
  },
  {
    label: "CNAME",
    value: "CNAME"
  }
];

const DomainDnsSettingsModal: FC<Props> = ({ domain, ...props }: Props) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [createDomainDnsMutation] = useCreateDomainDnsMutation();
  const [updateDomainDnsMutation] = useUpdateDomainDnsMutation();
  const { data: records, refetch } = useFetchDomainDnsQuery({
    domainId: domain.id
  });

  const schema = yup.object({
    type: yup.mixed().required(),
    ttl: yup.mixed().required(),
    name: yup.string().required(),
    content: yup.string().required(),
    priority: yup
      .number()
      .nullable()
      .when("type.value", {
        is: "MX",
        then: yup
          .number()
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .min(0)
          .required(),
        otherwise: yup
          .number()
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .nullable()
      })
  });
  const {
    handleSubmit,
    control,
    setError,
    watch,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "onBlur"
  });

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const onSubmit: SubmitHandler<IFormInputs> = async (data, event) => {
    event?.preventDefault();

    if (isSubmitting) return;

    const action = !data?.id ? createDomainDnsMutation : updateDomainDnsMutation;

    const response = (await action({
      recordId: data.id,
      domainId: domain.id,
      name: data.name,
      content: data.content,
      ...(data.type.value === "MX" ? { priority: data.priority } : {}),
      ttl: data.ttl.value,
      type: data.type.value
    })) as APIActionResponse<DomainRecord>;
    if (displayErrors(response)) {
      return;
    }

    reset({
      id: undefined,
      type: types.find((type) => type.value === "CNAME"),
      ttl: ttls.find((ttl) => ttl.value === 1),
      name: "",
      content: "",
      priority: undefined
    });
    await refetch();

    displaySuccess(response);
  };

  const handleEdit = (record: DomainRecord) => {
    reset({
      id: record.id,
      type: types.find((type) => type.value === record.type),
      ttl: ttls.find((ttl) => ttl.value === record.ttl),
      ...(record.type === "MX" && record.priority ? { priority: record.priority } : {}),
      name: record.name,
      content: record.content
    });

    setIsAdding(true);
  };

  return (
    <>
      <Button
        variant="default"
        children={t("academy_settings.domain.dns_settings")}
        onClick={() => setShow(true)}
      />

      <Modal
        onDismiss={() => setShow(false)}
        size="xl"
        open={show}
        {...props}
      >
        <Modal.Header>
          <Modal.HeaderTitle children={t("academy_settings.domain.dns_settings")} />
        </Modal.Header>

        <Modal.Body>
          <Modal.Content>
            <div className="mb-4 flex items-center justify-between">
              <Typography.Paragraph
                children={t("academy_settings.domain.records.title")}
                weight="medium"
              />

              <Button
                children={t("academy_settings.domain.records.add_record")}
                variant="default"
                onClick={() => {
                  reset({});
                  setIsAdding(true);
                }}
                icon={
                  <Icon
                    size="sm"
                    children={<PlusIcon />}
                  />
                }
              />
            </div>

            {isAdding && (
              <Card className="mb-6">
                <Card.Body className="pb-0">
                  <div className="grid grid-cols-2 gap-6">
                    <Form.Group
                      label={t("academy_settings.domain.records.type")}
                      errors={errors.type?.message}
                      required
                    >
                      <Controller
                        name="type"
                        control={control}
                        defaultValue={types.find((type) => type.value === "CNAME")}
                        render={({ field }) => (
                          <Select
                            options={sortBy(types, "label")}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>

                    <Form.Group
                      label={t("academy_settings.domain.records.ttl")}
                      errors={errors.ttl?.message}
                      required
                    >
                      <Controller
                        name="ttl"
                        control={control}
                        defaultValue={ttls.find((ttl) => ttl.value === 1)}
                        render={({ field }) => (
                          <Select
                            options={ttls}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Form.Group
                      label={t("academy_settings.domain.records.name")}
                      errors={errors.name?.message}
                      required
                    >
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => <Form.Input {...field} />}
                      />
                    </Form.Group>

                    <Form.Group
                      label={t("academy_settings.domain.records.content")}
                      errors={errors.content?.message}
                      required
                    >
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => <Form.Input {...field} />}
                      />
                    </Form.Group>
                  </div>

                  {watch("type")?.value === "MX" && (
                    <Form.Group
                      label={t("academy_settings.domain.records.priority")}
                      errors={errors.priority?.message}
                      required
                    >
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <Form.Number
                            withHandlers={false}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                  )}
                </Card.Body>

                <Card.Actions className="gap-1">
                  <Button
                    children={watch("id") ? t("save_changes") : t("academy_settings.domain.records.add_record")}
                    variant="primary"
                    onClick={(e) => handleSubmit(onSubmit)(e)}
                    disabled={!isDirty || !isValid}
                  />

                  <Button
                    variant="dismiss"
                    children={t("cancel")}
                    onClick={() => setIsAdding(false)}
                  />
                </Card.Actions>
              </Card>
            )}

            <Datatable
              defaultPerPage={4}
              fetcher={useFetchDomainDnsQuery}
              selectable={false}
              dataFormatter={(data) => sortBy(data, "type")}
              columns={{
                columns: () => [
                  {
                    Header: t("academy_settings.domain.records.type"),
                    disableSortBy: true,
                    accessor: "type",
                    width: 75,
                    Cell: ({ value }: any) => (
                      <Badge
                        rounded
                        soft
                        size="sm"
                        variant="default"
                        children={value}
                      />
                    )
                  },
                  {
                    Header: t("academy_settings.domain.records.name"),
                    disableSortBy: true,
                    accessor: "name",
                    Cell: ({ value }: any) => (
                      <Typography.Paragraph
                        children={value}
                        weight="medium"
                      />
                    )
                  },
                  {
                    Header: t("academy_settings.domain.records.value"),
                    disableSortBy: true,
                    accessor: "content",
                    Cell: ({ value }: any) => (
                      <Typography.Paragraph
                        children={value}
                        weight="medium"
                      />
                    )
                  },
                  {
                    id: "actions",
                    className: "justify-end",
                    //@ts-ignore
                    Cell: ({ row: { original } }: Course) => {
                      const [confirmableDelete] = useConfirmableDelete({
                        mutation: useDeleteDomainDnsMutation
                      });

                      return (
                        <div className="flex flex-row">
                          <Button
                            variant="default"
                            size="sm"
                            className="ml-2"
                            children={t("edit")}
                            onClick={() => handleEdit(original)}
                          />

                          <Dropdown>
                            <Dropdown.Trigger>
                              <Button
                                variant="default"
                                size="sm"
                                icon={
                                  <Icon
                                    size="md"
                                    children={<EllipsisHorizontalIcon />}
                                  />
                                }
                              />
                            </Dropdown.Trigger>
                            <Dropdown.Menu className="z-[999999]">
                              <Dropdown.Item
                                children={t("edit")}
                                onClick={() => handleEdit(original)}
                                iconAlign="end"
                                icon={
                                  <Icon
                                    size="sm"
                                    children={<PencilSquareIcon />}
                                  />
                                }
                              />
                              <Dropdown.Divider />
                              <Dropdown.Item
                                children={t("delete")}
                                className="text-danger"
                                iconAlign="end"
                                onClick={() => {
                                  confirmableDelete({
                                    id: original.id,
                                    payload: {
                                      domainId: domain.id,
                                      recordId: original.id
                                    },
                                    title: t("courses.delete_course"),
                                    children: t("courses.delete_course_confirm_message", { title: original.title })
                                  });
                                }}
                                icon={
                                  <Icon
                                    size="sm"
                                    children={<TrashIcon />}
                                  />
                                }
                              />
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      );
                    }
                  }
                ]
              }}
              params={{
                domainId: domain.id
              }}
            />
          </Modal.Content>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default DomainDnsSettingsModal;
