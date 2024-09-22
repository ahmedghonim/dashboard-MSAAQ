import React, { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { useResponseToastHandler } from "@/hooks";
import { useUpdateNotificationsEmailTemplateMutation } from "@/store/slices/api/notificationsSlice";
import { APIActionResponse, EmailTemplateInputs } from "@/types";
import { selectOnClick } from "@/utils";

import { Button, Form, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface CreateNewProductModalProps extends ModalProps {
  open: boolean;
  emailTemplate: EmailTemplateInputs | null;
}

const CustomizeEmailTemplateModal: FC<CreateNewProductModalProps> = ({
  open = false,
  emailTemplate,
  onDismiss,
  ...props
}: CreateNewProductModalProps) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(open);

  const schema = yup.object({
    mail_subject: yup.string().required(),
    mail_message: yup.string().required()
  });

  const [updateNotificationsEmailTemplate] = useUpdateNotificationsEmailTemplateMutation();
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<EmailTemplateInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });
  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    setShow(open);
  }, [open]);

  useEffect(() => {
    if (emailTemplate) {
      reset({
        mail_subject: emailTemplate.mail_subject,
        mail_message: emailTemplate.mail_message
      });
    }
  }, [emailTemplate]);
  const onSubmit: SubmitHandler<EmailTemplateInputs> = async (data) => {
    if (isSubmitting || !emailTemplate) return;

    const template = (await updateNotificationsEmailTemplate({
      ...data,
      ...(emailTemplate?.default_template_for && {
        [emailTemplate?.default_template_for as string]: true
      }),
      type: emailTemplate?.type,
      id: emailTemplate?.id
    })) as APIActionResponse<any>;

    if (displayErrors(template)) return;

    displaySuccess(template);
    onDismiss?.();
  };

  return (
    <Modal
      size="lg"
      onDismiss={onDismiss}
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle>
          {t(`email_notifications.customize_modal.title.${emailTemplate?.content_type}`)}
        </Modal.HeaderTitle>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="flex flex-col gap-y-6">
            <Form.Group
              errors={errors.mail_subject?.message}
              required
              label={t("email_notifications.customize_modal.email_title_input_label")}
              className="mb-0"
            >
              <Controller
                name="mail_subject"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("email_notifications.customize_modal.email_title_input_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              errors={errors.mail_message?.message}
              required
              label={t("email_notifications.customize_modal.email_body_label")}
              className="mb-0"
            >
              <Controller
                name="mail_message"
                control={control}
                render={({ field }) => (
                  <Form.Textarea
                    rows={8}
                    placeholder={t("email_notifications.customize_modal.email_title_input_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
            {Object.keys(emailTemplate?.vars ?? {}).length > 0 && (
              <Form.Group
                tooltip={t("email_notifications.customize_modal.email_variables_tooltip")}
                label={t("email_notifications.customize_modal.email_variables")}
                className="mb-0"
              >
                {Object.keys(emailTemplate?.vars ?? {}).map((key) => (
                  <Typography.Paragraph
                    as="span"
                    weight="medium"
                    key={key}
                  >
                    {emailTemplate?.vars[key]}:&nbsp;
                    <span
                      onClick={selectOnClick}
                      className="text-purple-600"
                    >
                      {key}
                    </span>
                  </Typography.Paragraph>
                ))}
              </Form.Group>
            )}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={t("save_changes")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => onDismiss?.()}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CustomizeEmailTemplateModal;
