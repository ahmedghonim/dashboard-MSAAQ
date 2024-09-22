import { FC, PropsWithChildren, createElement, useCallback, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout, SuccessModal } from "@/components";
import {
  ENTITY_LICENSE_OPTIONS,
  ENTITY_LICENSE_TYPE,
  ENTITY_TYPES,
  ENTITY_TYPES_OPTIONS,
  FACILITY_GENERAL_EDUCATION_OPTIONS,
  FACILITY_HIGH_EDUCATION_OPTIONS,
  FACILITY_TRAINING_OPTIONS,
  INelcVerificationFormInputs,
  TYPE_TRAINING,
  VERIFICATION_STEPS
} from "@/components/academyVerification/nelc";
import BasicInformation from "@/components/academyVerification/nelc/steps/BasicInformation";
import EntityData from "@/components/academyVerification/nelc/steps/EntityData";
import VerificationPayment from "@/components/academyVerification/nelc/steps/VerificationPayment";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { useFetchEntityQuery } from "@/store/slices/api/entitySlice";
import { classNames } from "@/utils";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

function getStepContent(step: number) {
  switch (step) {
    case VERIFICATION_STEPS.BASICـINFORMATION:
    default:
      return BasicInformation;
    case VERIFICATION_STEPS.ENTITYـDATA:
      return EntityData;
    case VERIFICATION_STEPS.PAYMENTـFEES:
      return VerificationPayment;
    case VERIFICATION_STEPS.OBTAININGـLICENSE:
      return BasicInformation;
  }
}

