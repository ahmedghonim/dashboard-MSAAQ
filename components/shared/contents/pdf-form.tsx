import React, { ChangeEvent, useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout } from "@/components";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useCreateContentMutation, useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import { APIActionResponse, Content, PDF } from "@/types";

import { Alert, Form, SingleFile, Typography } from "@msaaqcom/abjad";

export type IPdfFormInputs = {
  title: string;
  premium: boolean;
  type: string;
  meta: {
    file?: Array<SingleFile>;
  };
};

interface IProps {
  defaultValues?: IPdfFormInputs | any;
}

export default function PdfForm({ defaultValues = {} }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const {
    query: { courseId, chapterId, contentId, sort }
  } = router;

  const [createContentMutation] = useCreateContentMutation();
  const [updateContentMutation] = useUpdateContentMutation();

  const schema = yup
    .object({
      title: yup.string().required(),
      premium: yup.boolean(),
      meta: yup.object({
        file: yup
          .mixed()
          .required()
          //@ts-ignore
          .fileSize(100, t("validation.field_file_size_invalid", { size: "100MB" }))
          .fileType("application/pdf", t("validation.field_file_type_invalid", { type: "PDF" }))
      })
    })
    .required();

  const form = useForm<IPdfFormInputs>({
    defaultValues: {
      premium: true
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch
  } = form;

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues.temp_values) {
      reset({
        title: defaultValues?.title,
        premium: defaultValues?.premium,
        meta: {
          file: defaultValues?.meta?.file ? [defaultValues?.meta.file] : []
        }
      });
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

  const onSubmit: SubmitHandler<IPdfFormInputs> = async (data) => {
    const mutation = contentId ? updateContentMutation : createContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: {
        ...data,
        meta: {
          file: data.meta.file?.map((file) => file.file).pop()
        },
        type: "pdf",
        sort: defaultValues?.sort ?? sort ?? 999,
        premium: Boolean(data.premium)
      }
    })) as APIActionResponse<Content<PDF>>;

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
          label={t("contents.pdf.title")}
          required
          errors={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Form.Input
                placeholder={t("contents.pdf.title_input_placeholder")}
                {...field}
              />
            )}
          />
        </Form.Group>
        <Form.Group
          label={t("contents.pdf.add_pdf_file")}
          errors={errors.meta?.file?.message}
          required
          className="mb-0"
        >
          <Controller
            name={"meta.file"}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <Form.File
                value={value}
                accept={["application/pdf"]}
                maxFiles={1}
                maxSize={100}
                onChange={(files) => {
                  if (files.length) {
                    onChange(files);
                  }
                }}
                append={
                  <>
                    <Alert
                      variant="default"
                      className="mt-5"
                      dismissible
                      children={t("contents.pdf.add_pdf_file_alert", { size: 100 })}
                    />
                  </>
                }
                {...rest}
              />
            )}
          />
        </Form.Group>
        <div className="mt-4">
          <div className="relative py-12">
            <div className="border-grey-500 border"></div>
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
  );
}
