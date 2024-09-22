import React, { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Enrollment } from "@/types";
import { classNames } from "@/utils";

import { Button, Form, Modal, SingleFile } from "@msaaqcom/abjad";

interface CertificateModalProps {
  enrollment: Enrollment;
  onDismiss: () => void;
  open: boolean;
  createAction: (data: ICertificateFormInputs) => any;
}

export type ICertificateFormInputs = {
  type: "auto" | "custom";
  certificate: SingleFile;
  serial: string;
};

const CertificateModal: FC<CertificateModalProps> = ({ open, onDismiss, enrollment, createAction }) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);

  const schema = yup.object().shape({
    certificate: yup.mixed().when("type", {
      is: "custom",
      then: yup.mixed().required(),
      otherwise: yup.mixed().notRequired()
    }),
    serial: yup.string().when("type", {
      is: "custom",
      then: yup.string().required(),
      otherwise: yup.string().notRequired()
    })
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm<ICertificateFormInputs>({
    defaultValues: {
      type: "auto"
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    setShow(open);
  }, [open]);

  const onSubmit: SubmitHandler<ICertificateFormInputs> = async (data) => {
    if (!enrollment.id) return;

    await createAction(data);
  };
  return (
    <Modal
      size="lg"
      open={show}
      onDismiss={() => {
        setShow(false);
        onDismiss?.();
      }}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header>
          <Modal.HeaderTitle children={t("certificates.issue_certificate_to_student")} />
        </Modal.Header>
        <Modal.Body>
          <Modal.Content>
            <Form.Group
              label={t("certificates.certificate_type")}
              className={classNames(watch("type") === "auto" && "mb-0")}
            >
              <div className="flex items-start gap-4">
                <Controller
                  render={({ field: { value, ...rest } }) => (
                    <label
                      className={classNames(
                        "w-full cursor-pointer rounded border px-4 py-6",
                        "flex items-center gap-2",
                        value === "auto" ? "border-primary bg-primary-50" : "border-gray"
                      )}
                    >
                      <Form.Radio
                        id="auto_certificate"
                        value="auto"
                        checked={value === "auto"}
                        label={t("certificates.issue_auto_certificate")}
                        {...rest}
                      />
                    </label>
                  )}
                  name={"type"}
                  control={control}
                />
                <Controller
                  render={({ field: { value, ...rest } }) => (
                    <label
                      className={classNames(
                        "w-full cursor-pointer rounded border px-4 py-6",
                        "flex items-center gap-2",
                        value === "custom" ? "border-primary bg-primary-50" : "border-gray"
                      )}
                    >
                      <Form.Radio
                        id="custom_certificate"
                        value="custom"
                        checked={value === "custom"}
                        label={t("certificates.upload_custom_certificate")}
                        {...rest}
                      />
                    </label>
                  )}
                  name={"type"}
                  control={control}
                />
              </div>
            </Form.Group>
            {watch("type") === "custom" && (
              <>
                <Form.Group
                  label={t("certificates.serial_number")}
                  required
                  errors={errors.serial?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("certificates.serial_number_placeholder")}
                        {...field}
                      />
                    )}
                    control={control}
                    name={"serial"}
                  />
                </Form.Group>
                <Form.Group
                  label={t("certificates.certificate")}
                  required
                  errors={errors.certificate?.message}
                  className="mb-0"
                >
                  <Controller
                    name={"certificate"}
                    control={control}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <Form.File
                        value={value ? [value] : []}
                        accept={["application/pdf"]}
                        maxFiles={1}
                        onChange={(files) => {
                          if (files.length) {
                            onChange(files[0]);
                          }
                        }}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            size="lg"
            children={t("certificates.issue_certificate")}
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
          />
          <Button
            ghost
            size="lg"
            variant="dismiss"
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default CertificateModal;
