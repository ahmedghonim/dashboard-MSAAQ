import { FC, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { useResponseToastHandler } from "@/hooks";
import { useUpdateEmailMutation } from "@/store/slices/api/authSlice";
import { APIActionResponse } from "@/types";

import { Alert, Button, Form, Modal, ModalProps } from "@msaaqcom/abjad";

interface IFormInputs {
  password: string;
  new_email: string;
}

interface Props extends ModalProps {}

const ChangeEmailModal: FC<Props> = ({ open, ...props }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  const [disableEmail, setDisableEmail] = useState<boolean>(true);

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const schema = yup.object({
    new_email: yup.string().email().required(),
    password: yup.string().when({
      is: (exists: any) => !!exists,
      then: yup.string().required(),
      otherwise: yup.string().nullable().notRequired()
    })
  });
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const [updateEmailMutation] = useUpdateEmailMutation();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const user = (await updateEmailMutation(data)) as APIActionResponse<{
      new_email: string;
      password: string;
    }>;

    if (displayErrors(user)) return;

    displaySuccess(user);
    setValue("password", "");
    setValue("new_email", "");
    props.onDismiss?.();
  };

  useEffect(() => {
    if (watch("password")?.length < 8) {
      setDisableEmail(true);
    } else if (watch("password") !== undefined) {
      setDisableEmail(false);
    } else {
      setDisableEmail(true);
    }
  }, [watch("password")]);

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("profile.update_email")} />
      </Modal.Header>
      <Form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Modal.Body>
          <Modal.Content className="max-h-96 overflow-y-auto !pb-0">
            <Alert
              title={t("profile.activation_email_will_be_sent")}
              variant={"default"}
              className="mb-6"
              dismissible
            />
            <Form.Group
              required
              label={t("profile.password_label")}
              errors={errors.password?.message}
            >
              <Controller
                name={"password"}
                control={control}
                render={({ field }) => (
                  <Form.Password
                    required
                    placeholder="•••••••••••"
                    {...field}
                    autoComplete="new-password"
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("profile.new_email_label")}
              errors={errors.new_email?.message}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    required
                    type="email"
                    placeholder="example@domain.com"
                    disabled={disableEmail}
                    {...field}
                    autoComplete="new-email"
                  />
                )}
                name={"new_email"}
                control={control}
              />
            </Form.Group>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="py-3">
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            disabled={isSubmitting || !isValid || !isDirty}
            children={t("profile.change")}
          />
          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => {
              setShow(false);
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangeEmailModal;
