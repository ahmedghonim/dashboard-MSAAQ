import React, { FC, useMemo } from "react";

import { Trans, useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { ENTITY_TYPES, OWNER_ID_TYPES_OPTIONS, StepProps } from "@/components/academyVerification";
import { Select } from "@/components/select";
import CountriesSelect from "@/components/select/CountriesSelect";
import PhoneInput from "@/components/shared/PhoneInput";

import { Form, Typography } from "@msaaqcom/abjad";

const IdentityVerificationStep: FC<StepProps> = ({ control, errors, getValues }) => {
  const { t } = useTranslation();
  const isIndividual = useMemo(
    () => getValues("type") && getValues("type").value === ENTITY_TYPES.TYPE_INDIVIDUAL,
    [getValues("type")]
  );
  return (
    <>
      <div className="my-10 flex flex-col gap-y-6">
        <Form.Group
          required
          label={t("academy_verification.owner_legal_name")}
          errors={errors.owner_legal_name?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.owner_legal_name_placeholder")}
                {...field}
              />
            )}
            name={"owner_legal_name"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.owner_id_number")}
          errors={errors.owner_id_number?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("academy_verification.owner_id_number_placeholder")}
                {...field}
              />
            )}
            name={"owner_id_number"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.owner_nationality")}
          errors={errors.owner_nationality?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <CountriesSelect
                placeholder={t("academy_verification.owner_nationality_placeholder")}
                {...field}
              />
            )}
            name={"owner_nationality"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.owner_phone")}
          errors={errors.owner_phone?.message as string}
        >
          <Controller
            render={({ field }) => (
              <PhoneInput
                placeholder={t("academy_verification.owner_phone_placeholder")}
                {...field}
              />
            )}
            name={"owner_phone"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.owner_birthday")}
          errors={errors.owner_birthday?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                type="date"
                {...field}
              />
            )}
            name={"owner_birthday"}
            control={control}
          />
        </Form.Group>
        <div className="flex flex-col gap-y-6">
          <Form.Group
            required
            label={t("academy_verification.address.region")}
            help={t("academy_verification.address.region_help")}
            errors={errors.address?.region?.message}
            className="mb-0"
          >
            <Controller
              render={({ field }) => (
                <Form.Input
                  placeholder={t("academy_verification.address.region_placeholder")}
                  {...field}
                />
              )}
              name="address.region"
              control={control}
            />
          </Form.Group>
          <Form.Group
            required
            label={t("academy_verification.address.city")}
            errors={errors.address?.city?.message}
            className="mb-0"
          >
            <Controller
              render={({ field }) => (
                <Form.Input
                  placeholder={t("academy_verification.address.city_placeholder")}
                  {...field}
                />
              )}
              name="address.city"
              control={control}
            />
          </Form.Group>
          <Form.Group
            required
            label={t("academy_verification.address.postcode")}
            errors={errors.address?.postcode?.message}
            className="mb-0"
          >
            <Controller
              render={({ field }) => (
                <Form.Number
                  withHandlers={false}
                  placeholder={t("academy_verification.address.postcode_placeholder")}
                  {...field}
                />
              )}
              name="address.postcode"
              control={control}
            />
          </Form.Group>
          <Form.Group
            required
            label={t("academy_verification.address.full_address")}
            errors={errors.address?.address?.message}
            className="mb-0"
          >
            <Controller
              render={({ field }) => (
                <Form.Textarea
                  placeholder={t("academy_verification.address.full_address_placeholder")}
                  {...field}
                />
              )}
              name="address.address"
              control={control}
            />
          </Form.Group>
        </div>
        <Form.Group
          required
          label={t("academy_verification.owner_id_type")}
          errors={errors.owner_id_type?.message}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder={t("academy_verification.owner_id_type_placeholder")}
                options={OWNER_ID_TYPES_OPTIONS}
                {...field}
              />
            )}
            name={"owner_id_type"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.owner_id_image_front")}
          errors={errors.owner_id_number_front_image?.message}
          help={t("academy_verification.owner_id_image")}
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
            name={"owner_id_number_front_image"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          label={t("academy_verification.owner_id_image_back")}
          errors={errors.owner_id_number_back_image?.message}
          help={t("academy_verification.owner_id_image")}
          className="mb-0"
        >
          <Controller
            render={({ field }) => (
              <Form.File
                accept={["image/*", "application/pdf"]}
                maxFiles={1}
                append={
                  <Typography.Paragraph
                    as="span"
                    size="sm"
                    className="text-black"
                    children={t("academy_verification.owner_id_image_back")}
                  />
                }
                {...field}
              />
            )}
            name={"owner_id_number_back_image"}
            control={control}
          />
        </Form.Group>
        {isIndividual && (
          <Form.Group
            label={
              <Trans
                i18nKey="academy_verification.freelancing_licence"
                components={{
                  span: <span className="text-sm text-gray-700" />
                }}
              />
            }
            className="mb-0"
            errors={errors.freelancing_licence?.message}
          >
            <Controller
              render={({ field }) => (
                <Form.File
                  accept={["image/*", "application/pdf"]}
                  maxFiles={1}
                  {...field}
                />
              )}
              name={"freelancing_licence"}
              control={control}
            />
          </Form.Group>
        )}
      </div>
    </>
  );
};
export default IdentityVerificationStep;
