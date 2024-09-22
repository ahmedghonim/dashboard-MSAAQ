import { useTranslation } from "next-i18next";
import { Control, Controller, FieldErrors, UseFormWatch, useFieldArray } from "react-hook-form";

import { Card } from "@/components/cards";

import { TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Tooltip } from "@msaaqcom/abjad";

import { QuizFormInputs } from "./quiz-form";

interface IProps {
  control: Control<QuizFormInputs>;
  watch: UseFormWatch<QuizFormInputs>;
  errors: FieldErrors<QuizFormInputs>;
}

export default function QuizBank({ control, watch, errors }: IProps) {
  const { t } = useTranslation();
  const { fields, remove } = useFieldArray({
    control,
    name: "meta.question_banks",
    keyName: "key"
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((item, index) => (
        <Card
          className="overflow-hidden rounded-lg bg-primary-50"
          key={index}
        >
          <Card.Body>
            <div className="mb-4 flex items-center">
              <span>{item.title}</span>
              <Button
                onClick={() => remove(index)}
                className="mr-auto"
                variant={"default"}
                icon={
                  <Icon>
                    <TrashIcon />
                  </Icon>
                }
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
                errors={errors?.meta?.question_banks?.[index]?.questions_count?.message}
              >
                <Controller
                  name={`meta.question_banks.${index}.questions_count`}
                  control={control}
                  render={({ field }) => (
                    <Form.Number
                      {...field}
                      min={1}
                      type="number"
                      placeholder={t("quiz.question.questions_count")}
                      disabled={watch(`meta.question_banks.${index}.select_all`)}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group>
                <Controller
                  name={`meta.question_banks.${index}.select_all`}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Checkbox
                      label={t("quiz.question.select_all")}
                      id={`meta-check-${index}`}
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
  );
}
