import React, { ChangeEvent, useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Layout } from "@/components";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useCreateContentMutation, useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import { APIActionResponse, Assignment, Content } from "@/types";

import { Editor, FULL_TOOLBAR_BUTTONS, Form, SingleFile, Typography, useAbjad } from "@msaaqcom/abjad";

export type IAssignmentFormInputs = {
  title: string;
  premium: boolean;
  type: string;
  meta: {
    content: string;
    file?: Array<SingleFile>;
  };
};

interface IProps {
  defaultValues?: IAssignmentFormInputs | any;
}

export default function AssignmentForm({ defaultValues = {} }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const {
    query: { courseId, chapterId, contentId, sort }
  } = router;

  const [createContentMutation] = useCreateContentMutation();
  const [updateContentMutation] = useUpdateContentMutation();
  const abjad = useAbjad();

  const schema = yup
    .object({
      title: yup.string().trim().required(),
      premium: yup.boolean(),
      meta: yup.object({
        content: yup.string().trim().required(),
        file: yup.mixed().nullable()
      })
    })
    .required();

  const form = useForm<IAssignmentFormInputs>({
    defaultValues: {
      premium: true
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch
  } = form;

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues.temp_values) {
      reset({
        title: defaultValues?.title,
        premium: defaultValues?.premium,
        meta: {
          content: defaultValues?.meta?.content,
          file: defaultValues?.meta?.file ? [defaultValues?.meta?.file] : []
        }
      });

      abjad.setEditorPlugin("plugins.image.uploadURL", `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/temp-media`);
      abjad.setEditorPlugin("plugins.image.paramName", "file");
    }
  }, [defaultValues]);

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues.temp_values) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: defaultValues?.title ?? "" });
      }
    }
  }, [watch("title")]);

  const onSubmit: SubmitHandler<IAssignmentFormInputs> = async (data) => {
    const mutation = contentId ? updateContentMutation : createContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: {
        ...data,
        meta: {
          ...data.meta,
          file: data.meta.file?.map((file) => file.file).pop()
        },
        type: "assignment",
        sort: defaultValues?.sort ?? sort ?? 999,
        premium: Boolean(data.premium)
      }
    })) as APIActionResponse<Content<Assignment>>;

    if (displayErrors(content)) {
      return;
    } else {
      displaySuccess(content);
      dispatch({ type: "app/setLastEditedChapterId", payload: chapterId });
      await router.push({
        pathname: `/courses/[courseId]/chapters`,
        query: { courseId, success: true }
      });
    }
  };

  return (
    <AddonController addon="assessments">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Layout.FormGrid
          sidebar={
            <Layout.FormGrid.Actions
              product={defaultValues}
              redirect={`/courses/${courseId}/chapters`}
              form={form}
            />
          }
        >
          <Form.Group
            label={t("contents.assignment.title")}
            required
            errors={errors.title?.message}
          >
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("contents.assignment.title_input_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            label={t("contents.assignment.description")}
            required
            errors={errors.meta?.content?.message}
          >
            <Controller
              name={"meta.content"}
              control={control}
              render={({ field: { onChange } }) => (
                <Editor
                  toolbar={FULL_TOOLBAR_BUTTONS}
                  defaultValue={defaultValues?.meta?.content}
                  placeholder={t("contents.assignment.description_input_placeholder")}
                  onChange={(value) => {
                    onChange(value);
                  }}
                />
              )}
            />
          </Form.Group>
          <Form.Group
            label={t("contents.files.input_label")}
            errors={errors.meta?.file?.message}
          >
            <Controller
              name="meta.file"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Form.File
                  value={value}
                  accept={[
                    "video/mp4",
                    "video/quicktime",
                    "video/x-msvideo",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/pdf",
                    "audio/mp3",
                    "image/png",
                    "application/zip",
                    "application/x-zip-compressed",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/msword"
                  ]}
                  maxFiles={1}
                  onChange={(files) => {
                    if (files.length) {
                      onChange(files);
                    }
                  }}
                  {...rest}
                />
              )}
            />
          </Form.Group>
          <div className="mt-4">
            <div className="relative py-12">
              <div className="border-grey-500 border" />
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 px-6 py-3">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  children={t("contents.extra_settings")}
                />
              </div>
            </div>
            <Controller
              name="premium"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  value="premium"
                  checked={value === false}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    onChange(!event.target.checked);
                  }}
                  label={t("contents.free_preview_label")}
                  description={t("contents.free_preview_description")}
                  {...rest}
                />
              )}
            />
          </div>
        </Layout.FormGrid>
      </Form>
    </AddonController>
  );
}
