import { FC, PropsWithChildren, createElement, useCallback, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import find from "lodash/find";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, EmptyState, Layout, SuccessModal } from "@/components";
import {
  ActivityVerification,
  BankAccountInformation,
  CountryAndActivityType,
  ENTITY_TYPES,
  ENTITY_TYPES_OPTIONS,
  IAcademyVerificationFormInputs,
  IdentityVerification,
  OWNER_ID_TYPES_OPTIONS,
  VERIFICATION_STEPS
} from "@/components/academyVerification";
import CreateNewProductModal from "@/components/modals/CreateNewProductModal";
import { GTM_EVENTS, useAppDispatch, useAppSelector, useGTM, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCoursesQuery } from "@/store/slices/api/coursesSlice";
import { useCreateEntityMutation, useFetchEntityQuery } from "@/store/slices/api/entitySlice";
import { useFetchProductsQuery } from "@/store/slices/api/productsSlice";
import { AppSliceStateType, fetchAcademyVerificationStatus } from "@/store/slices/app-slice";
import { APIActionResponse, CourseStatus, ProductStatus } from "@/types";
import { classNames } from "@/utils";

import { InboxStackIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

import { Alert, Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

function getStepContent(step: number) {
  switch (step) {
    case VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE:
    default:
      return CountryAndActivityType;
    case VERIFICATION_STEPS.IDENTITY_VERIFICATION:
      return IdentityVerification;
    case VERIFICATION_STEPS.ACTIVITY_VERIFICATION:
      return ActivityVerification;
    case VERIFICATION_STEPS.BANK_ACCOUNT_INFORMATION:
      return BankAccountInformation;
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
  const dispatch = useAppDispatch();

  const [dataStillLoading, setDataStillLoading] = useState<boolean>(true);

  const {
    query: { step }
  } = router;

  const [activeStep, setActiveStep] = useState<number>(0);

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showAddNew, setShowAddNew] = useState<boolean>(false);
  const [hasAnyProduct, setHasAnyProduct] = useState<boolean>(false);

  const { data: products, isLoading: isProductsLoading } = useFetchProductsQuery({
    filters: {
      status: ProductStatus.PUBLISHED
    }
  });

  const { data: courses, isLoading: isCoursesLoading } = useFetchCoursesQuery({
    filters: {
      status: CourseStatus.PUBLISHED
    }
  });

  const { data: entity, isLoading } = useFetchEntityQuery();
  const [createEntityMutation] = useCreateEntityMutation();

  const verificationValidationStepsSchema = {
    [VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE]: yup.object().shape({
      country_code: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      has_tax_number: yup.boolean().nullable(),
      tax_number: yup.string().nullable().when("has_tax_number", {
        is: true,
        then: yup.string().nullable().required(),
        otherwise: yup.string().nullable().notRequired()
      }),
      tax_number_certificate_image: yup
        .mixed()
        .nullable()
        .when("has_tax_number", {
          is: true,
          then: yup
            .array()
            .of(yup.mixed())
            .min(1, t("validation.field_file_min_files", { files: 1 }))
            .max(1, t("validation.field_file_max_files", { files: 1 }))
            .required(),
          otherwise: yup.array().nullable().notRequired()
        }),
      terms: yup.boolean().oneOf([true], "يجب الموافقة على الشروط والأحكام").required()
    }),
    [VERIFICATION_STEPS.IDENTITY_VERIFICATION]: yup.object().shape({
      owner_legal_name: yup.string().nullable().required(),
      owner_id_number: yup.string().nullable().required(),
      owner_phone: yup.mixed().nullable().required(),
      owner_birthday: yup.string().nullable().required(),
      owner_nationality: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      address: yup
        .object()
        .shape({
          region: yup.string().nullable().required(),
          city: yup.string().nullable().required(),
          postcode: yup.string().nullable().required(),
          address: yup.string().nullable().required()
        })
        .required(),
      owner_id_type: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(),
      owner_id_number_front_image: yup
        .array()
        .of(yup.mixed())
        .min(1, t("validation.field_file_min_files", { files: 1 }))
        .max(1, t("validation.field_file_max_files", { files: 1 }))
        .required(),
      owner_id_number_back_image: yup
        .array()
        //@ts-ignore
        .of(yup.mixed())
        .min(1, t("validation.field_file_min_files", { files: 1 }))
        .max(1, t("validation.field_file_max_files", { files: 1 }))
        .required(),
      freelancing_licence: yup
        .array()
        //@ts-ignore
        .of(yup.mixed())
        .max(1, t("validation.field_file_max_files", { files: 1 }))
        .nullable()
    }),
    [VERIFICATION_STEPS.ACTIVITY_VERIFICATION]: yup.object().shape({
      legal_name: yup.string().nullable().required(),
      commercial_register: yup.string().nullable().required(),
      commercial_register_image: yup
        .array()
        //@ts-ignore
        .of(yup.mixed())
        .min(1, t("validation.field_file_min_files", { files: 1 }))
        .max(1, t("validation.field_file_max_files", { files: 1 }))
        .required()
    }),
    [VERIFICATION_STEPS.BANK_ACCOUNT_INFORMATION]: yup.object().shape({
      bank: yup
        .object()
        .shape({
          account_name: yup.string().nullable().required(),
          bank_name: yup.string().nullable().required(),
          account_number: yup.string().nullable().required(),
          currency: yup
            .object()
            .shape({
              label: yup.string().required(),
              value: yup.string().required()
            })
            .required(),
          iban: yup.string().nullable().required(),
          bic: yup.string().nullable().nullable(),
          iban_certificate_image: yup
            .array()
            //@ts-ignore
            .of(yup.mixed())
            .min(1, t("validation.field_file_min_files", { files: 1 }))
            .max(1, t("validation.field_file_max_files", { files: 1 }))
            .required()
        })
        .required()
    })
  };

  const currentValidationSchema = verificationValidationStepsSchema[activeStep];

  const totalSteps = useMemo(() => Object.keys(VERIFICATION_STEPS).length, []);

  const form = useForm<IAcademyVerificationFormInputs>({
    mode: "all",
    resolver: yupResolver(currentValidationSchema)
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting, isDirty },
    getValues,
    watch,
    setValue,
    trigger,
    setError
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const steps = useMemo(
    (): Array<StepType | {}> => [
      ...(activeStep !== VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE
        ? [
            {
              label: t("academy_verification.country_and_activity"),
              status:
                activeStep === VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE
                  ? "active"
                  : activeStep > VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE
                  ? "completed"
                  : "inactive"
            }
          ]
        : []),
      {
        label: t("academy_verification.identity_verification"),
        status:
          activeStep === VERIFICATION_STEPS.IDENTITY_VERIFICATION
            ? "active"
            : activeStep > VERIFICATION_STEPS.IDENTITY_VERIFICATION
            ? "completed"
            : "inactive"
      },
      ...(activeStep !== VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE &&
      getValues("type")?.value !== ENTITY_TYPES.TYPE_INDIVIDUAL
        ? [
            {
              label: t("academy_verification.activity_verification"),
              status:
                activeStep === VERIFICATION_STEPS.ACTIVITY_VERIFICATION
                  ? "active"
                  : activeStep > VERIFICATION_STEPS.ACTIVITY_VERIFICATION
                  ? "completed"
                  : "inactive"
            }
          ]
        : []),
      {
        label: t("academy_verification.bank_account_information"),
        status:
          activeStep === VERIFICATION_STEPS.BANK_ACCOUNT_INFORMATION
            ? "active"
            : activeStep > VERIFICATION_STEPS.BANK_ACCOUNT_INFORMATION
            ? "completed"
            : "inactive"
      }
    ],
    [activeStep, getValues]
  );

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => {
      const type = getValues("type").value;

      if (prevActiveStep === 0) {
        return prevActiveStep;
      }
      const prevStep = prevActiveStep - 1;
      if (type === ENTITY_TYPES.TYPE_INDIVIDUAL && prevStep === VERIFICATION_STEPS.ACTIVITY_VERIFICATION) {
        return prevStep - 1;
      }
      return prevStep;
    });
  }, []);

  const handleNext = useCallback(async () => {
    const isStepValid = await trigger();
    if (isStepValid)
      setActiveStep((prevActiveStep) => {
        const type = getValues("type").value;

        if (prevActiveStep === totalSteps - 1) {
          return prevActiveStep;
        }
        const nextStep = prevActiveStep + 1;
        if (type === ENTITY_TYPES.TYPE_INDIVIDUAL && nextStep === VERIFICATION_STEPS.ACTIVITY_VERIFICATION) {
          return nextStep + 1;
        }
        return nextStep;
      });
  }, [trigger, getValues]);

  const { countries, currencies } = useAppSelector<AppSliceStateType>((state) => state.app);

  const goToStep = useCallback(async () => {
    const stepIndex = VERIFICATION_STEPS[step as keyof typeof VERIFICATION_STEPS];
    if (stepIndex !== undefined) {
      let stepTemp = activeStep;
      while (stepIndex > stepTemp) {
        await handleNext();
        stepTemp++;
      }
    }
  }, [activeStep, step, handleNext]);

  useEffect(() => {
    if (entity && !isLoading && countries.length && currencies.length) {
      const country_code = find(
        countries,
        (el) => el.iso_3166_1_alpha2.toLowerCase() === entity.data.country_code?.toLowerCase()
      );
      const nationality = find(
        countries,
        (el) => el.iso_3166_1_alpha2.toLowerCase() === entity.data.owner_nationality?.toLowerCase()
      );

      const currency = find(currencies, (el) => el.code.toLowerCase() === entity.data.bank.currency?.toLowerCase());

      reset({
        ...entity.data,
        has_tax_number: Boolean(entity.data.tax_number),
        tax_number_certificate_image: entity.data.tax_number_certificate_image
          ? [entity.data.tax_number_certificate_image]
          : [],
        owner_id_number_back_image: entity.data.owner_id_number_back_image
          ? [entity.data.owner_id_number_back_image]
          : [],
        owner_id_number_front_image: entity.data.owner_id_number_front_image
          ? [entity.data.owner_id_number_front_image]
          : [],
        owner_phone: {
          number: entity.data.owner_phone,
          dialCode: entity.data.owner_phone_code
        },
        freelancing_licence: entity.data.freelancing_licence ? [entity.data.freelancing_licence] : [],
        commercial_register_image: entity.data.commercial_register_image ? [entity.data.commercial_register_image] : [],
        owner_id_type: OWNER_ID_TYPES_OPTIONS.find((el) => el.value === entity.data.owner_id_type),
        terms: entity.data.terms || true,
        country_code: {
          label: country_code?.ar_name,
          value: country_code?.iso_3166_1_alpha2
        },
        owner_nationality: {
          label: nationality?.ar_name,
          value: nationality?.iso_3166_1_alpha2
        },
        type: ENTITY_TYPES_OPTIONS.find((el) => el.value === entity.data.type),
        bank: {
          ...entity.data.bank,
          currency: {
            ...currency,
            label: currency?.name,
            value: currency?.code
          },
          iban_certificate_image: entity.data.bank.iban_certificate_image
            ? [entity.data.bank.iban_certificate_image]
            : []
        }
      });

      if (step) {
        goToStep();
      }
    } else {
      reset({
        terms: true,
        has_tax_number: false
      });
    }
  }, [entity, countries, currencies]);

  useEffect(() => {
    if (watch("country_code")?.value) {
      if (watch("country_code")?.value !== "SA") {
        setValue("has_tax_number", false);
      }
    }
  }, [watch("country_code")]);

  useEffect(() => {
    if (!isCoursesLoading && !isProductsLoading && courses?.data && products?.data) {
      setHasAnyProduct(courses.data.length > 0 || products.data.length > 0);
      setDataStillLoading(false);
    }
  }, [courses, products]);

  const { sendGTMEvent } = useGTM();
  const onSubmit: SubmitHandler<IAcademyVerificationFormInputs> = async (data) => {
    if (isSubmitting) return;

    const transformedData = {
      ...omit(
        data,
        "has_tax_number",
        "freelancing_licence",
        "tax_number_certificate_image",
        "legal_name",
        "commercial_register",
        "commercial_register_image"
      ),
      type: data.type?.value,
      country_code: data.country_code?.value,
      tax_number: data.tax_number,
      tax_number_certificate_image: data.tax_number_certificate_image?.map((file) => file.file).pop(),
      owner_nationality: data.owner_nationality?.value,
      owner_id_type: data.owner_id_type?.value,
      owner_id_number_back_image: data.owner_id_number_back_image?.map((file) => file.file).pop(),
      owner_id_number_front_image: data.owner_id_number_front_image?.map((file) => file.file).pop(),
      owner_phone: data.owner_phone.number,
      owner_phone_code: data.owner_phone.dialCode,
      ...(data.type?.value === ENTITY_TYPES.TYPE_INDIVIDUAL && {
        freelancing_licence: data.freelancing_licence?.map((file) => file.file).pop()
      }),
      ...(data.type?.value !== ENTITY_TYPES.TYPE_INDIVIDUAL && {
        legal_name: data.legal_name,
        commercial_register: data.commercial_register,
        commercial_register_image: data.commercial_register_image?.map((file) => file.file).pop()
      }),
      bank: {
        ...data.bank,
        currency: data.bank?.currency?.value,
        iban_certificate_image: data.bank?.iban_certificate_image
          ? data.bank.iban_certificate_image?.map((file) => file.file).pop()
          : null
      }
    };

    const entity = (await createEntityMutation(transformedData)) as APIActionResponse<any>;

    if (displayErrors(entity)) return;

    displaySuccess(entity);
    dispatch(fetchAcademyVerificationStatus());

    sendGTMEvent(GTM_EVENTS.ENTITY_VERIFICATION_REQUESTED);

    setShowSuccessModal(true);
  };

  return (
    <Layout title={t("academy_verification.title")}>
      <Layout.Container>
        {/*  <Card className="mx-auto mb-6 lg:w-7/12">
          <Card.Body className="flex items-center justify-between">
            <div className="flex gap-x-1">
              <Icon className="text-info">
                <CheckBadgeIcon />
              </Icon>
              <Typography.Paragraph
                size="sm"
                weight="normal"
                className="w-6/12"
                children={t("academy_verification.why_verify")}
              />
            </div>
            <div className="flex items-center gap-x-1 rounded-full border border-2 border-gray p-2">
              <Typography.Paragraph as="span">{t("global.verified_by")}</Typography.Paragraph>
              <Image
                src={"/images/msaaq-logo-colored.svg"}
                alt={"msaaq logo"}
                width={46}
                height={20}
              />
            </div>
          </Card.Body>
        </Card> */}
        {dataStillLoading ? (
          <LoadingCard />
        ) : hasAnyProduct ? (
          <>
            <Card className="mx-auto lg:w-7/12">
              {entity?.data && (
                <Card.Body>
                  <Alert
                    variant="warning"
                    dismissible={false}
                    children={t("academy_verification.currency_change_alert")}
                  />
                </Card.Body>
              )}
              <Card.Body title={t("academy_verification.two_step_verification")}>
                <div
                  className={classNames(
                    "rounded bg-gray-100 p-4",
                    activeStep === VERIFICATION_STEPS.COUNTRY_AND_ACTIVITY_TYPE
                      ? "grid grid-cols-2"
                      : "flex justify-between"
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
                  handleNext,
                  handleBack,
                  getValues,
                  watch
                })}
                {activeStep !== 0 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="dismiss"
                      children={t("academy_verification.back")}
                      onClick={handleBack}
                    />
                    {activeStep === totalSteps - 1 ? (
                      <Button
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !isDirty}
                        onClick={handleSubmit(onSubmit)}
                      >
                        {t("academy_verification.complete_verifying")}
                      </Button>
                    ) : (
                      <Button
                        /*disabled={!isValid}*/
                        children={t("academy_verification.next")}
                        onClick={handleNext}
                      />
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        ) : (
          <div className="mx-auto mb-6 lg:w-7/12">
            <EmptyState
              icon={<InboxStackIcon />}
              content={t("academy_verification.unable_to_verify")}
            >
              <Button
                icon={<Icon children={<PlusCircleIcon />} />}
                children={t("academy_verification.add_your_first_product")}
                onClick={() => setShowAddNew(true)}
              />
            </EmptyState>
          </div>
        )}
      </Layout.Container>
      <CreateNewProductModal
        open={showAddNew}
        onDismiss={() => {
          setShowAddNew(false);
        }}
      />
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
