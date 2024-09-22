import React from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { ConditionProps } from "@/components/segments";
import { Select } from "@/components/select";

import { Form, Grid } from "@msaaqcom/abjad";

const GenderCondition = ({ control, errors, index }: ConditionProps) => {
  const { t } = useTranslation();
  return (
    <Grid.Cell>
      <Form.Group
        required
        className="mb-0"
        label={t("students_flow.segments.condition_gender_value")}
        errors={errors.conditions?.[index]?.value?.message as string}
      >
        <Controller
          name={`conditions.${index}.value`}
          control={control}
          render={({ field }) => (
            <Select
              isSearchable={false}
              options={[
                {
                  label: t("students_flow.male"),
                  value: "male"
                },
                {
                  label: t("students_flow.female"),
                  value: "female"
                }
              ]}
              {...field}
            />
          )}
        />
      </Form.Group>
    </Grid.Cell>
  );
};

export default GenderCondition;
