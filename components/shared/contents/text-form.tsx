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
import { APIActionResponse, Content, Text } from "@/types";

import { Editor, Form, Typography } from "@msaaqcom/abjad";

export type ITextFormInputs = {
  title: string;
  premium: boolean;
  meta: {
    content: string;
  };
};

interface IProps {
  defaultValues?: ITextFormInputs | any;
}

export default function TextForm({ defaultValues = {} }: IProps) {
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
        content: yup.string().nullable().required()
      })
    })
    .required();

  const form = useForm<ITextFormInputs>({
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
          content: defaultValues?.meta?.content
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

  const onSubmit: SubmitHandler<ITextFormInputs> = async (data) => {
    const mutation = contentId ? updateContentMutation : createContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: {
        ...data,
        type: "text",
        sort: defaultValues?.sort ?? sort ?? 999
      }
    })) as APIActionResponse<Content<Text>>;

    if (displayErrors(content)) return;

    displaySuccess(content);

    dispatch({ type: "app/setLastEditedChapterId", payload: chapterId });
    await router.push({
      pathname: `/courses/[courseId]/chapters`,
      query: { courseId, success: true }
    });
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
          label={t("contents.text.title")}
          required
          errors={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Form.Input
                placeholder={t("contents.text.title_input_placeholder")}
                {...field}
              />
            )}
          />
        </Form.Group>

        <Form.Group
          label={t("contents.text.content")}
          required
          errors={errors.meta?.content?.message}
        >
          <Controller
            name="meta.content"
            control={control}
            render={({ field: { value, ...rest } }) => (
              <Editor
                placeholder={t("contents.text.content_input_placeholder")}
                defaultValue={defaultValues?.meta?.content}
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
