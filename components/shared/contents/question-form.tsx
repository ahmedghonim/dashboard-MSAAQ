import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { isEmpty, sortBy } from "lodash";
import { useTranslation } from "next-i18next";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormSetValue,
  useFieldArray,
  useForm
} from "react-hook-form";
import * as yup from "yup";

import { Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { SortableList } from "@/components/SortableList";
import { Select } from "@/components/select";
import { useToast } from "@/components/toast";
import { useResponseToastHandler } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  useCreateQuestionMutation,
  useFetchQuestionsQuery,
  useUpdateQuestionMutation
} from "@/store/slices/api/questionsSlice";
import { APIActionResponse, BREAKPOINTS, Question } from "@/types";
import { classNames } from "@/utils";

import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button, Collapse, Editor, FULL_TOOLBAR_BUTTONS, Form, Icon, Typography, useAbjad } from "@msaaqcom/abjad";

interface Choice {
  content: string;
  credited: boolean | number;
  sort: number;
}

export type IFormInputs = {
  id: number;
  title: string;
  explanation: string;
  type: number | string;
  sort: number;
  choices: Array<Choice>;
  updated_at: string;
  created_at: string;
  select_question?: {
    label: string;
    value: number | string;
  };
};

const Choices = ({
  control,
  setValue,
  errors
}: {
  errors: FieldErrors<IFormInputs>;
  setValue: UseFormSetValue<IFormInputs>;
  control: Control<IFormInputs>;
}) => {
  const { t } = useTranslation();
  const { fields, move, remove, append } = useFieldArray({
    control,
    name: "choices"
  });

  return (
    <Form.Group
      label={t("contents.quiz.options")}
      className="mb-0"
      required
      errors={errors.choices?.message}
    >
      <div className="flex flex-col space-y-6">
        <SortableList
          items={fields}
          onChange={(item1, item2) => {
            move(item1, item2);
          }}
          renderItem={(item, index, dragOverlay) => (
            <Collapse
              disabled
              defaultOpen
              className={classNames("transform rounded-lg", dragOverlay ? "-rotate-1 border-gray-400" : "rotate-0")}
              key={`choices-${index}`}
            >
              {({ toggle, close }) => (
                <>
                  <Collapse.Button
                    as={"div"}
                    prepend={<SortableList.DragHandle />}
                    onClick={() => {
                      return null;
                    }}
                    append={
                      <>
                        <Button
                          variant="danger"
                          ghost
                          size="sm"
                          icon={
                            <Icon size="sm">
                              <TrashIcon />
                            </Icon>
                          }
                          onClick={() => remove(index)}
                        />
                      </>
                    }
                    className="bg-primary-100"
                  >
                    <Typography.Paragraph
                      as="span"
                      size="md"
                      weight="medium"
                    >
                      {t("contents.quiz.option")} #{index + 1}
                    </Typography.Paragraph>
                  </Collapse.Button>
                  <Collapse.Content className="bg-primary-100 px-4 pb-4">
                    <Form.Group
                      required
                      errors={errors.choices?.[index]?.content?.message}
                    >
                      <Controller
                        name={`choices.${index}.content`}
                        control={control}
                        render={({ field: { onChange, ...rest } }) => (
                          <Editor
                            toolbar={FULL_TOOLBAR_BUTTONS}
                            defaultValue={item.content}
                            placeholder={t("contents.quiz.add_new_option_placeholder")}
                            {...rest}
                            onChange={(value) => {
                              onChange(value);
                            }}
                          />
                        )}
                      />
                    </Form.Group>
                    <Form.Group className="mb-0">
                      <Controller
                        render={({ field: { name, onChange, value, ...rest } }) => (
                          <Form.Radio
                            id={`choices.${index}.credited`}
                            name={`choices.${index}.credited`}
                            value={1}
                            checked={Boolean(value)}
                            onChange={() => {
                              fields.map((choice, fieldIndex) => {
                                if (index === fieldIndex) {
                                  setValue(`choices.${fieldIndex}.credited`, true);
                                } else {
                                  setValue(`choices.${fieldIndex}.credited`, false);
                                }
                              });
                            }}
                            label={t("contents.quiz.mark_as_correct_answer")}
                            {...rest}
                          />
                        )}
                        name={`choices.${index}.credited`}
                        control={control}
                      />
                    </Form.Group>
                  </Collapse.Content>
                </>
              )}
            </Collapse>
          )}
        />
      </div>
      <Button
        ghost
        size="lg"
        className="ml-auto mt-6"
        onClick={() => {
          append({ content: "", credited: false, sort: 0 });
        }}
        children={t("contents.quiz.add_new_option")}
      />
    </Form.Group>
  );
};

