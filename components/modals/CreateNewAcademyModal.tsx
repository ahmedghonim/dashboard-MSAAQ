import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AuthContext } from "@/contextes";
import { GTM_EVENTS, useGTM, useResponseToastHandler } from "@/hooks";
import { useCreateAcademyMutation } from "@/store/slices/api/academySlice";
import { APIActionResponse, Academy } from "@/types";
import { slugify } from "@/utils";

import { Button, Form, Modal, ModalProps, SingleFile } from "@msaaqcom/abjad";

interface IFormInputs {
  title: string;
  email: string;
  slug: string;
  description: string;
  favicon: Array<SingleFile>;
}

const CreateNewAcademyModal: FC<ModalProps> = ({ open, size = "lg", ...props }) => {
  const { t } = useTranslation();
  const { switchAcademy } = useContext(AuthContext);
  const [show, setShow] = useState<boolean>(false);
  const { sendGTMEvent } = useGTM();

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const [createAcademyMutation] = useCreateAcademyMutation();

  const schema = yup.object({
    title: yup.string().required(),
    slug: yup.string().required(),
    description: yup.string().required(),
    favicon: yup
      .array()
      .of(yup.mixed())
      .max(1, t("validation.field_file_max_files", { files: 1 }))
      .required()
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const academy = (await createAcademyMutation({
      title: data.title,
      meta_description: data.description,
      favicon: data.favicon?.map((file) => file.file).pop(),
      slug: data.slug,
      email: data.email
    })) as APIActionResponse<Academy>;

    if (displayErrors(academy)) return;

    displaySuccess(academy);

    sendGTMEvent(GTM_EVENTS.ACADEMY_CREATED, {
      id: academy.data.data.id,
      title: academy.data.data.title,
      domain: academy.data.data.domain
    });

    await switchAcademy(academy.data.data.id);

    setShow(false);
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("create_new_academy.title")} />
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content>
            <Form.Group
              errors={errors.title?.message}
              required
              label={t("create_new_academy.academy_title")}
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("create_new_academy.academy_title_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              errors={errors.email?.message}
              required
              label={t("create_new_academy.academy_email")}
              help={t("create_new_academy.academy_email_help")}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Input
                    type="email"
                    placeholder="reply@academy.com"
                    {...field}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("create_new_academy.academy_slug")}
              help={t("create_new_academy.academy_slug_help")}
              errors={errors.slug?.message}
            >
              <Controller
                name="slug"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <Form.Input
                    className="swipe-direction"
                    prepend={
                      <div
                        className="latin-text bg-gray px-4 py-3"
                        children=".msaaq.net"
                      />
                    }
                    placeholder={t("create_new_academy.academy_slug_placeholder")}
                    value={slugify(value)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const slug = slugify(event.target.value);
                      onChange(slug);
                    }}
                    {...rest}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("create_new_academy.favicon")}
              errors={errors.favicon?.message}
            >
              <Controller
                name={"favicon"}
                control={control}
                render={({ field: { onChange, ...rest } }) => (
                  <Form.File
                    accept={["image/*"]}
                    maxFiles={1}
                    onChange={(files: SingleFile[]) => {
                      if (files.length) {
                        onChange(files);
                      }
                    }}
                    {...rest}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("create_new_academy.description")}
              errors={errors.description?.message}
              className="mb-0"
            >
              <Controller
                name={"description"}
                control={control}
                render={({ field }) => (
                  <Form.Textarea
                    rows={5}
                    placeholder={t("create_new_academy.description_placeholder")}
                    {...field}
                  />
                )}
              />
            </Form.Group>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="lg"
            className="w-full"
            type="submit"
            children={t("add_new")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateNewAcademyModal;
