import { useContext, useEffect, useState } from "react";

import { isArray } from "lodash";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { AuthContext } from "@/contextes";
import { useResponseToastHandler } from "@/hooks";
import { useFetchQuestionsQuery, useSubmitQuestionsMutation } from "@/store/slices/api/onboarding/questionsSlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { APIActionResponse } from "@/types";
import { OnBoardingQuestions, OnboardingChoice, StepsValues } from "@/types/models/onboarding-questions";
import { classNames } from "@/utils";

import { Button, Form, Tooltip } from "@msaaqcom/abjad";

const QuestionsStep = ({
  onStepChange,
  onlyQuestionary
}: {
  onStepChange: (step: number, skip?: boolean) => void;
  onlyQuestionary?: boolean;
}) => {
  const { t } = useTranslation();
  const { data: questions, isLoading } = useFetchQuestionsQuery();
  const { refetchAuth, current_academy } = useContext(AuthContext);
  const [skipOnboardingMutation] = useUpdateAcademySettingsMutation();

  const [questionsPerPage, setQuestionsPerPage] = useState<
    | {
        page: number;
        questions: Array<OnBoardingQuestions>;
      }[]
    | undefined
  >();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    if (questions?.data) {
      const groupedByPage = questions.data.reduce((acc: any, question: any) => {
        const { page } = question;
        if (!acc[page]) {
          acc[page] = {
            page,
            questions: []
          };
        }
        acc[page].questions.push(question);
        return acc;
      }, {});
      setTotalPages(Object.keys(groupedByPage).length);

      const pagesArray = Object.values(groupedByPage).sort((a: any, b: any) => a.page - b.page);
      setQuestionsPerPage(pagesArray as any);
    }
  }, [questions]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<any>({
    mode: "all"
  });

  useEffect(() => {
    if (current_academy && current_academy.onboarding_answers && current_academy.onboarding_answers.length > 0) {
      const answers = current_academy.onboarding_answers.reduce((acc: any, answer: any) => {
        const $question = questions?.data.find((question) => question.id === answer.question_id);
        if ($question?.type === "multiselect") {
          if (!acc[`question_${answer.question_id}`]) {
            acc[`question_${answer.question_id}`] = [];
          }
          acc[`question_${answer.question_id}`].push(answer.choice_id);
        } else {
          if (acc.hasOwnProperty(`question_${answer.question_id}`)) {
            acc[`question_${answer.question_id}`] = [acc[`question_${answer.question_id}`], answer.choice_id];
          } else {
            acc[`question_${answer.question_id}`] = answer.choice_id;
          }
        }
        return acc;
      }, {});
      reset(answers);
    }
  }, [current_academy]);

  const { displayErrors } = useResponseToastHandler({});

  const [submitQuestions] = useSubmitQuestionsMutation();
  const onSubmit: SubmitHandler<any> = async (data) => {
    const $data = Object.keys(data).reduce((acc: any, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    const answers = Object.keys($data).flatMap((key) => {
      const questionId = parseInt(key.split("_")[1], 10);
      const findQuestion: any = questions?.data.find((question) => question.id === questionId);

      if (findQuestion.type === "multiselect") {
        return $data[key].map((choiceId: any) => {
          const findChoice = findQuestion.choices.find((choice: OnboardingChoice) => choice.id === choiceId);
          if (findChoice) {
            return {
              question_id: findQuestion.id,
              choice_id: choiceId,
              answer_text: findChoice.title
            };
          } else {
            return null;
          }
        });
      } else {
        const findChoice = findQuestion.choices.find((choice: OnboardingChoice) => choice.id === $data[key]);
        if (findChoice) {
          return [
            {
              question_id: findQuestion.id,
              choice_id: $data[key],
              answer_text: findChoice.title
            }
          ];
        } else {
          return null;
        }
      }
    });
    const response = (await submitQuestions({
      answers: answers.filter((answer: any) => answer !== null)
    })) as APIActionResponse<any>;

    if (displayErrors(response)) return;

    await refetchAuth();

    onStepChange(StepsValues.Build, false);
  };

  return (
    <div className={classNames("flex flex-col", onlyQuestionary && "w-full laptop:w-1/2")}>
      <div className="mb-6 text-base font-medium text-primary">{t("onboard.questions.title")}</div>
      <div>
        {!isLoading && questionsPerPage && questionsPerPage?.length > 0 ? (
          <Form onSubmit={handleSubmit(onSubmit)}>
            {questionsPerPage
              ?.find((page) => page.page === currentPage)
              ?.questions.map((question: OnBoardingQuestions, index: any) => (
                <div
                  key={index}
                  className="mb-6"
                >
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{question.title}</h3>
                  <div className="mb-4 text-sm font-normal text-gray-800">{question.subtitle}</div>
                  <div
                    className={classNames(
                      "grid gap-4",
                      question.type == "multiselect"
                        ? "grid-cols-2 lg:grid-cols-4"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    )}
                  >
                    {question.type == "multiselect" ? (
                      <>
                        {question.choices.map((choice: any, index: number) => (
                          <Form.Group
                            className="!mb-0"
                            key={index}
                          >
                            <Controller
                              control={control}
                              name={`question_${question.id}`}
                              render={({ field: { onChange, value = [] } }) => (
                                <label
                                  id={choice.id}
                                  className={classNames(
                                    "cursor-pointer rounded-xl border border-transparent px-4 py-7 opacity-60 transition-all hover:opacity-100 has-[:checked]:border-primary has-[:checked]:bg-primary-50 has-[:checked]:opacity-100",
                                    onlyQuestionary ? "bg-gray-50" : "bg-white lg:bg-gray-50"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    id={choice.id}
                                    className="hidden"
                                    value={choice.id}
                                    checked={isArray(value) ? value.includes(choice.id) : value == choice.id}
                                    onChange={(e) => {
                                      let newValue = e.target.checked
                                        ? [...value, choice.id]
                                        : value.filter((id: number) => id !== choice.id);
                                      if (newValue.length <= 3) {
                                        onChange(newValue);
                                      } else {
                                        newValue = newValue.filter((id: number) => id !== choice.id);
                                        onChange(newValue);
                                      }
                                    }}
                                  />
                                  <span className="flex items-center gap-3 text-sm">
                                    <img
                                      src={choice.icon?.url}
                                      className="select-none"
                                      draggable={false}
                                    />
                                    <span className="select-none break-words">{choice.title}</span>
                                  </span>
                                </label>
                              )}
                            />
                          </Form.Group>
                        ))}
                      </>
                    ) : (
                      <>
                        {question.choices.map((choice: any, index: number) => (
                          <Form.Group
                            className="!mb-0"
                            key={index}
                          >
                            <Controller
                              control={control}
                              name={`question_${question.id}`}
                              render={({ field: { onChange, value, ...rest } }) => (
                                <div
                                  className={classNames(
                                    "cursor-pointer rounded-xl px-4 py-7 [&>:first-child]:gap-x-2",
                                    onlyQuestionary ? "bg-gray-50" : "bg-white lg:bg-gray-50"
                                  )}
                                  onClick={() => {
                                    onChange(choice.id);
                                  }}
                                >
                                  <Form.Radio
                                    id={`choice-${choice.id}`}
                                    label={
                                      <>
                                        <span className="flex w-fit items-center gap-2">
                                          <img
                                            src={choice.icon?.url}
                                            draggable={false}
                                            className="select-none"
                                          />
                                          <span className="select-none break-words">{choice.title}</span>
                                        </span>
                                      </>
                                    }
                                    {...rest}
                                    value={choice.id}
                                    checked={Number(value) === Number(choice.id)}
                                    onChange={() => {
                                      onChange(choice.id);
                                    }}
                                  />
                                </div>
                              )}
                            />
                          </Form.Group>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            <div className="flex w-full justify-between border-t border-gray-400 pt-4">
              <Button
                disabled={isSubmitting}
                isLoading={isSubmitting}
                onClick={() => {
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  } else {
                    handleSubmit(onSubmit)();
                  }
                }}
              >
                <Trans
                  i18nKey="onboard.next"
                  values={{ total: totalPages, currentPage: currentPage }}
                  components={{
                    span: <span className="opacity-75" />
                  }}
                />
              </Button>
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    onClick={async () => {
                      if (onlyQuestionary) {
                        await skipOnboardingMutation({
                          onboarding_status: "skipped"
                        });
                        onStepChange(StepsValues.Build, true);
                      } else {
                        onStepChange(StepsValues.Build, true);
                      }
                    }}
                    variant={"default"}
                  >
                    {t("onboard.skip")}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{t("onboard.skipTooltip")}</Tooltip.Content>
              </Tooltip>
            </div>
          </Form>
        ) : (
          <div className="grid w-full grid-cols-4 gap-4">
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                className="h-14 w-full animate-pulse rounded-2xl bg-gray-300"
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsStep;
