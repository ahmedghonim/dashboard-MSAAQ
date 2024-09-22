import React from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { ConditionProps } from "@/components/segments";
import { Select } from "@/components/select";
import { SegmentConditionOperatorType } from "@/types";

import { Form, Grid } from "@msaaqcom/abjad";

const CratedAtCondition = ({ control, errors, index, watch }: ConditionProps) => {
  const { t } = useTranslation();
  const operator = watch(`conditions.${index}.operator`)?.value;

  return (
    <>
      <Grid.Cell>
        <Form.Group
          required
          className="mb-0"
          label={t("students_flow.segments.condition_operator_type")}
          errors={errors.conditions?.[index]?.operator?.value?.message as string}
        >
          <Controller
            name={`conditions.${index}.operator`}
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  {
                    label: t("students_flow.segments.condition_operator_date_gt"),
                    value: SegmentConditionOperatorType.GT
                  },
                  {
                    label: t("students_flow.segments.condition_operator_date_lt"),
                    value: SegmentConditionOperatorType.LT
                  },
                  {
                    label: t("students_flow.segments.condition_operator_date_between"),
                    value: SegmentConditionOperatorType.BETWEEN
                  }
                ]}
                {...field}
              />
            )}
          />
        </Form.Group>
      </Grid.Cell>
      {operator === SegmentConditionOperatorType.BETWEEN ? (
        <>
          <Grid.Cell>
            <Form.Group
              required
              className="mb-0"
              label={t("students_flow.segments.condition_min_value")}
              errors={errors.conditions?.[index]?.min_value?.message as string}
            >
              <Controller
                name={`conditions.${index}.min_value`}
                control={control}
                render={({ field: { value, ...rest } }) => (
                  <Form.Input
                    type="date"
                    value={value as string}
                    {...rest}
                  />
                )}
              />
            </Form.Group>
          </Grid.Cell>
          <Grid.Cell>
            <Form.Group
              required
              className="mb-0"
              label={t("students_flow.segments.condition_max_value")}
              errors={errors.conditions?.[index]?.max_value?.message as string}
            >
              <Controller
                name={`conditions.${index}.max_value`}
                control={control}
                render={({ field: { value, ...rest } }) => (
                  <Form.Input
                    type="date"
                    value={value as string}
                    {...rest}
                  />
                )}
              />
            </Form.Group>
          </Grid.Cell>
        </>
      ) : (
        <Grid.Cell>
          <Form.Group
            required
            className="mb-0"
            label={t("students_flow.segments.condition_date_value")}
            errors={errors.conditions?.[index]?.value?.message as string}
          >
            <Controller
              name={`conditions.${index}.value`}
              control={control}
              render={({ field: { value, ...rest } }) => (
                <Form.Input
                  type="date"
                  value={value as string}
                  {...rest}
                />
              )}
            />
          </Form.Group>
        </Grid.Cell>
      )}
    </>
  );
};

export default CratedAtCondition;