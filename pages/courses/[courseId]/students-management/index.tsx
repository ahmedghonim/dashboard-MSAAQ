import { useEffect } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadCertificatesTemplates } from "@/actions/options";
import { AddonController, Layout, Taps } from "@/components";
import { Select } from "@/components/select";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery, useUpdateCourseMutation } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, Course } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { Badge, Form } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  certification: {
    enabled: boolean;
    quizzes_passing_rate: number;
    contents_attendance_rate: number;
    enable_contents_attendance_rate: boolean;
    enable_meetings_attendance_rate: boolean;
    enable_quiz_passing_rate: boolean;
    meetings_attendance_rate: number;
    quizzes_passing_type: "average" | "all" | undefined;
  };
  certificate_template: {
    label: string;
    value: number;
  } | null;
  options: {
    reviews_enabled: boolean;
  };
  meta: {
    early_access: boolean;
    show_enrollments_count: boolean;
    show_content_instructor: boolean;
    disable_comments: boolean;
    close_enrollments: boolean;
    resubmit_assignment: boolean;
    can_retake_exam: boolean;
  };
  quantity_enabled: boolean;
  quantity: number | null | string;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    query: { courseId }
  } = router;
  const { data: course = {} as Course, isLoading } = useFetchCourseQuery(courseId as string);

  const onlineSchema = yup.object().shape({
    certification: yup.object().shape({
      enabled: yup.boolean().required(),
      enable_meetings_attendance_rate: yup.boolean(),
      enable_contents_attendance_rate: yup.boolean(),
      enable_quiz_passing_rate: yup.boolean(),
      meetings_attendance_rate: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
        .when("enable_meetings_attendance_rate", {
          is: true,
          then: yup
            .number()
            .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .positive()
            .min(1)
            .max(100)
            .required()
        }),
      quizzes_passing_rate: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
        .when("quizzes_passing_type", {
          is: "average",
          then: yup
            .number()
            .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .positive()
            .min(1)
            .max(100)
            .required()
        })
        .when("enable_quiz_passing_rate", {
          is: true,
          then: yup.number().required()
        }),
      contents_attendance_rate: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
        .when("enable_contents_attendance_rate", {
          is: true,
          then: yup
            .number()
            .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .positive()
            .min(1)
            .max(100)
            .required()
        })
    }),
    certificate_template: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.number()
      })
      .nullable()
      .when("certification.enabled", {
        is: true,
        then: yup
          .object()
          .shape({
            label: yup.string().required(),
            value: yup.number().required()
          })
          .nullable()
      }),
    options: yup.object().shape({
      reviews_enabled: yup.boolean().required()
    }),
    meta: yup.object().shape({
      early_access: yup.boolean().required(),
      show_enrollments_count: yup.boolean().required(),
      show_content_instructor: yup.boolean().required(),
      disable_comments: yup.boolean().required(),
      close_enrollments: yup.boolean().required(),
      resubmit_assignment: yup.boolean().required(),
      can_retake_exam: yup.boolean().required()
    }),
    quantity_enabled: yup.mixed().required(),
    quantity: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable()
      .when("quantity_enabled", {
        is: true,
        then: yup
          .number()
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .positive()
          .min(1)
          .required()
      })
  });

  const onSiteSchema = yup.object().shape({
    options: yup.object().shape({
      reviews_enabled: yup.boolean().required()
    }),
    meta: yup.object().shape({
      show_enrollments_count: yup.boolean().required(),
      show_content_instructor: yup.boolean().required(),
      disable_comments: yup.boolean().required(),
      close_enrollments: yup.boolean().required()
    }),
    quantity_enabled: yup.mixed().required(),
    quantity: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .nullable()
      .when("quantity_enabled", {
        is: true,
        then: yup
          .number()
          .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
          .positive()
          .min(1)
          .required()
      })
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(course.type == "online" ? onlineSchema : onSiteSchema)
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isValid, isDirty }
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const [updateCourseMutation] = useUpdateCourseMutation();

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  useEffect(() => {
    if (!isLoading) {
      if (course.type == "online") {
        reset({
          certification: {
            enabled: course.certification.enabled,
            quizzes_passing_rate: course.certification.quizzes_passing_rate,
            contents_attendance_rate: course.certification.contents_attendance_rate,
            meetings_attendance_rate: course.certification.meetings_attendance_rate,
            quizzes_passing_type: course.certification.quizzes_passing_type
          },
          certificate_template: course.certificate_template
            ? {
                label: course.certificate_template?.name,
                value: course.certificate_template?.id
              }
            : null,
          options: {
            reviews_enabled: course.options.reviews_enabled
          },
          meta: {
            early_access: course.meta.early_access,
            show_enrollments_count: course.meta.show_enrollments_count,
            show_content_instructor: course.meta.show_content_instructor,
            disable_comments: course.meta.disable_comments,
            close_enrollments: course.meta.close_enrollments,
            resubmit_assignment: course.meta.resubmit_assignment,
            can_retake_exam: course.meta.can_retake_exam
          },
          quantity: course.quantity
        });
        setValue("certification.enable_meetings_attendance_rate", course.certification.meetings_attendance_rate > 0);
        setValue("certification.enable_contents_attendance_rate", course.certification.contents_attendance_rate > 0);
        setValue(
          "certification.enable_quiz_passing_rate",
          course.certification.quizzes_passing_rate > 0 || course.certification.quizzes_passing_type != null
        );
      } else {
        reset({
          options: {
            reviews_enabled: course.options.reviews_enabled
          },
          meta: {
            show_enrollments_count: course.meta.show_enrollments_count,
            show_content_instructor: course.meta.show_content_instructor,
            disable_comments: course.meta.disable_comments,
            close_enrollments: course.meta.close_enrollments
          },
          quantity: course.quantity
        });
      }
      setValue("quantity_enabled", typeof course.quantity === "number" && course.quantity > 0);
    }
  }, [course]);

  useEffect(() => {
    if (course.type == "online") {
      if (!watch("certification.enabled")) {
        setValue("certificate_template", null);
        setValue("certification.enable_contents_attendance_rate", false);
        setValue("certification.enable_meetings_attendance_rate", false);
      } else {
        setValue(
          "certificate_template",
          course.certificate_template
            ? {
                label: course.certificate_template?.name,
                value: course.certificate_template?.id
              }
            : null
        );
      }
    }
  }, [watch("certification.enabled")]);

  useEffect(() => {
    if (course.type == "online") {
      if (!watch("certification.enable_meetings_attendance_rate")) {
        setValue("certification.meetings_attendance_rate", 0);
      } else {
        setValue("certification.meetings_attendance_rate", course?.certification.meetings_attendance_rate ?? 0);
      }
    }
  }, [watch("certification.enable_meetings_attendance_rate")]);

  useEffect(() => {
    if (course.type == "online") {
      if (!watch("certification.enable_contents_attendance_rate")) {
        setValue("certification.contents_attendance_rate", 0);
      } else {
        setValue("certification.contents_attendance_rate", course?.certification.contents_attendance_rate ?? 0);
      }
    }
  }, [watch("certification.enable_contents_attendance_rate")]);

  useEffect(() => {
    if (!watch("quantity_enabled")) {
      setValue("quantity", "unlimited");
    } else {
      setValue("quantity", course?.quantity ?? 0);
    }
  }, [watch("quantity_enabled")]);

  useEffect(() => {
    if (course.type == "online") {
      if (!watch("certification.enable_quiz_passing_rate")) {
        setValue("certification.quizzes_passing_rate", 0);
        setValue("certification.quizzes_passing_type", undefined);
      }
    }
  }, [watch("certification.enable_quiz_passing_rate")]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    let updatedCourse;

    if (course.type == "online") {
      updatedCourse = (await updateCourseMutation({
        id: courseId as any,
        ...omit(data, ["quantity_enabled", "certification", "certificate_template"]),
        quantity: data.quantity_enabled ? data.quantity : "unlimited",
        certification: {
          ...omit(
            data.certification,
            ["enable_meetings_attendance_rate", "template"],
            ["enable_contents_attendance_rate", "template"],
            ["enable_quiz_passing_rate", "template"]
          ),
          ...(data.certification.enable_quiz_passing_rate
            ? {
                quizzes_passing_rate: data.certification.quizzes_passing_rate,
                quizzes_passing_type: data.certification.quizzes_passing_type
              }
            : {
                quizzes_passing_rate: undefined,
                quizzes_passing_type: undefined
              })
        },
        ...(data.certificate_template && { certificate_template_id: data.certificate_template?.value })
      })) as APIActionResponse<Course>;
    } else {
      updatedCourse = (await updateCourseMutation({
        id: courseId as any,
        ...omit(data, ["quantity_enabled", "certification", "certificate_template"]),
        quantity: data.quantity_enabled ? data.quantity : "unlimited"
      })) as APIActionResponse<Course>;
    }
    if (displayErrors(updatedCourse)) {
      return;
    }

    displaySuccess(updatedCourse);

    if (!router.query.onboarding) {
      await router.push(`/courses/${courseId}/publishing`);
    } else {
      eventBus.emit("tour:nextStep");
    }
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}` });

    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  return (
    <Layout title={course?.title}>
      <Taps preview_url={course.url} />
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={course}
                redirect={`/courses/${courseId}`}
                form={form}
              />
            }
          >
            {course.type == "online" && (
              <Form.Section
                title={t("courses.students_management.certificates.title")}
                description={t("courses.students_management.certificates.description")}
                className="mb-6"
                hasDivider
                id="certificates"
              >
                <Form.Group errors={errors.certification?.enabled?.message}>
                  <Controller
                    name={"certification.enabled"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("courses.enable_course_certificates")}
                        tooltip={t("courses.enable_course_certificates_tooltip")}
                        {...rest}
                      >
                        <Form.Group
                          required
                          label={t("courses.certificate_template_to_give_to_the_student")}
                          className="mb-0 mt-6 w-full md:w-2/4"
                          errors={errors.certificate_template?.message}
                        >
                          <Controller
                            render={({ field }) => (
                              <Select
                                placeholder={t("courses.select_template")}
                                loadOptions={loadCertificatesTemplates}
                                disabled={!watch("certification.enabled")}
                                className="w-full md:w-2/4"
                                {...field}
                              />
                            )}
                            name={"certificate_template"}
                            control={control}
                          />
                        </Form.Group>
                      </Form.Toggle>
                    )}
                  />
                </Form.Group>
                <Form.Group>
                  <Controller
                    name={"certification.enable_contents_attendance_rate"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("courses.contents_attendance_rate_toggle_title")}
                        tooltip={t("courses.contents_attendance_rate_toggle_tooltip")}
                        disabled={!watch("certification.enabled")}
                        {...rest}
                      >
                        <Form.Group
                          required
                          label={t("courses.contents_attendance_rate_title")}
                          className="mb-0 mt-6"
                          errors={errors.certification?.contents_attendance_rate?.message}
                        >
                          <Controller
                            name={"certification.contents_attendance_rate"}
                            control={control}
                            render={({ field }) => (
                              <Form.Number
                                className="w-full md:w-2/4"
                                withHandlers={false}
                                min={0}
                                max={100}
                                disabled={!watch("certification.enable_contents_attendance_rate")}
                                suffix={t("percent")}
                                {...field}
                              />
                            )}
                          />
                        </Form.Group>
                      </Form.Toggle>
                    )}
                  />
                </Form.Group>

                <Form.Group>
                  <Controller
                    name={"certification.enable_meetings_attendance_rate"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("courses.must_watch_all_webinars")}
                        tooltip={t("courses.must_watch_all_webinars_tooltip")}
                        disabled={!watch("certification.enabled")}
                        {...rest}
                      >
                        <Form.Group
                          required
                          label={t("courses.required_watch_all_webinars_rate")}
                          className="mb-0 mt-6"
                          errors={errors.certification?.meetings_attendance_rate?.message}
                        >
                          <Controller
                            name={"certification.meetings_attendance_rate"}
                            control={control}
                            render={({ field }) => (
                              <Form.Number
                                className="w-full md:w-2/4"
                                withHandlers={false}
                                min={0}
                                max={100}
                                disabled={!watch("certification.enable_meetings_attendance_rate")}
                                suffix={t("percent")}
                                {...field}
                              />
                            )}
                          />
                        </Form.Group>
                      </Form.Toggle>
                    )}
                  />
                </Form.Group>

                <div className="relative">
                  <AddonController
                    type="item"
                    addon="quizzes.passing_rate"
                  >
                    <Form.Group>
                      <Controller
                        name={"certification.enable_quiz_passing_rate"}
                        control={control}
                        render={({ field: { value, ...rest } }) => (
                          <Form.Toggle
                            id={rest.name}
                            value={Number(value ?? 0)}
                            checked={value}
                            label={
                              <div className="flex items-center gap-2">
                                {t("courses.enable_quizzes_passing_rate_toggle_title")}
                                <Badge
                                  variant="success"
                                  size="xs"
                                  rounded
                                  children={t("new")}
                                />
                              </div>
                            }
                            disabled={!watch("certification.enabled")}
                            {...rest}
                          />
                        )}
                      />
                    </Form.Group>
                    {watch("certification.enable_quiz_passing_rate") && (
                      <div className="pr-14">
                        <Form.Group>
                          <Controller
                            name={"certification.quizzes_passing_type"}
                            control={control}
                            render={({ field: { value = false, ...rest } }) => (
                              <Form.Radio
                                label={t("courses.enable_quizzes_passing_rate_toggle_label")}
                                tooltip={t("courses.enable_quizzes_passing_rate_toggle_tooltip")}
                                id="unlimited_quizzes"
                                value={"all"}
                                disabled={!watch("certification.enabled")}
                                checked={value == "all"}
                                {...rest}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Controller
                            name={"certification.quizzes_passing_type"}
                            render={({ field: { value = false, ...rest } }) => (
                              <Form.Radio
                                label={t("courses.quizzes_passing_rate_label")}
                                tooltip={t("courses.quizzes_passing_rate_tooltip")}
                                id="limited_quiz"
                                value={"average"}
                                disabled={!watch("certification.enabled")}
                                checked={value == "average"}
                                {...rest}
                              />
                            )}
                            control={control}
                          />
                        </Form.Group>
                        {watch("certification.quizzes_passing_type") == "average" && (
                          <Form.Group
                            label={t("courses.quizzes_passing_rate_title")}
                            required
                            errors={errors.certification?.quizzes_passing_rate?.message}
                          >
                            <Controller
                              control={control}
                              name={"certification.quizzes_passing_rate"}
                              render={({ field: { value = 0, ...rest } }) => (
                                <Form.Number
                                  value={value}
                                  suffix={t("percent")}
                                  className="w-full md:w-2/4"
                                  {...rest}
                                />
                              )}
                            />
                          </Form.Group>
                        )}
                      </div>
                    )}
                  </AddonController>
                </div>
              </Form.Section>
            )}
            <Form.Section
              title={t("courses.students_management.comments_and_reviews.title")}
              description={t("courses.students_management.comments_and_reviews.description")}
              className="mb-6"
              hasDivider
            >
              <Form.Group errors={errors.options?.reviews_enabled?.message}>
                <Controller
                  name={"options.reviews_enabled"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("courses.enable_reviews")}
                      tooltip={t("courses.enable_reviews_tooltip")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group errors={errors.meta?.show_enrollments_count?.message}>
                <Controller
                  name={"meta.show_enrollments_count"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("courses.show_students_numbers")}
                      tooltip={t("courses.show_students_numbers_tooltip")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group errors={errors.meta?.show_content_instructor?.message}>
                <Controller
                  name={"meta.show_content_instructor"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("courses.show_instructor_name")}
                      tooltip={t("courses.show_instructor_name_tooltip")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                className="mb-0"
                errors={errors.meta?.disable_comments?.message}
              >
                <Controller
                  name={"meta.disable_comments"}
                  control={control}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("courses.disable_comments")}
                      tooltip={t("courses.disable_comments_tooltip")}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
            {course.type == "online" && (
              <Form.Section
                title={t("courses.students_management.quizzes_and_assignments.title")}
                description={t("courses.students_management.quizzes_and_assignments.description")}
                className="mb-6"
                hasDivider
              >
                <Form.Group errors={errors.meta?.resubmit_assignment?.message}>
                  <Controller
                    name={"meta.resubmit_assignment"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("courses.students_management.quizzes_and_assignments.allow_resubmission")}
                        tooltip={t("courses.students_management.quizzes_and_assignments.allow_resubmission_tooltip")}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-0"
                  errors={errors.meta?.can_retake_exam?.message}
                >
                  <Controller
                    name={"meta.can_retake_exam"}
                    control={control}
                    render={({ field: { value, ...rest } }) => (
                      <Form.Toggle
                        id={rest.name}
                        value={Number(value ?? 0)}
                        checked={value}
                        label={t("courses.students_management.quizzes_and_assignments.allow_quiz_retake")}
                        tooltip={t("courses.students_management.quizzes_and_assignments.allow_quiz_retake_tooltip")}
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
              </Form.Section>
            )}
            <Form.Section
              title={t("courses.students_management.registration_and_enrollment.title")}
              description={t("courses.students_management.registration_and_enrollment.description")}
            >
              <Form.Group label={t("courses.students_management.registration_and_enrollment.available_seats")}>
                <Controller
                  name={"quantity_enabled"}
                  control={control}
                  render={(
                    { field: { value = false, ...rest } } // Default value provided
                  ) => (
                    <Form.Radio
                      label={t("courses.students_management.registration_and_enrollment.unlimited")}
                      tooltip={t("courses.students_management.registration_and_enrollment.unlimited_tooltip")}
                      id="unlimited_quantity"
                      value={""}
                      checked={!value}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group>
                <Controller
                  name={"quantity_enabled"}
                  render={({ field: { value = false, ...rest } }) => (
                    <Form.Radio
                      label={t("courses.students_management.registration_and_enrollment.limited")}
                      tooltip={t("courses.students_management.registration_and_enrollment.limited_tooltip")}
                      id="limited_quantity"
                      value={1}
                      checked={value}
                      {...rest}
                    />
                  )}
                  control={control}
                />
              </Form.Group>

              {watch("quantity_enabled") && (
                <Form.Group
                  label={t("courses.students_management.registration_and_enrollment.available_seats_count")}
                  required
                  errors={errors.quantity?.message}
                >
                  <Controller
                    control={control}
                    name={"quantity"}
                    render={({ field: { value = 0, ...rest } }) => (
                      <Form.Number
                        value={value ?? 0}
                        suffix={t("student")}
                        className="w-full md:w-2/4"
                        {...rest}
                      />
                    )}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-0">
                <Controller
                  control={control}
                  name={"meta.close_enrollments"}
                  render={({ field: { value, ...rest } }) => (
                    <Form.Toggle
                      id={rest.name}
                      value={Number(value ?? 0)}
                      checked={value}
                      label={t("courses.students_management.registration_and_enrollment.close_registration")}
                      description={t(
                        "courses.students_management.registration_and_enrollment.close_registration_description"
                      )}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
