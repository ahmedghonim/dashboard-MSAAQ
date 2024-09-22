import { useContext, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AuthContext } from "@/contextes";
import { useResponseToastHandler } from "@/hooks";
import { useSendTestEmailMutation } from "@/store/slices/api/campaignsSlice";
import { APIActionResponse } from "@/types";

import { Button, Form, Modal } from "@msaaqcom/abjad";
import { ModalProps } from "@msaaqcom/abjad/dist/components/modal/Modal";

interface IFormInputs {
  email: string;
}

const MailTestModal = ({ open, onDismiss }: ModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const { refetchAuth, user } = useContext(AuthContext);

  const [sendTestEmail] = useSendTestEmailMutation();
  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const schema = yup.object({
    email: yup.string().email().required()
  });
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  useEffect(() => {
    if (user) {
      setValue("email", user.email);
    }
  }, [user]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const response = (await sendTestEmail({
      id: Number(router.query.campaignId) as number,
      email: data.email
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      return;
    }
    displaySuccess(response);
    refetchAuth();
    onDismiss?.();
  };
  return (
    <Modal
      size="lg"
      open={show}
      onDismiss={() => {
        onDismiss?.();
      }}
    >
      <Modal.Header className="mb-2">
        <Modal.HeaderTitle>{t("marketing.campaigns.test_modal_title")}</Modal.HeaderTitle>
      </Modal.Header>
      <Modal.Body>
        <Modal.Content className="flex flex-col gap-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group
              errors={errors.email?.message}
              required
              label={t("marketing.campaigns.email")}
              className="mb-0"
              help={t("marketing.campaigns.email_helper")}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    dir="ltr"
                    placeholder="example@domain.com"
                    {...field}
                  />
                )}
              />
            </Form.Group>
          </Form>
        </Modal.Content>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex w-full justify-between">
          <Button
            disabled={isSubmitting || !isDirty || !isValid}
            className="px-10"
            type="submit"
            onClick={handleSubmit(onSubmit)}
            children={t("send")}
          />
          <Button
            variant="default"
            onClick={() => onDismiss?.()}
            children={t("cancel")}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MailTestModal;
