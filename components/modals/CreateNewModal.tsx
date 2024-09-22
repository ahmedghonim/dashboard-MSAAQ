import { FC, useContext, useEffect, useState } from "react";

import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { SubscriptionContext } from "@/contextes";
import { Plans } from "@/types";
import { classNames } from "@/utils";

import { ArrowUpLeftIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps } from "@msaaqcom/abjad";

import { AddonController } from "../addon-controller";

interface IFormInputs {
  title: string;
  type: string | undefined;
}

interface CreateNewModalProps extends ModalProps {
  title: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputDefaultValue?: string;
  createAction: (title: string, type?: string) => any;
  submitButtonText: string;
  type: "course" | "product" | "coaching-session" | "bundle" | "quiz" | "bank" | "article" | "chapter" | "campaign";
}

const CreateNewModal: FC<CreateNewModalProps> = ({
  open = false,
  type,
  inputDefaultValue = "",
  createAction,
  title,
  inputLabel,
  inputPlaceholder,
  submitButtonText,
  ...props
}: CreateNewModalProps) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(open);
  const { subscription } = useContext(SubscriptionContext);

  const schema = yup.object({
    title: yup.string().trim().required()
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
    setShow(open);
    setValue("title", inputDefaultValue);
    setValue("type", "online");
  }, [open]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    await createAction(data.title, type == "course" ? data.type : undefined);
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle>{title}</Modal.HeaderTitle>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content>
            <Form.Group
              errors={errors.title?.message}
              required
              label={inputLabel}
              className="mb-0"
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    placeholder={inputPlaceholder}
                    {...field}
                  />
                )}
              />
            </Form.Group>
            {type == "course" && (
              <Form.Group
                label={t("on_site.modal.course_type")}
                required
                className="!mb-0 mt-4 grid grid-cols-1"
              >
                <div className="mb-4">
                  <Controller
                    name={"type"}
                    control={control}
                    render={({ field: { value, ...field } }) => (
                      <label
                        className={classNames(
                          "w-full cursor-pointer rounded border px-4 py-4",
                          "flex items-center gap-2",
                          value === "online" ? "border-primary bg-primary-50" : "border-gray"
                        )}
                      >
                        <Form.Radio
                          id="type-online"
                          value="online"
                          checked={value === "online"}
                          label={
                            <div className="flex flex-col gap-[2px]">
                              <span
                                className={classNames("text-sm", value == "online" ? "text-black" : "text-gray-800")}
                              >
                                {t("on_site.modal.online")}
                              </span>
                              <span className="text-xs text-gray-700">{t("on_site.modal.online_subtitle")}</span>
                            </div>
                          }
                          {...field}
                        />
                      </label>
                    )}
                  />
                </div>
                {subscription?.plan?.slug !== Plans.ADVANCED ? (
                  <div className="flex select-none flex-col gap-[2px] rounded-lg bg-gray-200 p-4">
                    <span className={"text-black"}>{t("on_site.modal.on_site")}</span>
                    <span className="text-xs text-gray-700">{t("on_site.modal.on_site_subtitle")}</span>
                    <Button
                      className="mt-3 w-fit !bg-black !text-warning"
                      as={Link}
                      target="_blank"
                      href={"https://msaaq.com/plus/"}
                      iconAlign="end"
                      icon={<Icon children={<ArrowUpLeftIcon />} />}
                      rounded
                      children={t("msaaq_plus.button_text")}
                    />
                  </div>
                ) : (
                  <div>
                    <Controller
                      name={"type"}
                      control={control}
                      render={({ field: { value, ...field } }) => (
                        <label
                          className={classNames(
                            "w-full cursor-pointer rounded border px-4 py-4",
                            "flex items-center gap-2",
                            value === "on_site" ? "border-primary bg-primary-50" : "border-gray"
                          )}
                        >
                          <Form.Radio
                            id="type-onsite"
                            value="on_site"
                            checked={value === "on_site"}
                            label={
                              <div className="flex flex-col gap-[2px]">
                                <span
                                  className={classNames("text-sm", value == "on_site" ? "text-black" : "text-gray-800")}
                                >
                                  {t("on_site.modal.on_site")}
                                </span>
                                <span className="text-xs text-gray-700">{t("on_site.modal.on_site_subtitle")}</span>
                              </div>
                            }
                            {...field}
                          />
                        </label>
                      )}
                    />
                  </div>
                )}
              </Form.Group>
            )}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={submitButtonText}
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
export default CreateNewModal;
