import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
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

import { loadQuizzes } from "@/actions/options";
import { AddonController, Layout } from "@/components";
import { Select } from "@/components/select";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useCreateContentMutation, useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import { APIActionResponse, Content, Quiz } from "@/types";
import { classNames, randomUUID } from "@/utils";

import { ChevronUpIcon, EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

import { Button, Collapse, Dropdown, Form, Icon, Modal, Typography } from "@msaaqcom/abjad";

interface Choice {
  content: string;
  sort: number;
}

interface Question {
  title: string;
  explanation: string;
  sort: number;
  choices: Array<Choice>;
  defaultOpen?: boolean;
}

export type SurveyFormInputs = {
  title: string;
  summary: string;
  premium: boolean;
  meta: {
    type: string;
    enable_duration: boolean;
    duration: number;
    questions: Array<Question>;
  };
};

const Choices = ({
  control,
  questionIndex,
  setValue,
  errors
}: {
  errors: FieldErrors<SurveyFormInputs>;
  setValue: UseFormSetValue<SurveyFormInputs>;
  control: Control<SurveyFormInputs>;
  questionIndex: number;
}) => {
  const { t } = useTranslation();
  const { fields, remove, append } = useFieldArray({
    control,
    name: `meta.questions.${questionIndex}.choices`
  });

  return (
    <Form.Group
      label={t("contents.survey.options")}
      className="mb-0"
      required
      errors={errors.meta?.questions?.[questionIndex]?.choices?.message}
    >
      <div className="flex flex-col space-y-6">
        {fields.map((choice, choiceIndex) => (
          <Collapse
            disabled
            defaultOpen
            key={choice.id}
          >
            <Collapse.Button
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
                    onClick={() => remove(choiceIndex)}
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
                {t("contents.survey.option")} #{choiceIndex + 1}
              </Typography.Paragraph>
            </Collapse.Button>
            <Collapse.Content className="bg-primary-100 px-4 pb-4">
              <Form.Group
                required
                errors={errors.meta?.questions?.[questionIndex]?.choices?.[choiceIndex]?.content?.message}
              >
                <Controller
                  name={`meta.questions.${questionIndex}.choices.${choiceIndex}.content`}
                  control={control}
                  render={({ field }) => (
                    <Form.Textarea
                      placeholder={t("contents.survey.option_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Collapse.Content>
          </Collapse>
        ))}
      </div>
      <Button
        ghost
        size="lg"
        className="ml-auto mt-6"
        onClick={() => {
          append({ content: "", sort: 0 });
        }}
        children={t("contents.survey.add_new_option")}
      />
    </Form.Group>
  );
};
const defaultChoice = {
  content: "",
  sort: 0
};
const defaultQuestion = {
  title: "",
  explanation: "",
  sort: 0,
  choices: [defaultChoice]
};

interface IProps {
  defaultValues?: SurveyFormInputs | any;
}

export default function QuizForm({ defaultValues = {} }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [showDuplicateQuizModal, setShowDuplicateQuizModal] = useState(false);

  const [duplicatedQuiz, setDuplicatedQuiz] = useState<Quiz | null>(null);

  const {
    query: { courseId, chapterId, contentId, sort }
  } = router;

  const [createContentMutation] = useCreateContentMutation();
  const [updateContentMutation] = useUpdateContentMutation();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    summary: yup.string().min(3).required(),
    premium: yup.boolean(),
    meta: yup.object().shape({
      randomised: yup.boolean(),
      show_results_at_end: yup.boolean(),
      allow_question_navigation: yup.boolean(),
      duration: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .min(0)
        .max(300)
        .nullable(),
      passing_score: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .min(0)
        .max(100)
        .nullable(),
      questions: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              title: yup.string().required(),
              choices: yup
                .array()
                .of(
                  yup
                    .object()
                    .shape({
                      content: yup.string().required()
                    })
                    .required()
                )
                .min(1)
                .required()
            })
            .required()
        )
        .min(1)
        .required()
    })
  });

  const form = useForm<SurveyFormInputs>({
    defaultValues: {
      meta: {
        duration: 0,
        questions: [
          {
            ...defaultQuestion,
            defaultOpen: true
          }
        ]
      }
    },
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
    control,
    reset,
    watch,
    getValues
  } = form;

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
    insert: insertQuestion,
    update
  } = useFieldArray({
    name: "meta.questions",
    control
  });

  const closeAllQuestions = useCallback(() => {
    getValues("meta.questions").map((question, index) => {
      update(index, { ...question, defaultOpen: false });
    });
  }, []);

  const handleAddQuestion = useCallback(() => {
    closeAllQuestions();
    appendQuestion({ ...defaultQuestion, defaultOpen: true });
  }, []);

  const handleDuplicateQuestion = useCallback((index: number) => {
    closeAllQuestions();
    const question = getValues(`meta.questions.${index}`);
    insertQuestion(index + 1, { ...question, defaultOpen: true });
  }, []);

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues.temp_values) {
      reset({
        title: defaultValues?.title,
        summary: defaultValues?.summary,
        meta: {
          enable_duration: defaultValues?.meta?.duration > 0,
          duration: defaultValues?.meta?.duration,
          questions: defaultValues?.meta?.questions
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

  useEffect(() => {
    setValue("meta.duration", watch("meta.enable_duration") ? watch("meta.duration") : 0, {
      shouldDirty: true
    });
  }, [watch("meta.enable_duration")]);

  const resetStateValues = () => {
    setShowDuplicateQuizModal(false);
    setDuplicatedQuiz(null);
  };

  const duplicateQuizHandler = useCallback(() => {
    if (!duplicatedQuiz) return;

    setValue("title", duplicatedQuiz.title, { shouldDirty: true });
    setValue("summary", duplicatedQuiz.summary, { shouldDirty: true });
    setValue("meta.enable_duration", duplicatedQuiz.duration > 0, { shouldDirty: true });
    setValue("meta.duration", duplicatedQuiz.duration, { shouldDirty: true });
    setValue("meta.questions", duplicatedQuiz.questions, { shouldDirty: true });

    resetStateValues();
  }, [duplicatedQuiz]);

  const onSubmit: SubmitHandler<SurveyFormInputs> = async (data) => {
    data.meta.questions = data.meta.questions.map((question) => {
      const updatedQuestion = Object.assign({}, question);
      delete updatedQuestion.defaultOpen;
      return updatedQuestion;
    });

    const mutation = contentId ? updateContentMutation : createContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: {
        ...data,
        sort: defaultValues?.sort ?? sort ?? 999,
        type: "survey",
        premium: false,
        meta: {
          ...omit(data.meta, ["enable_duration"]),
          type: "survey"
        }
      }
    })) as APIActionResponse<Content<Quiz>>;

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
          label={t("contents.survey.title")}
          required
          errors={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Form.Input
                placeholder={t("contents.survey.title_input_placeholder")}
                {...field}
              />
            )}
          />
        </Form.Group>
        <Form.Group
          label={t("contents.survey.summary")}
          required
          errors={errors.summary?.message}
        >
          <Controller
            name={"summary"}
            control={control}
            render={({ field }) => (
              <Form.Textarea
                placeholder={t("contents.survey.summary_placeholder")}
                rows={4}
                {...field}
              />
            )}
          />
        </Form.Group>
        <div className="flex flex-col">
          <div className="flex flex-col space-y-4">
            {questions.map((item, index) => {
              return (
                <Collapse
                  key={item.id}
                  defaultOpen={item.defaultOpen}
                >
                  {({ isOpen, toggle }) => (
                    <>
                      <Collapse.Button
                        append={
                          <>
                            <div className="flex items-center">
                              <Button
                                variant="default"
                                children={t("duplicate")}
                                onClick={() => handleDuplicateQuestion(index)}
                              />
                              <Dropdown>
                                <Dropdown.Trigger>
                                  <Button
                                    variant="default"
                                    icon={
                                      <Icon size="md">
                                        <EllipsisHorizontalIcon />
                                      </Icon>
                                    }
                                    className="mx-4"
                                  />
                                </Dropdown.Trigger>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    children={t("contents.survey.delete_question")}
                                    className="text-danger"
                                    iconAlign="end"
                                    icon={
                                      <Icon
                                        className="text-danger"
                                        size="sm"
                                      >
                                        <TrashIcon />
                                      </Icon>
                                    }
                                    onClick={() => removeQuestion(index)}
                                  />
                                </Dropdown.Menu>
                              </Dropdown>
                              <Button
                                variant="default"
                                ghost
                                onClick={toggle}
                                icon={
                                  <Icon
                                    className={`${
                                      isOpen ? "rotate-180 transform" : ""
                                    } transition-all duration-300 ease-in-out`}
                                  >
                                    <ChevronUpIcon />
                                  </Icon>
                                }
                              />
                            </div>
                          </>
                        }
                        className={classNames(isOpen ? "border bg-primary-50" : "border border-gray  bg-white")}
                      >
                        <div className="flex flex-grow flex-row justify-between">
                          <div className="flex items-center">
                            <Typography.Paragraph
                              as="span"
                              size="md"
                              weight="medium"
                            >
                              {t("contents.survey.question")} #{index + 1}
                            </Typography.Paragraph>
                          </div>
                        </div>
                      </Collapse.Button>
                      <Collapse.Content className="bg-primary-50 p-4">
                        <Form.Group
                          label={t("contents.survey.question")}
                          required
                          errors={errors.meta?.questions?.[index]?.title?.message}
                        >
                          <Controller
                            name={`meta.questions.${index}.title`}
                            control={control}
                            render={({ field }) => (
                              <Form.Textarea
                                placeholder={t("contents.survey.question_placeholder")}
                                {...field}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group label={t("contents.survey.question_explanation")}>
                          <Controller
                            render={({ field }) => (
                              <Form.Input
                                placeholder={t("contents.survey.question_explanation_input_placeholder")}
                                {...field}
                              />
                            )}
                            name={`meta.questions.${index}.explanation`}
                            control={control}
                          />
                        </Form.Group>
                        <Choices
                          errors={errors}
                          setValue={setValue}
                          control={control}
                          questionIndex={index}
                        />
                      </Collapse.Content>
                    </>
                  )}
                </Collapse>
              );
            })}
          </div>
          <Button
            className="mx-auto mt-6"
            onClick={handleAddQuestion}
            icon={
              <Icon>
                <PlusCircleIcon />
              </Icon>
            }
          >
            {t("contents.survey.add_new_question")}
          </Button>
        </div>
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

          <Form.Group>
            <Controller
              render={({ field: { value, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  label={t("contents.survey.duration")}
                  description={t("contents.survey.duration_description")}
                  value={Number(value ?? 0)}
                  checked={value}
                  {...rest}
                >
                  {({ checked }) =>
                    checked && (
                      <Controller
                        render={({ field }) => (
                          <Form.Group
                            errors={errors.meta?.duration?.message}
                            className="mb-0"
                          >
                            <Form.Number
                              step={1}
                              min={0}
                              suffix={t("minute")}
                              placeholder="0"
                              className="my-2 md:w-1/2"
                              {...field}
                            />
                          </Form.Group>
                        )}
                        name={"meta.duration"}
                        control={control}
                      />
                    )
                  }
                </Form.Toggle>
              )}
              name={"meta.enable_duration"}
              control={control}
            />
          </Form.Group>
        </div>
      </Layout.FormGrid>
      <Modal
        open={showDuplicateQuizModal}
        onDismiss={resetStateValues}
        size="lg"
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("contents.survey.duplicate_modal.title")}</Modal.HeaderTitle>
        </Modal.Header>
        <Modal.Body>
          <Modal.Content>
            <Form.Group
              label={t("contents.survey.duplicate_modal.select_label")}
              className="mb-0"
            >
              <Select
                placeholder={t("contents.survey.duplicate_modal.select_label_placeholder")}
                loadOptions={(inputValue, callback) => {
                  loadQuizzes(inputValue, callback, {
                    cache_key: randomUUID()
                  });
                }}
                onChange={(option) => {
                  setDuplicatedQuiz(option ?? null);
                }}
              />
            </Form.Group>
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="gap-x-2">
          <Button
            size="lg"
            children={t("duplicate")}
            onClick={duplicateQuizHandler}
            disabled={!isValid || isSubmitting}
          />
          <Button
            variant="dismiss"
            size="lg"
            children={t("cancel")}
            onClick={resetStateValues}
          />
        </Modal.Footer>
      </Modal>
    </Form>
  );
}