const defaultChoice = {
  content: "",
  sort: 0,
  credited: false
};

export default function QuestionForm({
  defaultValues,
  type = "quiz"
}: {
  defaultValues: any;
  type?: "quiz" | "question_bank";
}) {
  const { t } = useTranslation();
  const { displaySuccess } = useResponseToastHandler({});
  const [toast] = useToast();
  const isXS = useMediaQuery(BREAKPOINTS.xs);
  const router = useRouter();
  const {
    query: { quizId, courseId, contentId, chapterId, questionId }
  } = router;

  const abjad = useAbjad();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const { data: questionsData } = useFetchQuestionsQuery({
    quizId: quizId as string,
    params: {
      filters: {
        status: "published"
      }
    }
  });

  useEffect(() => {
    if (questionsData) {
      setQuestions(sortBy(questionsData.data, "sort"));
    }
  }, [questionsData]);

  useEffect(() => {
    if (type == "question_bank") {
      setPathName(`/quizzes/bank/[quizId]/questions`);
    } else {
      setPathName(`/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/quiz/builder`);
    }
  }, [type]);

  const schema = yup.object().shape({
    title: yup.string().required(),
    choices: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            content: yup.string().required(),
            credited: yup.boolean().required()
          })
          .required()
      )
      .min(2)
      .test(
        "at least one choice should be credited",
        t("validation.at_least_one_choice_should_be_selected"),
        (value) => {
          if (!value) return false;
          const creditedChoices = value.filter((choice) => choice.credited === true);
          return creditedChoices.length >= 1;
        }
      )
      .required()
  });
  const form = useForm<IFormInputs>({
    defaultValues: {
      choices: [defaultChoice]
    },
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    reset
  } = form;

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        ...(questionId && {
          select_question: {
            label: t("quiz.question.question_index", {
              index: questions.findIndex((question) => question.id === Number(questionId)) + 1
            }),
            value: questionId as string
          }
        }),
        title: defaultValues.title,
        explanation: defaultValues.explanation,
        type: defaultValues.type,
        sort: defaultValues.sort,
        choices: defaultValues.choices,
        updated_at: defaultValues.updated_at,
        created_at: defaultValues.created_at
      });
    }
    abjad.setEditorPlugin("plugins.image.uploadURL", `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/temp-media`);
    abjad.setEditorPlugin("plugins.image.paramName", "file");
  }, [defaultValues, questions]);

  const [createQuestionMutation] = useCreateQuestionMutation();
  const [updateQuestionMutation] = useUpdateQuestionMutation();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (
      !(await confirm({
        variant: "warning",
        bgColor: "warning",
        okLabel: t("contents.quiz.error.ok_label"),
        cancelLabel: t("contents.quiz.error.cancel_label"),
        title: t("contents.quiz.error.title"),
        children: t("contents.quiz.error.body")
      }))
    ) {
      return;
    }

    const mutation = questionId ? updateQuestionMutation : createQuestionMutation;
    const content = (await mutation({
      quizId: quizId as string,
      questionId: questionId as string,
      data: {
        ...data,
        choices: data.choices.map((choice) => ({
          ...choice,
          sort: data.choices.indexOf(choice) + 1,
          credited: choice.credited ? 1 : 0
        })),
        sort: defaultValues?.sort ?? 999,
        type: 1
      }
    })) as APIActionResponse<Question>;

    if (content?.error) {
      toast.warning({
        ...(isXS && { position: "bottom-center" }),
        message: content.error.message,
        toastId: "content-error",
        ...(content?.error.status == 422 && {
          title: content.error.title,
          closeOnClick: false,
          dismissible: false,
          draggable: false,
          actions: (
            <Button
              className="!pointer-events-auto z-10"
              onClick={() => {
                toast.dismiss("content-error");
              }}
              variant={"warning"}
            >
              {t("contents.quiz.error.understood")}
            </Button>
          )
        })
      });
      return;
    } else {
      displaySuccess(content);
      if (type === "question_bank") {
        router.push({
          pathname: pathname,
          query: {
            quizId
          }
        });
      } else {
        router.push({
          pathname: pathname,
          query: {
            ...(courseId ? { courseId } : {}),
            ...(chapterId ? { chapterId } : {}),
            ...(contentId ? { contentId } : {})
          }
        });
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Layout.FormGrid
        sidebar={
          <Layout.FormGrid.Actions
            product={defaultValues}
            redirect={type == "question_bank" ? `/quizzes/bank/${quizId}/questions` : `/courses/${courseId}/chapters`}
            form={form}
          />
        }
      >
        <div className="mb-6 flex items-center gap-4">
          <Button
            className="h-12 flex-shrink-0"
            variant="default"
            disabled={questionId ? questions.findIndex((question) => question.id === Number(questionId)) === 0 : true}
            onClick={() => {
              if (type == "question_bank") {
                router.push({
                  pathname: `/quizzes/bank/[quizId]/questions/[questionId]/edit`,
                  query: {
                    quizId,
                    questionId: questions[questions.findIndex((question) => question.id === Number(questionId)) - 1].id
                  }
                });
              } else {
                router.push({
                  pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/quiz/[quizId]/questions/[questionId]/edit`,
                  query: {
                    courseId,
                    chapterId,
                    contentId,
                    quizId,
                    questionId: questions[questions.findIndex((question) => question.id === Number(questionId)) - 1].id
                  }
                });
              }
            }}
            children={t("quiz.question.previous_question")}
            icon={
              <Icon>
                <ArrowLeftIcon className="ltr:block rtl:hidden" />
                <ArrowRightIcon className="ltr:hidden rtl:block" />
              </Icon>
            }
          />

          <Controller
            name="select_question"
            control={control}
            render={({ field }) => (
              <Select
                className="h-12"
                options={questions.map((question, index) => ({
                  label: t("quiz.question.question_index", { index: index + 1 }),
                  value: question.id
                }))}
                {...field}
                onChange={(option) => {
                  if (type == "question_bank") {
                    router.push({
                      pathname: `/quizzes/bank/[quizId]/questions/[questionId]/edit`,
                      query: {
                        quizId,
                        questionId: option.value
                      }
                    });
                  } else {
                    router.push({
                      pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/quiz/[quizId]/questions/[questionId]/edit`,
                      query: {
                        courseId,
                        chapterId,
                        contentId,
                        quizId,
                        questionId: option.value
                      }
                    });
                  }
                  field.onChange(option);
                }}
              />
            )}
          />
          <Button
            className="h-12 flex-shrink-0"
            variant="default"
            disabled={
              questionId
                ? questions.findIndex((question) => question.id === Number(questionId)) === questions.length - 1
                : true
            }
            onClick={() => {
              if (type == "question_bank") {
                router.push({
                  pathname: `/quizzes/bank/[quizId]/questions/[questionId]/edit`,
                  query: {
                    quizId,
                    questionId: questions[questions.findIndex((question) => question.id === Number(questionId)) + 1].id
                  }
                });
              } else {
                router.push({
                  pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/quiz/[quizId]/questions/[questionId]/edit`,
                  query: {
                    courseId,
                    chapterId,
                    contentId,
                    quizId,
                    questionId: questions[questions.findIndex((question) => question.id === Number(questionId)) + 1].id
                  }
                });
              }
            }}
            children={t("quiz.question.next_question")}
            iconAlign="end"
            icon={
              <Icon>
                <ArrowLeftIcon className="ltr:hidden rtl:block" />
                <ArrowRightIcon className="ltr:block rtl:hidden" />
              </Icon>
            }
          />
        </div>
        <div>
          <div>
            <Form.Group
              label={t("contents.quiz.question")}
              required
              errors={errors.title?.message}
            >
              <Controller
                name={"title"}
                control={control}
                render={({ field: { onChange } }) => (
                  <Editor
                    toolbar={FULL_TOOLBAR_BUTTONS}
                    defaultValue={defaultValues?.title}
                    placeholder={t("contents.quiz.question_input_placeholder")}
                    onChange={(value) => {
                      onChange(value);
                    }}
                  />
                )}
              />
            </Form.Group>
            <Form.Group
              label={t("contents.quiz.question_explanation")}
              help={t("contents.quiz.question_explanation_help")}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("contents.quiz.question_explanation_input_placeholder")}
                    {...field}
                  />
                )}
                name={`explanation`}
                control={control}
              />
            </Form.Group>
            <Choices
              errors={errors}
              setValue={setValue}
              control={control}
            />
          </div>
        </div>
      </Layout.FormGrid>
    </Form>
  );
}
