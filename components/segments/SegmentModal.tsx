import { createElement, useCallback, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import kebabCase from "lodash/kebabCase";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";

import CratedAtCondition from "@/components/segments/conditions/CratedAtCondition";
import GenderCondition from "@/components/segments/conditions/GenderCondition";
import TotalPurchasesCondition from "@/components/segments/conditions/TotalPurchasesCondition";
import { Select } from "@/components/select";
import HeroIconSelect from "@/components/select/HeroIconSelect";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useCreateSegmentMutation, useUpdateSegmentMutation } from "@/store/slices/api/segmentsSlice";
import { APIActionResponse, Segment, SegmentConditionOperatorType, SegmentConditionType } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Form, Grid, Icon, Modal, Tooltip, Typography } from "@msaaqcom/abjad";
import { ModalProps } from "@msaaqcom/abjad/dist/components/modal/Modal";

function getConditionContent(type: SegmentConditionType) {
  switch (type) {
    case SegmentConditionType.TOTAL_PURCHASES:
    case SegmentConditionType.TOTAL_ORDERS:
      return TotalPurchasesCondition;
    case SegmentConditionType.CREATED_AT:
    case SegmentConditionType.DOB:
      return CratedAtCondition;
    case SegmentConditionType.GENDER:
      return GenderCondition;
    default:
      return () => null;
  }
}

interface IMembersSegmentsConditionsFormInputs {
  name: string;
  icon: {
    label: string;
    value: string;
  };
  conditions: Array<{
    type: {
      label: string;
      value: SegmentConditionType;
    };
    operator?: {
      label: string;
      value: SegmentConditionOperatorType;
    };
    //required when operator = between
    max_value?: number | string;
    //required when operator = between
    min_value?: number | string;
    //required when operator = gte, lte, gt, lt, equal
    value:
      | string
      | number
      | {
          label: string;
          value: string;
        };
  }>;
}

