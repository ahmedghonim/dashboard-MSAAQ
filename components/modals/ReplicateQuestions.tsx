import { FC, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { current } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import { loadQuizzes } from "@/actions/options";
import { useResponseToastHandler } from "@/hooks";
import { useUpdateQuizMutation } from "@/store/slices/api/quizzesSlice";
import { APIActionResponse, Content, QuestionBank, Quiz } from "@/types";
import { classNames } from "@/utils";

import { ArrowDownTrayIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Modal, ModalProps, Tooltip, Typography } from "@msaaqcom/abjad";

import { Card } from "../cards";
import { Select } from "../select";

interface ReplicateQuestionsModalProps extends ModalProps {
  defaultValues: Content<Quiz>;
  currentBanks: Array<QuestionBank>;
  onQuestionsReplicate: (data: any) => void;
}
interface IFormFields {
  options: any;
  question_banks: Array<QuestionBank>;
  randomised: boolean;
  enable_duration: boolean;
  duration: number;
  show_results_at_end: boolean;
  allow_question_navigation: boolean;
  show_results: boolean;
  enable_passing_score: boolean;
  passing_score: number;
}
const ReplicateQuestionsModal: FC<ReplicateQuestionsModalProps> = ({
  open,
  onDismiss,
  defaultValues,
  currentBanks,
  onQuestionsReplicate
}) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);

  const router = useRouter();
  const { chapterId } = router.query;

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  const schema = yup.object().shape({
    question_banks: yup
      .array()
      .of(
        yup.object().shape({
          question_bank_id: yup.number().required(),
          questions_count: yup.number().when("select_all", {
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
      .min(1)
      .required()
  });

  const form = useForm<IFormFields>({
    mode: "onChange",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    control,
    setValue,
    reset,
    watch
  } = form;

  const { fields, remove, append } = useFieldArray({
    control,
    name: "question_banks"
  });

  useEffect(() => {
    if (watch("options")?.length > 0) {
      watch("options").map((quiz: Quiz) => {
        append({
          total_questions_count: quiz.questions_count,
          question_bank_id: quiz.id,
          questions_count: 0,
          title: quiz.title,
          select_all: false
        });
      });
    }
  }, [watch("options")]);

  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [updateQuizMutation] = useUpdateQuizMutation();
  const onSubmit: SubmitHandler<IFormFields> = async (data) => {
    const mutation = updateQuizMutation;

    const combinedBanks = [
      ...data.question_banks.map((bank) => ({
        question_bank_id: bank.question_bank_id as number,
        questions_count: bank.select_all ? (bank.total_questions_count as number) : (bank.questions_count as number)
      })),
      ...currentBanks.map((bank) => ({
        question_bank_id: bank?.id as number,
        questions_count: (bank.questions_count as number) ?? 0
      }))
    ];

    const content = (await mutation({
      quizId: defaultValues?.meta?.id as string,
      chapterId: chapterId as string,
      data: {
        question_banks: combinedBanks,
        title: defaultValues?.title,
        type: "quiz",
        allow_question_navigation: defaultValues?.meta.allow_question_navigation,
        duration: defaultValues?.meta.duration,
        passing_score: defaultValues?.meta.passing_score,
        show_results: defaultValues?.meta.show_results,
        randomised: defaultValues?.meta.randomised,
        show_results_at_end: defaultValues?.meta.show_results_at_end
      }
    })) as APIActionResponse<Quiz>;

    if (displayErrors(content)) {
      return;
    } else {
      displaySuccess(content);
      onQuestionsReplicate(combinedBanks);
      reset({
        question_banks: []
      });
      onDismiss?.();
    }
  };

  return (
    <Modal
      size="xl"
      open={show}
      onDismiss={onDismiss}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={t("quizzes.replicate_header_title")} />
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Content className="space-y-4">
            <Form.Group
              label={t("quizzes.pick_question_bank")}
              className="!mb-0"
            >
              <Controller
                control={control}
                name="options"
                render={({ field }) => (
                  <Select
                    placeholder={t("quizzes.pick_question_bank_placeholder")}
                    loadOptions={(inputValue, callback) =>
                      loadQuizzes(
                        inputValue,
                        callback,
                        {
                          filters: {
                            type: "question_bank",
                            has_questions: true
                          },
                          simple_response: true,
                          all: true
                        },
                        currentBanks
                      )
                    }
                    components={{
                      Option: (props) => (
                        <components.Option {...props}>
                          <div className={classNames("flex", props.data.isDisabled && "cursor-not-allowed")}>
                            <Typography.Paragraph
                              weight="medium"
                              size="sm"
                              children={t("quizzes.total_question_from_bank", {
                                count: props.data.questions_count,
                                title: props.data.title
                              })}
                            />
                            {props.data.isDisabled && (
                              <Typography.Paragraph
                                weight="medium"
                                size="sm"
                                className="mr-auto text-primary"
                                children={t("quizzes.bank_is_already_added")}
                              />
                            )}
                          </div>
                        </components.Option>
                      ),
                      MultiValue: (props) => (
                        <components.MultiValue {...props}>
                          <Typography.Paragraph
                            weight="medium"
                            size="sm"
                            children={t("quizzes.total_question_from_bank", {
                              count: props.data.questions_count,
                              title: props.data.title
                            })}
                          />
                        </components.MultiValue>
                      ),
                      SingleValue: (props) => (
                        <components.SingleValue {...props}>
                          <Typography.Paragraph
                            weight="medium"
                            size="sm"
                            children={t("quizzes.total_question_from_bank", {
                              count: props.data.questions_count,
                              title: props.data.title
                            })}
                          />
                        </components.SingleValue>
                      )
                    }}
                    isMulti
                    {...field}
                    onChange={(option) => {
                      const removedOptionIndex = fields.findIndex(
                        (selectedOption: any) => !option.includes(selectedOption)
                      );

                      if (removedOptionIndex !== -1) {
                        remove(removedOptionIndex);
                      }

                      field.onChange(option);
                    }}
                  />
                )}
              />
            </Form.Group>
            {fields.length > 0 && (
              <div className="flex flex-col gap-4">
                {fields.map((quiz, index) => (
                  <Card
                    key={index}
                    className="!border-0"
                  >
                    <Card.Body className="rounded-lg !border-0 bg-primary-50">
                      <div className="mb-4 flex items-center justify-between">
                        <Typography.Paragraph
                          children={t("quizzes.total_question_from_bank", {
                            count: quiz.total_questions_count,
                            title: quiz.title
                          })}
                        />
                        <Button
                          onClick={() => {
                            remove(index);

                            setValue(
                              "options",
                              watch("options").filter((option: any, optionIndex: any) => optionIndex !== index)
                            );
                          }}
                          icon={
                            <Icon>
                              <TrashIcon />
                            </Icon>
                          }
                          variant="default"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Form.Group
                          label={
                            <span className="flex items-center gap-2">
                              {t("quiz.question.count_label")}
                              <Tooltip>
                                <Tooltip.Trigger>
                                  <Icon>
                                    <ExclamationCircleIcon className="text-gray-600" />
                                  </Icon>
                                </Tooltip.Trigger>
                                <Tooltip.Content>{t("quizzes.total_question_tooltip")}</Tooltip.Content>
                              </Tooltip>
                            </span>
                          }
                          errors={errors?.question_banks?.[index]?.questions_count?.message}
                        >
                          <Controller
                            name={`question_banks.${index}.questions_count`}
                            control={control}
                            render={({ field }) => (
                              <Form.Number
                                {...field}
                                min={1}
                                type="number"
                                placeholder={t("quiz.question.questions_count")}
                                disabled={watch(`question_banks.${index}.select_all`)}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Controller
                            name={`question_banks.${index}.select_all`}
                            control={control}
                            render={({ field: { value, ...rest } }) => (
                              <Form.Checkbox
                                label={t("quiz.question.select_all")}
                                id={`check-${index}`}
                                value={Number(value ?? 0)}
                                checked={value}
                                {...rest}
                              />
                            )}
                          />
                        </Form.Group>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Modal.Content>
        </Modal.Body>
        <Modal.Footer className="justify-between gap-x-2">
          <Button
            size="lg"
            type="submit"
            icon={
              <Icon>
                <ArrowDownTrayIcon />
              </Icon>
            }
            disabled={!isValid || isSubmitting}
            children={t("quiz.question.replicate_all_questions")}
          />
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReplicateQuestionsModal;
