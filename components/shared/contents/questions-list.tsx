import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { isEmpty, sortBy } from "lodash";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, EmptyState, Layout } from "@/components";
import { confirm as confirmDelete } from "@/components/Alerts/Confirm";
import { SortableList } from "@/components/SortableQuestions";
import FilterGroup from "@/components/filter-group";
import ReplicateQuestionsModal from "@/components/modals/ReplicateQuestions";
import { useToast } from "@/components/toast";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import {
  useDeleteQuestionMutation,
  useFetchQuestionsQuery,
  useReplicateQuestionMutation,
  useSortQuestionsMutation,
  useUpdateQuestionMutation
} from "@/store/slices/api/questionsSlice";
import { useFetchQuizQuery } from "@/store/slices/api/quizzesSlice";
import { APIActionResponse, BREAKPOINTS, Choice, Content, QuestionBank, Quiz } from "@/types";
import { classNames, stripHtmlTags } from "@/utils";

import {
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

import { Button, Collapse, Dropdown, Form, Icon, Typography } from "@msaaqcom/abjad";

import QuizBank from "./quiz-bank";

const LoadingCard = () => {
  return (
    <div className="flex gap-4">
      <div className="mb-6 w-full">
        <div className=" animate-pulse">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="h-14 w-full rounded bg-gray"></div>
            <div className="h-14 w-full rounded bg-gray"></div>
            <div className="h-14 w-full rounded bg-gray"></div>
            <div className="h-14 w-full rounded bg-gray"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Question {
  id: number;
  title: string;
  explanation: string;
  sort: number;
  uuid?: number;
  defaultOpen?: boolean;
  choices: Array<Choice>;
  answers_count?: number;
}

type QuizFormInputs = {
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

export default function QuestionList({ defaultValues }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { courseId, chapterId, contentId }
  } = router;

  const dispatch = useAppDispatch();
  const [showSortedAlert, setShowSortedAlert] = useState(false);
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const [toast] = useToast();
  const isXS = useMediaQuery(BREAKPOINTS.xs);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [filter, setFilter] = useState<string>("published");

  const { data: questionsData, isLoading } = useFetchQuestionsQuery({
    quizId: defaultValues?.meta.id as string,
    params: {
      filters: {
        status: filter
      }
    }
  });

  useEffect(() => {
    if (questionsData) {
      setQuestions(sortBy(questionsData?.data, "sort"));
    }
  }, [questionsData, filter]);

  const schema = yup.object().shape({
    meta: yup.object().shape({
      question_banks: yup
        .array()
        .of(
          yup.object().shape({
            questions_count: yup
              .number()
              .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
              .min(1)
              .when("select_all", {
                is: false,
                then: yup
                  .number()
                  .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
                  .min(1)
                  .max(yup.ref("total_questions_count"), t("quiz.question.max_questions_count"))
                  .required()
              })
          })
        )
        .nullable()
        .required()
    })
  });

  const [replicate] = useReplicateQuestionMutation();

  const replicateQuestion = async (quizId: string | number, questionId: string | number) => {
    const question = (await replicate({
      quizId: quizId,
      questionId: questionId
    })) as APIActionResponse<Question>;

    if (question.error) {
      toast.warning({
        ...(isXS && { position: "bottom-center" }),
        message: question.error.message,
        toastId: "content-error",
        ...(question?.error.status == 422 && {
          title: question.error.title,
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
      displaySuccess(question);
    }
  };

  const form = useForm<QuizFormInputs>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
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

  const { data: currentQuiz, refetch } = useFetchQuizQuery(defaultValues.meta.id);

  useEffect(() => {
    if (!isEmpty(defaultValues) && !isEmpty(currentQuiz)) {
      reset({
        title: defaultValues?.title,
        premium: defaultValues?.premium,
        summary: defaultValues?.summary,
        meta: {
          question_banks: currentQuiz.question_banks
            ? currentQuiz?.question_banks.map((bank: QuestionBank) => ({
                ...bank,
                select_all: bank.questions_count === bank.total_questions_count,
                questions_count: bank.questions_count ?? bank.total_questions_count
              }))
            : [],
          enable_duration: defaultValues?.meta?.duration > 0,
          duration: defaultValues?.meta?.duration,
          enable_passing_score: defaultValues?.meta?.passing_score > 0,
          passing_score: defaultValues?.meta?.passing_score,
          randomised: defaultValues?.meta?.randomised,
          show_results_at_end: defaultValues?.meta?.show_results_at_end,
          show_results: defaultValues?.meta?.show_results,
          allow_question_navigation: defaultValues?.meta?.allow_question_navigation
        }
      });
    }
  }, [defaultValues, currentQuiz]);

  const [deleteQuestionMutation] = useDeleteQuestionMutation();
  const onQuestionRemove = async (question: Question) => {
    if (
      await confirmDelete({
        children: t("quiz.question.delete_question_confirmation", {
          title: stripHtmlTags(question.title).split(" ").slice(0, 3).join(" ")
        }),
        title: t("quiz.question.delete_question"),
        okLabel: t("confirm_delete"),
        cancelLabel: t("cancel"),
        variant: "danger"
      })
    ) {
      const deleteQuestion = (await deleteQuestionMutation({
        quizId: defaultValues?.meta.id as any,
        id: question.id as any
      })) as APIActionResponse<any>;

      if (deleteQuestion.error) {
        toast.warning({
          ...(isXS && { position: "bottom-center" }),
          message: deleteQuestion.error.message,
          toastId: "content-error",
          ...(deleteQuestion?.error.status == 422 && {
            title: deleteQuestion.error.title,
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
        displaySuccess(deleteQuestion);
      }
    }
  };

  const [sortQuestionsMutation] = useSortQuestionsMutation();
  const [updateContentMutation] = useUpdateContentMutation();
  const [questionUpdate] = useUpdateQuestionMutation();

  const handleStatusUpdate = async (item: any, status: "published" | "archived") => {
    const updateStatus = (await questionUpdate({
      questionId: item.id,
      quizId: defaultValues.meta.id,
      data: {
        ...item,
        status
      }
    })) as APIActionResponse<Question>;

    if (displayErrors(updateStatus)) {
      return;
    }

    displaySuccess(updateStatus);
  };

  const handleSort = async (items: any) => {
    const sorted = items.map((item: any, index: number) => ({
      id: item.id,
      sort: index + 1
    }));

    setQuestions(
      sortBy(
        items.map((item: any, index: number) => ({
          ...item,
          sort: index + 1
        })),
        "sort"
      )
    );

    const questions = (await sortQuestionsMutation({
      id: defaultValues.meta.id as any,
      questions: sorted
    })) as APIActionResponse<Question>;
    if (displayErrors(questions)) {
      return;
    } else {
      setShowSortedAlert(true);
    }
  };

  useEffect(() => {
    if (showSortedAlert) {
      setTimeout(() => {
        setShowSortedAlert(false);
      }, 3000);
    }
  }, [showSortedAlert]);

  const onSubmit: SubmitHandler<QuizFormInputs> = async (data) => {
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
          ...omit(data.meta, ["enable_duration", "enable_passing_score"]),
          question_banks: data.meta?.question_banks
            ? data.meta?.question_banks?.map((bank, index) => ({
                question_bank_id: bank.id as number,
                questions_count: bank.select_all
                  ? (bank.total_questions_count as number)
                  : (bank.questions_count as number)
              }))
            : null
        }
      }
    })) as APIActionResponse<Content<Quiz>>;

    if (displayErrors(content)) {
      return;
    } else {
      displaySuccess(content);
      refetch();
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
          <div>
            <div className="mb-4 flex justify-between">
              <FilterGroup
                current_value={filter}
                filters={[
                  {
                    key: "published",
                    title: t("quiz.question.published"),
                    actions: {
                      onClick: () => {
                        setFilter("published");
                      }
                    }
                  },
                  {
                    key: "archived",
                    title: t("quiz.question.archived"),
                    actions: {
                      onClick: () => {
                        setFilter("archived");
                      }
                    }
                  }
                ]}
              />
              {filter != "archived" && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant={"primary"}
                    as={Link}
                    href={{
                      pathname:
                        "/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/quiz/[quizId]/questions/create",
                      query: { courseId, chapterId, contentId, quizId: defaultValues?.meta.id }
                    }}
                    icon={
                      <Icon>
                        <PlusCircleIcon />
                      </Icon>
                    }
                    children={t("quiz.question.add_question")}
                  />
                  <Button
                    onClick={() => setShowReplicateModal(true)}
                    variant={"default"}
                    icon={
                      <Icon>
                        <DocumentDuplicateIcon />
                      </Icon>
                    }
                    children={t("quiz.question.replicate_all_questions")}
                  />
                </div>
              )}
            </div>
            {!isLoading ? (
              filter == "published" ? (
                questions.length > 0 ? (
                  <SortableList
                    items={questions}
                    onSortChange={handleSort}
                    renderItem={(item, index, dragOverlay) => (
                      <Card
                        className={classNames(
                          "transform rounded-lg",
                          dragOverlay ? "-rotate-1 border-gray-400" : "rotate-0"
                        )}
                        key={index}
                      >
                        <Card.Body>
                          <div className="flex items-center">
                            <SortableList.DragHandle />
                            <Typography.Paragraph
                              children={
                                <span className="flex flex-col">
                                  <span>
                                    {t("quiz.question.question_index", {
                                      index: index + 1
                                    })}
                                  </span>
                                  <span className="text-gray-500">
                                    {stripHtmlTags(item.title).split(" ").slice(0, 3).join(" ")}
                                  </span>
                                </span>
                              }
                            />
                            <div className="mr-auto flex items-center gap-3">
                              <Button
                                variant={"default"}
                                children={t("quiz.question.replicate_question")}
                                onClick={async () => await replicateQuestion(defaultValues.meta.id, item.id as number)}
                              />
                              <Dropdown>
                                <Dropdown.Trigger>
                                  <Button
                                    variant="default"
                                    icon={
                                      <Icon
                                        size="md"
                                        children={<EllipsisHorizontalIcon />}
                                      />
                                    }
                                  />
                                </Dropdown.Trigger>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    as={Link}
                                    href={`/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/${defaultValues.meta.id}/questions/${item.id}/edit`}
                                    children={t("edit")}
                                    iconAlign="end"
                                    icon={
                                      <Icon
                                        size="sm"
                                        children={<PencilSquareIcon />}
                                      />
                                    }
                                  />
                                  <Dropdown.Divider />
                                  <Dropdown.Item
                                    children={t("quiz.question.archive_question")}
                                    iconAlign="end"
                                    onClick={async () => await handleStatusUpdate(item, "archived")}
                                    icon={
                                      <Icon
                                        size="sm"
                                        children={<ArchiveBoxIcon />}
                                      />
                                    }
                                  />
                                  {item.answers_count == 0 && (
                                    <>
                                      <Dropdown.Divider />
                                      <Dropdown.Item
                                        children={t("quiz.question.delete_question")}
                                        className="text-danger"
                                        iconAlign="end"
                                        onClick={() => onQuestionRemove(item)}
                                        icon={
                                          <Icon
                                            size="sm"
                                            children={<TrashIcon />}
                                          />
                                        }
                                      />
                                    </>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  />
                ) : (
                  <EmptyState
                    title={t("quizzes.question_empty_state_title")}
                    className="min-h-[theme(spacing.64)]"
                    icon={
                      <Icon
                        children={
                          <Image
                            src={"/images/unknown-search.svg"}
                            width={48}
                            height={48}
                            alt={"no data"}
                          />
                        }
                        className="h-12 w-12 text-gray-600"
                      />
                    }
                  />
                )
              ) : (
                <div className="flex flex-col gap-4">
                  {questions.length > 0 ? (
                    questions.map((question: Question, index: number) => (
                      <Collapse
                        className={"transform rounded-lg border bg-white"}
                        key={index}
                      >
                        {({ toggle, isOpen }) => (
                          <>
                            <Collapse.Button
                              as={"div"}
                              onClick={() => {
                                return null;
                              }}
                              className={"rounded-lg bg-white"}
                            >
                              <span className="flex flex-col">
                                <span>
                                  {t("quiz.question.question_index", {
                                    index: index + 1
                                  })}
                                </span>
                                <span className="text-gray-500">
                                  {stripHtmlTags(question.title).split(" ").slice(0, 3).join(" ")}
                                </span>
                              </span>
                              <div className="mr-auto flex gap-4">
                                <Dropdown>
                                  <Dropdown.Trigger>
                                    <Button
                                      variant="default"
                                      icon={
                                        <Icon
                                          size="md"
                                          children={<EllipsisHorizontalIcon />}
                                        />
                                      }
                                    />
                                  </Dropdown.Trigger>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      children={t("quiz.question.publish_question")}
                                      iconAlign="end"
                                      onClick={async () => await handleStatusUpdate(question, "published")}
                                      icon={
                                        <Icon
                                          size="sm"
                                          children={<ArchiveBoxXMarkIcon />}
                                        />
                                      }
                                    />
                                    {question.answers_count == 0 && (
                                      <>
                                        <Dropdown.Divider />
                                        <Dropdown.Item
                                          children={t("quiz.question.delete_question")}
                                          className="text-danger"
                                          iconAlign="end"
                                          onClick={() => onQuestionRemove(question)}
                                          icon={
                                            <Icon
                                              size="sm"
                                              children={<TrashIcon />}
                                            />
                                          }
                                        />
                                      </>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                                <Button
                                  variant="default"
                                  ghost
                                  icon={<Icon>{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</Icon>}
                                  onClick={() => {
                                    toggle();
                                  }}
                                />
                              </div>
                            </Collapse.Button>
                            <Collapse.Content className="bg-white p-4">
                              <Typography.Paragraph
                                className="mb-2"
                                size="md"
                                weight="bold"
                                children={t("quiz.question.choices")}
                              />
                              {question.choices.length > 0 && (
                                <div className="flex flex-col gap-2 ">
                                  {question.choices.map((choice, $index) => (
                                    <div
                                      className="rounded-md bg-gray-200 px-4 py-3"
                                      key={`question-choice-${$index}`}
                                      dangerouslySetInnerHTML={{ __html: choice.content }}
                                    />
                                  ))}
                                </div>
                              )}
                            </Collapse.Content>
                          </>
                        )}
                      </Collapse>
                    ))
                  ) : (
                    <EmptyState
                      title={t("quizzes.question_empty_state_archived_title")}
                      className="min-h-[theme(spacing.64)]"
                      icon={
                        <Icon
                          children={
                            <Image
                              src={"/images/unknown-search.svg"}
                              width={48}
                              height={48}
                              alt={"no data"}
                            />
                          }
                          className="h-12 w-12 text-gray-600"
                        />
                      }
                    />
                  )}
                </div>
              )
            ) : (
              <LoadingCard />
            )}
          </div>
          <div className="mt-6">
            {defaultValues && filter != "archived" && defaultValues.meta.question_banks && (
              <QuizBank
                errors={errors}
                watch={watch}
                control={control}
              />
            )}
          </div>
        </Layout.FormGrid>
      </Form>
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

      <ReplicateQuestionsModal
        onQuestionsReplicate={(data) => {
          setValue("meta.question_banks", data);
          refetch();
        }}
        currentBanks={defaultValues.meta?.question_banks ?? []}
        open={showReplicateModal}
        defaultValues={defaultValues}
        onDismiss={() => setShowReplicateModal(false)}
      />
    </>
  );
}
