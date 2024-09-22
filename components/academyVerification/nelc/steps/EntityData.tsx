import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import {
  ENTITY_LICENSE_OPTIONS,
  ENTITY_LICENSE_TYPE,
  ENTITY_TYPES,
  FACILITY_GENERAL_EDUCATION_OPTIONS,
  FACILITY_HIGH_EDUCATION_OPTIONS,
  FACILITY_TRAINING_OPTIONS,
  StepProps,
  TYPE_TRAINING
} from "@/components/academyVerification/nelc";
import { Select } from "@/components/select";
import { AuthContext } from "@/contextes";

import { Alert, Form } from "@msaaqcom/abjad";

const EntityData: FC<StepProps> = ({ control, errors, watch, facilities }) => {
  const { t } = useTranslation();

  const { current_academy } = useContext(AuthContext);

  return (
    <div>
      <Alert
        className="mt-10"
        bordered
        title={t("academy_verification.nelc.activity_alert_title")}
        variant="info"
        children={t("academy_verification.nelc.activity_alert_description")}
      />
      <div className="my-10 flex flex-col gap-y-6">
        <Form.Group
          className="mb-0 w-full"
          label={t("academy_verification.nelc.bussiness_name")}
        >
          <Form.Input
            disabled
            value={current_academy?.title}
            placeholder={t("academy_verification.nelc.entity")}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.nelc.entity_license_type")}
          errors={errors.education_license_type?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder={t("academy_verification.nelc.entity_license_type_placeholder")}
                options={ENTITY_LICENSE_OPTIONS}
                {...field}
              />
            )}
            name={"education_license_type"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.nelc.facility_type")}
          errors={errors.organization_type?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder={t("academy_verification.nelc.facility_type_placeholder")}
                options={facilities}
                disabled={facilities == null}
                {...field}
              />
            )}
            name={"organization_type"}
            control={control}
          />
        </Form.Group>
        {watch("sector")?.value == TYPE_TRAINING.TYPE_OTHER && (
          <Form.Group
            required
            className="mb-0 w-full"
            label={t("academy_verification.nelc.other")}
            errors={errors.other?.message as string}
          >
            <Controller
              render={({ field }) => (
                <Form.Input
                  placeholder={t("academy_verification.nelc.other")}
                  {...field}
                />
              )}
              name={"other"}
              control={control}
            />
          </Form.Group>
        )}
        <Form.Group
          required={watch("sector")?.value !== ENTITY_TYPES.TYPE_GOVERNMENTAL}
          className="mb-0 w-full"
          label={t("academy_verification.nelc.activity_license_number")}
          errors={errors.activity_license_number?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.nelc.activity_license_number_placeholder")}
                {...field}
              />
            )}
            name={"activity_license_number"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required={watch("sector")?.value !== ENTITY_TYPES.TYPE_GOVERNMENTAL}
          className="mb-0 w-full"
          label={t("academy_verification.nelc.activity_license_expiry_date")}
          errors={errors.activity_license_expiry_date?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                type="date"
                placeholder={t("academy_verification.nelc.activity_license_expiry_date_placeholder")}
                {...field}
              />
            )}
            name={"activity_license_expiry_date"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required={watch("sector")?.value !== ENTITY_TYPES.TYPE_GOVERNMENTAL}
          label={t("academy_verification.nelc.activity_license_number_image")}
          errors={errors.activity_license_image?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.File
                accept={["image/*", "application/pdf"]}
                maxFiles={1}
                {...field}
              />
            )}
            name={"activity_license_image"}
            control={control}
          />
        </Form.Group>
      </div>
    </div>
  );
};
export default EntityData;
