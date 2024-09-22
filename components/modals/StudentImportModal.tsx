import React, { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import ProductsAndCoursesSelect from "@/components/select/ProductsAndCoursesSelect";
import { useResponseToastHandler } from "@/hooks";
import { useImportMembersMutation } from "@/store/slices/api/membersSlice";
import { APIActionResponse, Course, Product } from "@/types";

import { Alert, Button, Form, Modal, ModalProps, SingleFile } from "@msaaqcom/abjad";

interface IFormInputs {
  file: Array<SingleFile>;
  notify: boolean;
  products: {
    id: number;
    type: string;
    [key: string]: any;
  }[];
}

const StudentImportModal: FC<ModalProps> = ({ open = false, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(open);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const schema = yup.object({
    file: yup.array().of(yup.mixed()).max(1).required()
  });

  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const [ImportMemberMutation] = useImportMembersMutation();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const importStudent = (await ImportMemberMutation({
      notify: data.notify,
      file: data.file.map((file) => file.file).pop(),
      products: data.products?.filter((product) => product.type == "Product").map((product) => product.id),
      courses: data.products?.filter((course) => course.type == "Course").map((course) => course.id)
    })) as APIActionResponse<any>;

    if (displayErrors(importStudent)) return;

    displaySuccess(importStudent);
    setShow(false);

    reset();
    props.onDismiss?.();
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("students.students_import.modal_title")} />
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="mb-6 !pb-0">
            <Alert
              className="mb-6"
              variant={"info"}
            >
              <Trans
                i18nKey={"students.students_import.alert"}
                components={{
                  a: (
                    <a
                      href="https://bit.ly/mq-students-importer"
                      target="_blank"
                      className="text-info"
                      rel="noreferrer"
                    />
                  )
                }}
              />
            </Alert>
            <Form.Group
              errors={errors.file?.message}
              label={t("students.students_import.file_label")}
            >
              <Controller
                render={({ field: { onChange, ...rest } }) => (
                  <Form.File
                    maxFiles={1}
                    accept={["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}
                    onChange={(files: SingleFile[]) => {
                      if (files.length) {
                        onChange(files);
                      }
                    }}
                    append={
                      <Alert
                        className="mt-4"
                        variant={"default"}
                        dismissible
                      >
                        {t("students.students_import.file_alert")}
                      </Alert>
                    }
                    {...rest}
                  />
                )}
                name={"file"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              errors={errors.notify?.message}
              className="mb-8"
            >
              <Controller
                control={control}
                name={"notify"}
                render={({ field: { value, ...rest } }) => (
                  <Form.Toggle
                    id={rest.name}
                    value={Number(value ?? 0)}
                    checked={value}
                    label={t("students.students_import.notify_label")}
                    description={t("students.students_import.notify_description")}
                    {...rest}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              className="mb-0"
              label={t("students.students_import.products_select_label")}
              errors={errors.products?.message}
            >
              <Controller
                control={control}
                name={"products"}
                render={({ field }) => (
                  <ProductsAndCoursesSelect
                    placeholder={t("students.students_import.products_select_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="">
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={t("students.students_import.import")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => props.onDismiss && props.onDismiss()}
          >
            <Trans i18nKey="cancel">Cancel</Trans>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StudentImportModal;
