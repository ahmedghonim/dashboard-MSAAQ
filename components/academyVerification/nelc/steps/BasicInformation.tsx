import { FC, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";

import { ENTITY_TYPES, ENTITY_TYPES_OPTIONS, StepProps } from "@/components/academyVerification/nelc";
import { Select } from "@/components/select";
import { useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import { useFetchEntityQuery } from "@/store/slices/api/entitySlice";
import { useCheckWathqMutation } from "@/store/slices/api/nelcSlice";
import { APIActionResponse } from "@/types";

import { Button, Form, Typography } from "@msaaqcom/abjad";

const BasicInformation: FC<StepProps> = ({
  control,
  errors,
  handleNext,
  setValue,
  watch,
  isValid,
  trigger,
  cities
}) => {
  const { t } = useTranslation();

  const [wathqData, setWathqData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkWathq] = useCheckWathqMutation();
  const { displayErrors } = useResponseToastHandler({});
  const [wathqError, setWathqError] = useState<any | null>(null);

  const { data: entity = {} } = useFetchEntityQuery();

  const handleCheckWathq = async (commercial_register: string) => {
    const wathq = (await checkWathq({
      commercial_register
    })) as APIActionResponse<any>;
    if (wathq?.error) {
      displayErrors(wathq);
      setWathqError(wathq?.error);
    }
    if (wathq?.data) {
      setWathqData(wathq?.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (entity) {
      if (
        watch("sector")?.value == ENTITY_TYPES.TYPE_GOVERNMENTAL ||
        watch("sector")?.value == ENTITY_TYPES.TYPE_PRIVATE
      ) {
        setValue("commercial_register", entity?.data?.commercial_register);
      }
    }
  }, [entity, watch("sector")]);
  useEffect(() => {
    if (wathqData && wathqData.data) {
      setValue("status", wathqData.data.status.name);
      setValue("status_value", wathqData.data.status.id);
      setValue("arabic_name", wathqData.data.crName);
      setValue("english_name", watch("english_name") ?? undefined);
      setValue("commercial_register_issue_date", dayjs(wathqData.data.issueDate).format("YYYY-MM-DD"));
      setValue("commercial_register_expiry_date", dayjs(wathqData.data.expiryDate).format("YYYY-MM-DD"));
      setValue("national_id", wathqData.data.crEntityNumber);
      setValue("commercial_activity", wathqData.data.activities.isic[0].name);

      trigger();
    }
  }, [wathqData]);

  return (
    <div>
      <div className="my-10 flex flex-col gap-y-6">
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.nelc.branch_type")}
          errors={errors.type?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder={t("academy_verification.nelc.bussiness_type_placeholder")}
                options={ENTITY_TYPES_OPTIONS}
                {...field}
              />
            )}
            name={"sector"}
            control={control}
          />
        </Form.Group>
        <Form.Group
          required
          className="mb-0 w-full"
          label={t("academy_verification.nelc.city")}
          errors={errors.city?.value?.message as string}
        >
          <Controller
            render={({ field }) => (
              <Select
                placeholder={t("academy_verification.nelc.city_placeholder")}
                options={cities}
                {...field}
              />
            )}
            name={"city"}
            control={control}
          />
        </Form.Group>
        {watch("sector")?.value === ENTITY_TYPES.TYPE_GOVERNMENTAL && (
          <>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.entity_name")}
              errors={errors.arabic_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.entity_name_placeholder")}
                    {...field}
                  />
                )}
                name={"arabic_name"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.english_name")}
              errors={errors.english_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.english_name")}
                    {...field}
                  />
                )}
                name={"english_name"}
                control={control}
              />
            </Form.Group>
          </>
        )}
        {(watch("sector")?.value === ENTITY_TYPES.TYPE_PRIVATE ||
          watch("sector")?.value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER) && (
          <>
            <div>
              <Typography.Paragraph
                className="mb-2"
                weight="medium"
                children={
                  <span className="flex">
                    {t("academy_verification.nelc.commercial_register")} <span className="text-danger">&nbsp;*</span>
                  </span>
                }
              />
              <div className="flex items-start gap-2">
                <Form.Group
                  required
                  className="mb-0 w-full"
                  errors={errors.commercial_register?.message || wathqError?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        readOnly
                        placeholder={t("academy_verification.nelc.commercial_register_placeholder")}
                        {...field}
                      />
                    )}
                    name={"commercial_register"}
                    control={control}
                  />
                </Form.Group>
                <Button
                  disabled={!watch("commercial_register")}
                  type="button"
                  isLoading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    setWathqError(null);
                    handleCheckWathq(watch("commercial_register"));
                  }}
                  variant="default"
                  children={t("academy_verification.nelc.verify")}
                />
              </div>
            </div>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.entity_name")}
              errors={errors.arabic_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.entity_name_placeholder")}
                    {...field}
                  />
                )}
                name={"arabic_name"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.english_name")}
              errors={errors.english_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.english_name")}
                    {...field}
                  />
                )}
                name={"english_name"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.status")}
              errors={errors.status?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    disabled
                    placeholder={t("academy_verification.nelc.status_placeholder")}
                    {...field}
                  />
                )}
                name={"status"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.commercial_register_issue_date")}
              errors={errors.commercial_register_issue_date?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    disabled
                    type="date"
                    placeholder={t("academy_verification.nelc.commercial_register_issue_date_placeholder")}
                    {...field}
                  />
                )}
                name={"commercial_register_issue_date"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.commercial_register_expiry_date")}
              errors={errors.commercial_register_expiry_date?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    type="date"
                    disabled
                    placeholder={t("academy_verification.nelc.commercial_register_expiry_date_placeholder")}
                    {...field}
                  />
                )}
                name={"commercial_register_expiry_date"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.national_id")}
              errors={errors.national_id?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    disabled
                    placeholder={t("academy_verification.nelc.national_id_placeholder")}
                    {...field}
                  />
                )}
                name={"national_id"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.commercial_activity")}
              errors={errors.commercial_activity?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    disabled
                    placeholder={t("academy_verification.nelc.commercial_activity_placeholder")}
                    {...field}
                  />
                )}
                name={"commercial_activity"}
                control={control}
              />
            </Form.Group>
          </>
        )}
        {watch("sector")?.value === ENTITY_TYPES.TYPE_NON_PROFIT_NO_COMMERCIAL_REGISTER && (
          <>
            <Form.Group
              required
              label={t("academy_verification.nelc.logo")}
              errors={errors.logo?.message}
              className="mb-0"
            >
              <Controller
                render={({ field }) => (
                  <Form.File
                    accept={["image/*"]}
                    maxFiles={1}
                    {...field}
                  />
                )}
                name={"logo"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.entity_name")}
              errors={errors.arabic_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.entity_name_placeholder")}
                    {...field}
                  />
                )}
                name={"arabic_name"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.english_name")}
              errors={errors.english_name?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    placeholder={t("academy_verification.nelc.english_name")}
                    {...field}
                  />
                )}
                name={"english_name"}
                control={control}
              />
            </Form.Group>

            <Form.Group
              required
              className="mb-0 w-full"
              label={t("academy_verification.nelc.official_website")}
              errors={errors.official_website?.message as string}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    dir="ltr"
                    placeholder={"https://example.com"}
                    {...field}
                  />
                )}
                name={"official_website"}
                control={control}
              />
            </Form.Group>
          </>
        )}
      </div>
      <div>
        <Button
          disabled={!isValid || wathqError}
          children={t("academy_verification.next")}
          onClick={handleNext}
        />
      </div>
    </div>
  );
};
export default BasicInformation;
