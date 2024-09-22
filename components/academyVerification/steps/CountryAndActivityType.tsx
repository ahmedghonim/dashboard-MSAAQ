import React, { FC } from "react";

import { Trans, useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { ENTITY_TYPES_OPTIONS, StepProps } from "@/components/academyVerification";
import { Select } from "@/components/select";
import CountriesSelect from "@/components/select/CountriesSelect";

import { Button, Form } from "@msaaqcom/abjad";

const CountryAndActivityTypeStep: FC<StepProps> = ({ control, errors, handleNext, watch }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="my-10 flex flex-col gap-y-6 lg:flex-row lg:gap-x-6 lg:gap-y-0">
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("country")}
          errors={errors.country_code?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <CountriesSelect
                placeholder="حدد الدولة"
                {...field}
              />
            )}
            name={"country_code"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.type")}
          errors={errors.type?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder="نوع النشاط"
                options={ENTITY_TYPES_OPTIONS}
                {...field}
              />
            )}
            name={"type"}
            control={control}
          />
        </Form.Group>
      </div>
      {watch("country_code")?.value === "SA" && (
        <Form.Group>
          <Controller
            render={({ field: { value, ...rest } }) => (
              <Form.Checkbox
                id={rest.name}
                label={t("academy_verification.has_tax_number_label")}
                description={t("academy_verification.has_tax_number_description")}
                value={Number(value ?? 0)}
                checked={value}
                {...rest}
              >
                {({ checked }) =>
                  checked && (
                    <>
                      <Form.Group
                        required
                        className="pt-4"
                        label={t("academy_verification.tax_number")}
                        errors={errors.tax_number?.message}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.Input
                              placeholder={t("academy_verification.tax_number_placeholder")}
                              {...field}
                            />
                          )}
                          name={"tax_number"}
                          control={control}
                        />
                      </Form.Group>
                      <Form.Group
                        required
                        label={t("academy_verification.tax_number_certificate_image")}
                        className="mb-0"
                        errors={errors.tax_number_certificate_image?.message}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.File
                              accept={["image/*", "application/pdf"]}
                              maxFiles={1}
                              {...field}
                            />
                          )}
                          name={"tax_number_certificate_image"}
                          control={control}
                        />
                      </Form.Group>
                    </>
                  )
                }
              </Form.Checkbox>
            )}
            name={"has_tax_number"}
            control={control}
          />
        </Form.Group>
      )}
      <div className="flex items-center justify-between">
        <Form.Group
          className="mb-0"
          errors={errors.terms?.message}
        >
          <Controller
            render={({ field: { value, ...rest } }) => (
              <Form.Checkbox
                id={rest.name}
                value={Number(value ?? 0)}
                checked={value}
                label={
                  <Trans
                    i18nKey={"academy_verification.agree_to_the_terms_of_use_and_privacy_policy"}
                    components={{
                      a: (
                        <a
                          href="https://msaaq.com/terms/"
                          target="_blank"
                          className="text-info"
                          rel="noreferrer"
                        />
                      )
                    }}
                  />
                }
                {...rest}
              />
            )}
            name={"terms"}
            control={control}
          />
        </Form.Group>
        <Button
          children={t("academy_verification.next")}
          onClick={handleNext}
        />
      </div>
    </>
  );
};
export default CountryAndActivityTypeStep;
