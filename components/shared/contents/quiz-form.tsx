import { ChangeEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { isEmpty } from "lodash";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { useToast } from "@/components/toast";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";
import { APIActionResponse, BREAKPOINTS, Choice, Content, QuestionBank, Quiz } from "@/types";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Alert, Badge, Button, Form, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

interface Question {
  id: number;
  title: string;
  explanation: string;
  sort: number;
  uuid?: number;
  defaultOpen?: boolean;
  choices: Array<Choice>;
}

export type QuizFormInputs = {
  title: string;
  premium: boolean;
  summary: string;
  questions: Question[];
  meta: {
    question_banks?: Array<QuestionBank>;
    randomised: boolean;
    enable_duration: boolean;
    duration: number;
    show_results_at_end: boolean;
    show_results: boolean;
    show_results_type?: "at_quiz_end" | "at_question_end" | null;
    allow_question_navigation: boolean;
    enable_passing_score: boolean;
    passing_score: number;
    questions: Array<Question>;
    id?: string;
  };
};

interface IProps {
  defaultValues?: QuizFormInputs | any;
}

export default function QuizForm({ defaultValues }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { courseId, chapterId, contentId }
  } = router;

  const dispatch = useAppDispatch();
  const [showSortedAlert, setShowSortedAlert] = useState(false);
  const { displaySuccess } = useResponseToastHandler({});
  const [toast] = useToast();
  const isXS = useMediaQuery(BREAKPOINTS.xs);

  const { data: currentQuiz = {} as Quiz, refetch } = useFetchQuizQuery(defaultValues?.meta?.id as string);

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    summary: yup.string().max(200).nullable().required(),
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
      question_banks: yup
        .array()
        .of(
          yup.object().shape({
            questions_count: yup.number().when("select_all", {
              is: false,
              then: yup
                .number()
                .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
                .min(1)
                .required()
            })
          })
        )
        .nullable()
        .required(),
      show_results: yup.boolean(),
      show_results_type: yup.string().nullable().when("show_results", {
        is: true,
        then: yup.string().nullable().required()
      })
    })
  });

  const form = useForm<QuizFormInputs>({
    mode: "onChange",
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
    if (!isEmpty(defaultValues)) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: defaultValues?.title ?? "" });
      }
    }
  }, [watch("title")]);

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      reset({
        title: defaultValues?.title,
        premium: defaultValues?.premium,
        summary: defaultValues?.summary,
        meta: {
          question_banks: currentQuiz?.question_banks,
          enable_duration: defaultValues?.meta?.duration > 0,
          show_results: defaultValues?.meta?.show_results,
          show_results_type: defaultValues?.meta.show_results_at_end ? "at_quiz_end" : "at_question_end",
          duration: defaultValues?.meta?.duration,
          enable_passing_score: defaultValues?.meta?.passing_score > 0,
          passing_score: defaultValues?.meta?.passing_score,
          randomised: defaultValues?.meta?.randomised,
          show_results_at_end: defaultValues?.meta?.show_results_at_end,
          allow_question_navigation: defaultValues?.meta?.allow_question_navigation
        }
      });
    }
  }, [defaultValues, currentQuiz]);

  const [updateContentMutation] = useUpdateContentMutation();

  useEffect(() => {
    if (showSortedAlert) {
      setTimeout(() => {
        setShowSortedAlert(false);
      }, 3000);
    }
  }, [showSortedAlert]);

  const onSubmit: SubmitHandler<QuizFormInputs> = async (data) => {
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

    const mutation = updateContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: {
        ...data,
        type: "quiz",
        premium: Boolean(data.premium),
        meta: {
          ...omit(data.meta, ["enable_duration", "enable_passing_score", "show_results_type"]),
          show_results: data.meta.show_results,
          duration: data.meta.enable_duration ? data.meta.duration : 0,
          show_results_at_end: data.meta.show_results
            ? data.meta.show_results_type == "at_quiz_end"
              ? true
              : false
            : false,
          question_banks: data.meta?.question_banks
            ? data.meta?.question_banks?.map((bank) => ({
                question_bank_id: bank.id as number,
                questions_count: bank.select_all
                  ? (bank.total_questions_count as number)
                  : (bank.questions_count as number)
              }))
            : null
        }
      }
    })) as APIActionResponse<Content<Quiz>>;

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

      dispatch({ type: "app/setLastEditedChapterId", payload: chapterId });
    }
  };

  return (
    <>
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
            label={t("contents.quiz.title")}
            required
            errors={errors.title?.message}
          >
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={t("contents.quiz.title_input_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>

          <Form.Group
            label={t("quizzes.quiz_summery")}
            errors={errors.summary?.message}
            required
          >
            <Controller
              name="summary"
              control={control}
              render={({ field: { value, ...rest } }) => {
                return (
                  <div className="relative mb-4 flex flex-col">
                    <Form.Textarea
                      placeholder={t("quizzes.quiz_summery_placeholder")}
                      value={value ?? ""}
                      rows={5}
                      maxLength={200}
                      {...rest}
                    />

                    <div className="absolute -bottom-6 left-0 flex gap-1">
                      <span className="text-xs text-gray-800">200</span>
                      <span className="text-xs text-gray-800">/</span>
                      <span className="text-xs">{value?.length ?? 0}</span>
                    </div>
                  </div>
                );
              }}
            />
          </Form.Group>

          <div
            className="pointer-events-none flex w-48 flex-row items-center rounded-full bg-gray-900 px-4 py-2 text-white transition-all duration-300"
            style={{
              position: "fixed",
              opacity: showSortedAlert ? 1 : 0,
              bottom: showSortedAlert ? "100px" : "-100px",
              left: "calc(50% - 105px)",
              transform: "translate(-50%, -50%)"
            }}
          >
            <Icon className="ltr:mr-2 rtl:ml-2">
              <CheckCircleIcon />
            </Icon>
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("all_changes_ware_saved")}
            />
          </div>
          <div className="mt-6">
            <div className="relative py-12">
              <div className="border-grey-500 border"></div>
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 px-6 py-3">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="medium"
                  children={t("contents.main_settings")}
                />
              </div>
            </div>
            <Form.Group>
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
            </Form.Group>

            <Form.Group errors={errors.meta?.passing_score?.message}>
              <AddonController addon="quizzes.passing-score">
                <Controller
                  render={({ field: { value, ...rest } }) => (
                    <Form.Checkbox
                      id={rest.name}
                      label={t("contents.quiz.passing_score")}
                      description={t("contents.quiz.passing_score_description")}
                      value={rest.name}
                      checked={value}
                      {...rest}
                    >
                      {({ checked }) =>
                        checked && (
                          <>
                            <Controller
                              name={"meta.passing_score"}
                              control={control}
                              render={({ field }) => (
                                <Form.Number
                                  step={1}
                                  min={0}
                                  suffix={t("percent")}
                                  placeholder="0"
                                  className="my-2 md:w-1/2"
                                  {...field}
                                />
                              )}
                            />
                            <Alert
                              className="md:w-3/4"
                              variant="default"
                              title={t("contents.quiz.passing_score_alert")}
                            />
                          </>
                        )
                      }
                    </Form.Checkbox>
                  )}
                  name={"meta.enable_passing_score"}
                  control={control}
                />
              </AddonController>
            </Form.Group>
            <Form.Group>
              <AddonController addon="quizzes.duration">
                <Controller
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      label={t("contents.quiz.duration")}
                      description={t("contents.quiz.duration_description")}
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
              </AddonController>
            </Form.Group>
          </div>
          <div className="mt-6">
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

            <Form.Group errors={errors.meta?.show_results?.message}>
              <AddonController addon="quizzes.show_results">
                <Controller
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      label={
                        <div className="flex items-center gap-2">
                          {t("contents.quiz.enable_show_results_label")}
                          <Tooltip>
                            <Tooltip.Trigger>
                              <Icon>
                                <ExclamationCircleIcon className="text-gray-600" />
                              </Icon>
                            </Tooltip.Trigger>
                            <Tooltip.Content>{t("contents.quiz.enable_show_results_tooltip")}</Tooltip.Content>
                          </Tooltip>
                          <Badge
                            className="mr-6"
                            variant="success"
                            size="xs"
                            rounded
                            children={t("new")}
                          />
                        </div>
                      }
                      value={rest.name}
                      checked={value}
                      {...rest}
                    >
                      {({ checked }) =>
                        checked && (
                          <>
                            <Form.Group
                              className="mt-6"
                              errors={errors.meta?.show_results_type?.message}
                            >
                              <Controller
                                name={"meta.show_results_type"}
                                control={control}
                                render={({ field: { value, ...rest } }) => (
                                  <Form.Radio
                                    id={"disable-show-results"}
                                    value={"at_question_end"}
                                    checked={value == "at_question_end"}
                                    label={t("contents.quiz.show_results_label")}
                                    description={t("contents.quiz.show_results_description")}
                                    {...rest}
                                  />
                                )}
                              />
                            </Form.Group>
                            <Form.Group errors={errors.meta?.show_results_type?.message}>
                              <Controller
                                name={"meta.show_results_type"}
                                control={control}
                                render={({ field: { value, ...rest } }) => (
                                  <Form.Radio
                                    id={"show-results-at-end"}
                                    value={"at_quiz_end"}
                                    checked={value == "at_quiz_end"}
                                    label={t("contents.quiz.show_results_at_end_label")}
                                    description={t("contents.quiz.show_results_at_end_description")}
                                    {...rest}
                                  />
                                )}
                              />
                            </Form.Group>
                          </>
                        )
                      }
                    </Form.Toggle>
                  )}
                  name={"meta.show_results"}
                  control={control}
                />
              </AddonController>
            </Form.Group>
            <Form.Group>
              <AddonController addon="quizzes.randomise">
                <Controller
                  name={"meta.randomised"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("contents.quiz.randomize_questions")}
                      description={t("contents.quiz.randomize_questions_description")}
                      {...rest}
                    />
                  )}
                />
              </AddonController>
            </Form.Group>

            <Form.Group>
              <AddonController addon="quizzes.allow_question_navigation">
                <Controller
                  name={"meta.allow_question_navigation"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={
                        <div className="flex items-center gap-2">
                          {t("contents.quiz.allow_question_navigation_label")}
                          <Badge
                            variant="success"
                            size="xs"
                            rounded
                            children={t("new")}
                          />
                        </div>
                      }
                      description={t("contents.quiz.allow_question_navigation_description")}
                      {...rest}
                    />
                  )}
                />
              </AddonController>
            </Form.Group>
          </div>
        </Layout.FormGrid>
      </Form>
    </>
  );
}