const SegmentModal = ({
  open,
  onDismiss,
  segment
}: ModalProps & {
  segment?: Segment | null;
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(false);
  const [createSegment] = useCreateSegmentMutation();
  const [updateSegment] = useUpdateSegmentMutation();
  const { formatPlainPrice } = useFormatPrice();

  const SegmentConditionSchema = yup
    .object()
    .shape({
      type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      operator: yup.object().when("type", {
        is: (type: { label: string; value: SegmentConditionType }) => {
          return (
            type.value === SegmentConditionType.TOTAL_PURCHASES || type.value === SegmentConditionType.TOTAL_ORDERS
          );
        },
        then: yup
          .object()
          .shape({
            label: yup.string().required(),
            value: yup.string().required()
          })
          .required(),
        otherwise: yup.object().nullable()
      }),
      max_value: yup
        .mixed()
        .nullable()
        .when("operator", {
          is: (op: { label: string; value: SegmentConditionOperatorType }) => {
            if (!op?.value) {
              return false;
            }
            return op.value === SegmentConditionOperatorType.BETWEEN;
          },
          then: yup.mixed().required(),
          otherwise: yup.mixed().nullable()
        }),
      min_value: yup
        .mixed()
        .nullable()
        .when("operator", {
          is: (op: { label: string; value: SegmentConditionOperatorType }) => {
            if (!op?.value) {
              return false;
            }
            return op.value === SegmentConditionOperatorType.BETWEEN;
          },
          then: yup.mixed().required(),
          otherwise: yup.mixed().nullable()
        }),

      value: yup.mixed().when("operator", {
        is: (operator: { label: string; value: SegmentConditionOperatorType }) => {
          if (!operator?.value) {
            return true;
          }
          return operator.value !== SegmentConditionOperatorType.BETWEEN;
        },
        then: yup.mixed().required(),
        otherwise: yup.mixed().nullable()
      })
    })
    .required();

  const MembersSegmentsConditionsFormInputsSchema = yup.object().shape({
    name: yup.string().required(),
    icon: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required()
      })
      .required(),
    conditions: yup.array().min(1).of(SegmentConditionSchema).required()
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues,
    watch,
    reset,
    setError
  } = useForm<IMembersSegmentsConditionsFormInputs>({
    mode: "all",
    resolver: yupResolver(MembersSegmentsConditionsFormInputsSchema),
    defaultValues: {
      conditions: [{}]
    }
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  useEffect(() => {
    setShow(open ?? false);
  }, [open]);

  useEffect(() => {
    if (segment) {
      reset({
        icon: {
          label: segment.icon,
          value: segment.icon
        },
        name: segment.name,
        conditions: segment.conditions.map((condition) => ({
          ...condition,
          type: {
            label: t(`students_flow.segments.condition_type_${condition.type}`),
            value: condition.type
          },
          ...(condition.operator
            ? {
                operator: {
                  label: t(`students_flow.segments.condition_operator_${condition.operator}`),
                  value: condition.operator
                }
              }
            : { operator: undefined }),
          value:
            condition.type === SegmentConditionType.GENDER
              ? {
                  label: t(`students_flow.${condition.value}`),
                  value: condition.value as string
                }
              : condition.type === SegmentConditionType.TOTAL_PURCHASES
              ? formatPlainPrice(condition.value as number)
              : condition.value,
          max_value:
            condition.type === SegmentConditionType.TOTAL_PURCHASES
              ? formatPlainPrice(condition.max_value as number)
              : condition.max_value,
          min_value:
            condition.type === SegmentConditionType.TOTAL_PURCHASES
              ? formatPlainPrice(condition.min_value as number)
              : condition.min_value
        }))
      });
    }
  }, [segment]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions"
  });

  const resolveGridColumns = useCallback(
    (condition: { type: SegmentConditionType | undefined; operator: SegmentConditionOperatorType | undefined }) => {
      const { type, operator } = condition;

      if (
        type === SegmentConditionType.DOB ||
        type === SegmentConditionType.CREATED_AT ||
        type === SegmentConditionType.TOTAL_PURCHASES ||
        type === SegmentConditionType.TOTAL_ORDERS
      ) {
        if (operator === SegmentConditionOperatorType.BETWEEN) {
          return {
            md: 2,
            lg: 4,
            sm: 2
          };
        } else {
          return {
            md: 2,
            lg: 3,
            sm: 2
          };
        }
      }

      return {
        md: 2,
        lg: 2,
        sm: 2
      };
    },
    []
  );

  const onSubmit: SubmitHandler<IMembersSegmentsConditionsFormInputs> = async (data) => {
    const mutation = segment?.id ? updateSegment : createSegment;
    const response = (await mutation({
      id: segment?.id as number,
      icon: kebabCase(data.icon.value.replace(/Icon$/, "")),
      name: data.name,
      conditions: data.conditions.map((condition) => ({
        ...condition,
        type: condition.type.value,
        ...(condition.operator?.value
          ? {
              operator: condition.operator.value
            }
          : { operator: SegmentConditionOperatorType.EQUAL }),
        value: typeof condition.value === "object" ? condition.value.value : condition.value
      }))
    })) as APIActionResponse<Segment>;

    if (displayErrors(response)) return;

    displaySuccess(response);
    onDismiss?.();
    reset({});
  };

  return (
    <Modal
      size="xl"
      open={show}
      onDismiss={() => {
        onDismiss?.();
        reset({});
      }}
      className="!max-w-5xl"
    >
      <Modal.Header className="mb-2">
        <Modal.HeaderTitle>
          {segment?.id ? (
            <Trans
              i18nKey="students_flow.segments.edit_segment_title"
              components={{
                span: <span className="font-normal text-success" />
              }}
              values={{
                name: segment.name
              }}
            />
          ) : (
            t("students_flow.segments.create_new_segment")
          )}
        </Modal.HeaderTitle>
      </Modal.Header>
      <Modal.Body>
        <Modal.Content className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4">
            <Typography.Paragraph
              size="md"
              className="font-medium text-gray-700"
            >
              {t("students_flow.segments.segment_details")}
            </Typography.Paragraph>
            <Grid
              columns={{
                md: 6,
                lg: 6,
                sm: 6
              }}
              gap={{
                xs: "1rem",
                sm: "1rem",
                md: "1rem",
                lg: "1rem",
                xl: "1rem"
              }}
            >
              <Grid.Cell
                columnSpan={{
                  md: 1,
                  lg: 1,
                  sm: 1
                }}
              >
                <Form.Group
                  required
                  className="mb-0"
                  label={t("students_flow.segments.segment_icon")}
                  errors={errors.icon?.value?.message}
                >
                  <Controller
                    name={"icon"}
                    control={control}
                    render={({ field }) => <HeroIconSelect {...field} />}
                  />
                </Form.Group>
              </Grid.Cell>
              <Grid.Cell
                columnSpan={{
                  md: 5,
                  lg: 5,
                  sm: 5
                }}
              >
                <Form.Group
                  required
                  className="mb-0"
                  label={t("students_flow.segments.segment_name")}
                  errors={errors.name?.message}
                >
                  <Controller
                    name={"name"}
                    control={control}
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("students_flow.segments.segment_name")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </Grid.Cell>
            </Grid>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4">
            <Typography.Paragraph
              size="md"
              className="flex font-medium text-gray-700"
            >
              {t("students_flow.segments.segment_conditions")}
              <Tooltip>
                <Tooltip.Trigger>
                  <Icon>
                    <ExclamationCircleIcon className="text-gray-700" />
                  </Icon>
                </Tooltip.Trigger>
                <Tooltip.Content>{t("students_flow.segments.segment_conditions_alert")}</Tooltip.Content>
              </Tooltip>
            </Typography.Paragraph>
            {errors.conditions?.message && (
              <Form.Errors errors={t("students_flow.segments.you_should_at_least_have_one_segment")} />
            )}
            {fields.map((_, index) => (
              <div
                className="flex flex-col items-center justify-between gap-4 rounded-xl bg-white p-4 sm:flex-row"
                key={index}
              >
                <Grid
                  columns={resolveGridColumns({
                    type: watch(`conditions.${index}.type`)?.value,
                    operator: watch(`conditions.${index}.operator`)?.value
                  })}
                  gap={{
                    xs: "1rem",
                    sm: "1rem",
                    md: "1rem",
                    lg: "1rem",
                    xl: "1rem"
                  }}
                  className="w-full"
                >
                  <Grid.Cell>
                    <Form.Group
                      required
                      className="mb-0"
                      label={t("students_flow.segments.condition_type")}
                      // @ts-ignore
                      errors={errors.conditions?.[index]?.type?.value?.message as string}
                    >
                      <Controller
                        name={`conditions.${index}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            isSearchable={false}
                            placeholder={t("students_flow.segments.condition_type_placeholder")}
                            options={[
                              {
                                label: t("students_flow.segments.condition_type_total_purchases"),
                                value: SegmentConditionType.TOTAL_PURCHASES
                              },
                              {
                                label: t("students_flow.segments.condition_type_total_orders"),
                                value: SegmentConditionType.TOTAL_ORDERS
                              },
                              {
                                label: t("students_flow.segments.condition_type_created_at"),
                                value: SegmentConditionType.CREATED_AT
                              },
                              {
                                label: t("students_flow.segments.condition_type_gender"),
                                value: SegmentConditionType.GENDER
                              },
                              {
                                label: t("students_flow.segments.condition_type_dob"),
                                value: SegmentConditionType.DOB
                              }
                            ]}
                            filterOption={(option) => {
                              return !getValues("conditions")
                                .filter((condition) => condition.type)
                                .map((condition) => condition.type?.value)
                                .includes(option.value as SegmentConditionType);
                            }}
                            {...field}
                          />
                        )}
                      />
                    </Form.Group>
                  </Grid.Cell>
                  {createElement(getConditionContent(watch(`conditions.${index}.type`)?.value), {
                    control,
                    errors,
                    watch,
                    index
                  })}
                </Grid>
                <div className="hidden h-[80px] w-px bg-gray-400 sm:block" />
                <Button
                  icon={
                    <Icon
                      size="md"
                      children={<XMarkIcon />}
                    />
                  }
                  variant="default"
                  size="md"
                  onClick={() => remove(index)}
                  className="w-full sm:w-auto"
                />
              </div>
            ))}
            <Button
              disabled={fields.length >= 5}
              className="ml-auto px-10"
              variant="primary"
              children={t("students_flow.segments.add_new_condition")}
              onClick={() => {
                append({} as any);
              }}
              icon={<Icon children={<PlusIcon />} />}
            />
          </div>
        </Modal.Content>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex w-full justify-between">
          <Button
            className="px-10"
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            children={segment?.id ? t("save_changes") : t("create")}
          />
          <Button
            variant="default"
            children={t("cancel")}
            onClick={() => onDismiss?.()}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SegmentModal;