const StepIcon: FC<PropsWithChildren<{ status: "active" | "inactive" | "completed" }>> = ({ status, ...props }) => {
  switch (status) {
    case "inactive":
      return (
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full bg-gray text-xs font-medium text-black"
          {...props}
        />
      );
    case "active":
      return (
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-medium text-white"
          {...props}
        />
      );
    case "completed":
      return (
        <Icon
          className="h-6 w-6 text-success"
          children={<CheckCircleIcon />}
        />
      );
  }
};
const LoadingCard = () => {
  return (
    <Card className="mx-auto mb-6 lg:w-7/12">
      <Card.Body>
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 w-full rounded bg-gray md:w-2/4" />
            <div className="grid grid-cols-2 gap-4 rounded bg-gray-100 p-4">
              <div className="flex flex-row items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
              <div className="flex flex-row items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
            </div>
            <div className="my-10 flex flex-col gap-y-6 lg:flex-row lg:gap-x-6 lg:gap-y-0">
              <div className="flex w-full flex-col">
                <div className="mb-2 h-2 w-full rounded bg-gray" />
                <div className="h-10 w-full rounded bg-gray" />
              </div>
              <div className="flex w-full flex-col">
                <div className="mb-2 h-2 w-full rounded bg-gray" />
                <div className="h-10 w-full rounded bg-gray" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex w-6/12 flex-row items-center gap-x-4">
                <div className="h-5 w-5 rounded bg-gray"></div>
                <div className="h-2 w-full rounded bg-gray"></div>
              </div>
              <div className="h-10 w-3/12 rounded bg-gray" />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
type StepStatus = "active" | "inactive" | "completed";
type StepType = {
  label: string;
  status: StepStatus;
};
export default function Verify() {
  const { t } = useTranslation();
  const router = useRouter();

  const [dataStillLoading, setDataStillLoading] = useState<boolean>(false);

  const {
    query: { step }
  } = router;

  const [activeStep, setActiveStep] = useState<number>(0);

  const { data: entity } = useFetchEntityQuery();

  useEffect(() => {
    if (entity && entity.data.has_nelc_license) {
      router.push("/settings/verify/status");
    } else {
      if (entity && entity.data.nelc_order_id) {
        router.push("/settings/verify/status");
      }
    }
  }, [entity]);

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const verificationValidationStepsSchema = {
    [VERIFICATION_STEPS.BASICـINFORMATION]: yup.object().shape({
      sector: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      city: yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required()
      }),
      arabic_name: yup.string().required(),
      english_name: yup.string().required(),
      status: yup.string().when("sector.value", {
        is: (value: any) =>
          value === ENTITY_TYPES.TYPE_PRIVATE || value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER,
        then: yup.string().required()
      }),
      commercial_register_issue_date: yup.date().when("sector.value", {
        is: (value: any) =>
          value === ENTITY_TYPES.TYPE_PRIVATE || value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER,
        then: yup.date().required()
      }),
      commercial_register_expiry_date: yup.date().when("sector.value", {
        is: (value: any) =>
          value === ENTITY_TYPES.TYPE_PRIVATE || value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER,
        then: yup.date().required()
      }),
      national_id: yup.string().when("sector.value", {
        is: (value: any) =>
          value === ENTITY_TYPES.TYPE_PRIVATE || value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER,
        then: yup.string().required()
      }),
      commercial_activity: yup.string().when("sector.value", {
        is: (value: any) =>
          value === ENTITY_TYPES.TYPE_PRIVATE || value === ENTITY_TYPES.TYPE_NON_PROFIT_COMMERCIAL_REGISTER,
        then: yup.string().required()
      }),

      official_website: yup
        .string()
        .matches(/^(http:\/\/|https:\/\/)/, t("validation.link_requires_http"))
        .when("sector.value", {
          is: (value: any) => value === ENTITY_TYPES.TYPE_NON_PROFIT_NO_COMMERCIAL_REGISTER,
          then: yup
            .string()
            .required()
            .matches(/^(http:\/\/|https:\/\/)/, t("validation.link_requires_http"))
        }),

      logo: yup
        .mixed()
        .nullable()
        .when("sector.value", {
          is: (value: any) => value === ENTITY_TYPES.TYPE_NON_PROFIT_NO_COMMERCIAL_REGISTER,
          then: yup
            .array()
            .of(yup.mixed())
            .min(1, t("validation.field_file_min_files", { files: 1 }))
            .max(1, t("validation.field_file_max_files", { files: 1 }))
            .required(),
          otherwise: yup.array().nullable().notRequired()
        })
    }),
    [VERIFICATION_STEPS.ENTITYـDATA]: yup.object().shape({
      organization_type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      education_license_type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      sector: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      activity_license_expiry_date: yup.string().when("sector.value", {
        is: (value: any) => value !== ENTITY_TYPES.TYPE_GOVERNMENTAL,
        then: yup.string().required(),
        otherwise: yup.string().nullable().notRequired()
      }),
      activity_license_number: yup.string().when("sector.value", {
        is: (value: any) => value !== ENTITY_TYPES.TYPE_GOVERNMENTAL,
        then: yup.string().required(),
        otherwise: yup.string().nullable().notRequired()
      }),
      activity_license_image: yup
        .array()
        .of(yup.mixed())
        .when("sector.value", {
          is: (value: any) => value !== ENTITY_TYPES.TYPE_GOVERNMENTAL,
          then: yup
            .array()
            .of(yup.mixed())
            .min(1, t("validation.field_file_min_files", { files: 1 }))
            .max(1, t("validation.field_file_max_files", { files: 1 }))
            .required(),
          otherwise: yup.array().nullable().notRequired()
        }),
      other: yup.string().when("sector.value", {
        is: (value: any) => value === TYPE_TRAINING.TYPE_OTHER,
        then: yup.string().required()
      })
    }),
    [VERIFICATION_STEPS.PAYMENTـFEES]: yup.object().notRequired()
  };

  const currentValidationSchema = verificationValidationStepsSchema[activeStep];

  const totalSteps = useMemo(() => Object.keys(VERIFICATION_STEPS).length, []);

  const [cities, setCities] = useState<any | null>(null);

  useEffect(() => {
    const apiUrl = "https://forward.msaaq.com/api/nelc/cities";

    axios
      .get(apiUrl, {
        headers: {
          "X-Access-Token": process.env.NEXT_PUBLIC_FORWARD_ACCESS_TOKEN
        }
      })
      .then((response) => {
        const arr = Object.keys(response.data.data).map((key) => ({
          id: key,
          ...response.data.data[key]
        }));
        setCities(
          arr.map((city: any, index: number) => ({
            value: index + 1,
            label: city.arabic_name
          }))
        );
      })
      .catch((error) => {});
  }, []);

  const form = useForm<INelcVerificationFormInputs>({
    mode: "all",
    resolver: yupResolver(currentValidationSchema)
  });

  const {
    control,
    formState: { errors, isValid },
    getValues,
    watch,
    trigger,
    setValue,
    reset
  } = form;

  useEffect(() => {
    if (entity && cities) {
      reset({
        sector: ENTITY_TYPES_OPTIONS.find((item) => item.value == entity.data.sector),
        city: {
          label: cities[Number(entity.data.nelc_city_id)].label,
          value: cities[Number(entity.data.nelc_city_id)].value
        },
        arabic_name: entity.data.arabic_name ?? undefined,
        english_name: entity.data.english_name ?? undefined,
        status: entity.data.status ?? undefined,
        commercial_register_issue_date: entity.data.commercial_register_issue_date ?? undefined,
        commercial_register_expiry_date: entity.data.commercial_register_expiry_date ?? undefined,
        national_id: entity.data.national_id ?? undefined,
        commercial_activity: entity.data.commercial_activity ?? undefined,
        official_website: entity.data.official_website ?? undefined,
        logo: entity.data.logo ?? undefined,
        organization_type:
          entity.data.education_license_type == ENTITY_LICENSE_TYPE.TYPE_HIGH_EDUCATION
            ? FACILITY_HIGH_EDUCATION_OPTIONS.find((item) => item.value == entity.data.organization_type)
            : entity.data.education_license_type == ENTITY_LICENSE_TYPE.TYPE_GENERAL_EDUCATION
            ? FACILITY_GENERAL_EDUCATION_OPTIONS.find((item) => item.value == entity.data.organization_type)
            : FACILITY_TRAINING_OPTIONS.find((item) => item.value == entity.data.organization_type),
        education_license_type: ENTITY_LICENSE_OPTIONS.find((item) => item.value == entity.data.education_license_type),
        activity_license_expiry_date: entity.data.activity_license_expiry_date ?? undefined,
        activity_license_number: entity.data.activity_license_number ?? undefined,
        activity_license_image: entity.data.activity_license_image ? [entity.data.activity_license_image] : undefined,
        other: entity.data.other ?? undefined
      });
    }
  }, [entity, cities]);

  const [facilities, setFacilities] = useState<any>(null);

  useEffect(() => {
    setFacilities(null);
    if (watch("education_license_type")?.value == ENTITY_LICENSE_TYPE.TYPE_HIGH_EDUCATION) {
      setFacilities(FACILITY_HIGH_EDUCATION_OPTIONS);
    }
    if (watch("education_license_type")?.value == ENTITY_LICENSE_TYPE.TYPE_GENERAL_EDUCATION) {
      setFacilities(FACILITY_GENERAL_EDUCATION_OPTIONS);
    }
    if (watch("education_license_type")?.value == ENTITY_LICENSE_TYPE.TYPE_TRAINING) {
      setFacilities(FACILITY_TRAINING_OPTIONS);
    }
  }, [watch("education_license_type")]);

  const steps = useMemo(
    (): Array<StepType | {}> => [
      {
        label: t("academy_verification.basic_info"),
        status:
          activeStep === VERIFICATION_STEPS.BASICـINFORMATION
            ? "active"
            : activeStep > VERIFICATION_STEPS.BASICـINFORMATION
            ? "completed"
            : "inactive"
      },
      {
        label: t("academy_verification.entity_data"),
        status:
          activeStep === VERIFICATION_STEPS.ENTITYـDATA
            ? "active"
            : activeStep > VERIFICATION_STEPS.ENTITYـDATA
            ? "completed"
            : "inactive"
      },
      {
        label: t("academy_verification.payment_fees"),
        status:
          activeStep === VERIFICATION_STEPS.PAYMENTـFEES
            ? "active"
            : activeStep > VERIFICATION_STEPS.PAYMENTـFEES
            ? "completed"
            : "inactive"
      },
      {
        label: t("academy_verification.obtaining_license"),
        status:
          activeStep === VERIFICATION_STEPS.OBTAININGـLICENSE
            ? "active"
            : activeStep > VERIFICATION_STEPS.OBTAININGـLICENSE
            ? "completed"
            : "inactive"
      }
    ],
    [activeStep, getValues]
  );

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === 0) {
        return prevActiveStep;
      }
      const prevStep = prevActiveStep - 1;
      return prevStep;
    });
  }, []);

  const handleNext = useCallback(async () => {
    const isStepValid = await trigger();
    if (isStepValid)
      setActiveStep((prevActiveStep) => {
        if (prevActiveStep === totalSteps - 1) {
          return prevActiveStep;
        }
        const nextStep = prevActiveStep + 1;
        return nextStep;
      });
  }, [trigger, getValues]);

  return (
    <Layout title={t("academy_verification.title")}>
      <Layout.Container>
        {dataStillLoading ? (
          <LoadingCard />
        ) : (
          <>
            <Card className="mx-auto lg:w-7/12">
              <Card.Body title={t("academy_verification.nelc.title")}>
                <div
                  className={classNames(
                    "rounded bg-gray-100 p-4",
                    activeStep === VERIFICATION_STEPS.BASICـINFORMATION ? "grid grid-cols-4" : "flex justify-between"
                  )}
                >
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-x-2"
                    >
                      <StepIcon
                        status={(step as StepType).status}
                        children={index + 1}
                      />
                      <Typography.Paragraph
                        as="span"
                        children={(step as StepType).label}
                      />
                    </div>
                  ))}
                </div>
                {createElement(getStepContent(activeStep), {
                  control,
                  errors,
                  isValid,
                  setValue,
                  handleNext,
                  handleBack,
                  form,
                  trigger,
                  getValues,
                  watch,
                  cities,
                  facilities
                })}
                {activeStep !== 0 && activeStep !== totalSteps - 2 && (
                  <div className="flex items-center justify-between">
                    <>
                      <Button
                        variant="dismiss"
                        children={t("academy_verification.back")}
                        onClick={handleBack}
                      />
                      <Button
                        disabled={!isValid}
                        children={t("academy_verification.next")}
                        onClick={handleNext}
                      />
                    </>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Layout.Container>
      <SuccessModal
        open={showSuccessModal}
        onDismiss={async () => {
          await router.push("/settings/verify/status");
          setShowSuccessModal(false);
        }}
        title={t("academy_verification.success_modal.title")}
        description={t("academy_verification.success_modal.description")}
        buttons={
          <>
            <Button
              as={Link}
              href="/settings/verify/status"
              size="lg"
              children={t("academy_verification.success_modal.go_to_status")}
            />
            <Button
              as={Link}
              href="/"
              variant="default"
              size="lg"
              children={t("go_to_dashboard")}
            />
          </>
        }
      />
    </Layout>
  );
}
