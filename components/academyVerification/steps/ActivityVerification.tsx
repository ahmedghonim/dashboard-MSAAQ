import React, { FC } from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { StepProps } from "@/components/academyVerification";

import { Form } from "@msaaqcom/abjad";

const IdentityVerificationStep: FC<StepProps> = ({ control, errors }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="my-10 flex flex-col gap-y-6">
        <Form.Group
          required
          label={t("academy_verification.legal_name")}
          errors={errors.legal_name?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.legal_name_placeholder")}
                {...field}
              />
            )}
            name={"legal_name"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.commercial_register")}
          errors={errors.commercial_register?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.commercial_register_placeholder")}
                {...field}
              />
            )}
            name={"commercial_register"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          label={t("academy_verification.commercial_register_image")}
          className="mb-0"
          required
          errors={errors.commercial_register_image?.message}
        >
          <Controller
            render={({ field }) => (
              <Form.File
                accept={["image/*"]}
                maxFiles={1}
                {...field}
              />
            )}
            name={"commercial_register_image"}
            control={control}
          />
        </Form.Group>
      </div>
    </>
  );
};
export default IdentityVerificationStep;
