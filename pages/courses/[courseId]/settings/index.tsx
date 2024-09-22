import { ChangeEvent, useEffect } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadCategories, loadDifficulties, loadInstructors, loadPages } from "@/actions/options";
import { DurationInput, HelpdeskLink, Layout, Taps } from "@/components";
import { Select } from "@/components/select";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery, useUpdateCourseMutation } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, Course, TaxonomyType, User } from "@/types";
import { getMissingFileIds, randomUUID, slugify } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { Editor, FULL_TOOLBAR_BUTTONS, Form, SingleFile, Typography, useAbjad } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IFormInputs {
  title: string;
  slug: string;
  instructors: Array<{
    label: string;
    value: any;
  }>;
  duration: number;
  page: {
    label: string;
    value: any;
  } | null;
  thumbnail?: SingleFile[];
  summary: string | null;
  intro_video: string | null;
  description: string | null;
  outcomes:
    | Array<{
        label: string;
        value: any;
      }>
    | null
    | string;
  requirements:
    | Array<{
        label: string;
        value: any;
      }>
    | null
    | string;
  meta_title: string;
  meta_description: string;
  difficulty: {
    label: string;
    value: any;
  };
  category: {
    label: string;
    value: any;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const intro_websites =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|vimeo\.com|play\.gumlet\.io\/embed\/[^\/]+|gumlet\.tv\/watch\/[^\/]+)|^null$|^$/;

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    slug: yup.string().required(),
    instructors: yup.array().min(1).required(),
    page: yup.mixed(),
    thumbnail: yup.mixed(),
    intro_video: yup.string().nullable().matches(intro_websites, t("courses.course_intro_video_input_error")),
    description: yup.string().nullable(),
    duration: yup
      .mixed()
      .required()
      .test("duration", t("courses.course_duration_validation"), (value) => value >= 1),
    summary: yup.string().min(0).max(200).nullable(),
    outcomes: yup.array().of(yup.object().shape({ label: yup.string().required(), value: yup.string().required() })),
    requirements: yup
      .array()
      .of(yup.object().shape({ label: yup.string().required(), value: yup.string().required() })),
    meta_title: yup.string(),
    meta_description: yup.string(),
    category: yup
      .mixed()
      .required()
      .test(
        "select-one",
        t("validation.field_min_items"),
        (value) => value?.value !== null && value?.value !== undefined
      ),
    difficulty: yup.mixed()
  });

  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const [updateCourseMutation] = useUpdateCourseMutation();

  const abjad = useAbjad();

  const form = useForm<IFormInputs>({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, isDirty },
    setError,
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (!isEmpty(course)) {
      reset({
        title: course?.title,
        slug: course?.slug,
        instructors: course?.instructors.map((instructor: User) => ({
          label: instructor.name,
          value: instructor.id
        })),
        duration: course?.duration,
        page: course.page
          ? {
              label: course.page?.title,
              value: course.page?.id
            }
          : null,
        thumbnail: course?.thumbnail ? [course?.thumbnail] : [],
        description: course?.description,
        summary: course?.summary,
        intro_video: course?.intro_video,
        outcomes: Array.isArray(course.outcomes)
          ? course.outcomes?.map((outcome: string) => ({ label: outcome, value: outcome }))
          : [],
        requirements: Array.isArray(course.requirements)
          ? course.requirements?.map((requirement: string) => ({ label: requirement, value: requirement }))
          : [],
        meta_title: course?.meta_title ?? "",
        meta_description: course?.meta_description ?? "",
        difficulty: {
          label: course?.difficulty?.name,
          value: course?.difficulty?.id
        },
        category: course.category
          ? {
              label: course?.category?.name,
              value: course?.category?.id
            }
          : undefined
      });
    }
    abjad.setEditorPlugin("plugins.image.uploadURL", `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/temp-media`);
    abjad.setEditorPlugin("plugins.image.paramName", "file");
  }, [course]);

  useEffect(() => {
    if (watch("title")) {
      dispatch({ type: "app/setTitle", payload: watch("title") });
    } else {
      dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
    }
  }, [watch("title")]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const obj = {
      ...omit(data, ["instructors", "page", "outcomes", "requirements", "difficulty", "category", "thumbnail"]),
      instructors: data.instructors.map((instructor) => instructor.value),
      page_id: data.page?.value || "",
      outcomes:
        Array.isArray(data.outcomes) && data.outcomes.length > 0
          ? data.outcomes.map((outcome) => outcome.value)
          : JSON.stringify([]),
      requirements:
        Array.isArray(data.requirements) && data.requirements.length > 0
          ? data.requirements.map((requirement) => requirement.value)
          : JSON.stringify([]),
      difficulty_id: data.difficulty.value,
      category_id: data.category.value,
      thumbnail: data.thumbnail?.map((file) => file.file).pop(),
      "deleted-thumbnail": course?.thumbnail ? getMissingFileIds(course?.thumbnail, data.thumbnail ?? []) : []
    };

    const updatedCourse = (await updateCourseMutation({ id: courseId as any, ...obj })) as APIActionResponse<Course>;

    if (displayErrors(updatedCourse)) return;

    displaySuccess(updatedCourse);

    if (!router.query.onboarding) {
      if (course.type == "online") {
        await router.push(`/courses/${courseId}/drip-content`);
      } else {
        await router.push(`/courses/${courseId}/pricing`);
      }
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
      <Taps
        preview_url={course.url}
        type={course.type}
      />
      <Layout.Container>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={course}
                redirect={`/courses/${courseId}`}
                form={form}
              />
            }
          >
            <Form.Section
              title={t("courses.settings.general.title")}
              description={
                <Typography.Paragraph
                  size="md"
                  className="text-gray-700"
                >
                  {t("courses.settings.general.description")}
                  <span className="my-2 flex" />
                  <Trans
                    i18nKey={"helpdesk_description"}
                    components={{
                      a: (
                        <HelpdeskLink
                          slug={"bany-aldorat-5xyfa4"}
                          className="text-info hover:underline"
                        />
                      )
                    }}
                  />
                </Typography.Paragraph>
              }
              className="mb-6"
              hasDivider
              id="general-settings"
            >
              <Form.Group
                required
                label={t("courses.course_name")}
                errors={errors.title?.message}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("courses.course_name_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("courses.course_slug")}
                help={t("courses.course_slug_input_help")}
                errors={errors.slug?.message}
              >
                <Controller
                  name="slug"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Form.Input
                      className="swipe-direction"
                      append={
                        <div
                          className="swipe-direction bg-gray px-4 py-3"
                          children="/"
                        />
                      }
                      placeholder="course-13772"
                      value={slugify(value)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const slug = slugify(event.target.value);
                        onChange(slug);
                      }}
                      {...rest}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                label={t("courses.instructors")}
                errors={errors.instructors?.message}
                required
              >
                <Controller
                  name={"instructors"}
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultOptions
                      isMulti
                      placeholder={t("select_from_list")}
                      loadOptions={loadInstructors}
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              {course.type == "online" && (
                <Form.Group
                  errors={errors.duration?.message}
                  label={t("courses.course_duration")}
                  required
                >
                  <Controller
                    name={"duration"}
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <DurationInput
                        onChange={(duration) => onChange(duration)}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              )}

              <Form.Group
                className="mb-0"
                label={t("courses.course_landing_page")}
                help={t("courses.course_landing_page_input_help")}
                tooltip={t("courses.course_landing_page_input_tooltip")}
                errors={errors.page?.message}
              >
                <Controller
                  render={({ field: { ...rest } }) => {
                    return (
                      <Select
                        defaultOptions
                        isClearable={true}
                        placeholder={t("select_from_list")}
                        loadOptions={loadPages}
                        {...rest}
                      />
                    );
                  }}
                  name="page"
                  control={control}
                />
              </Form.Group>
            </Form.Section>

            <Form.Section
              title={t("courses.settings.details.title")}
              description={t("courses.settings.details.description")}
              className="mb-6"
              hasDivider
              id="course-details"
            >
              <div>
                <Form.Group label={t("courses.course_thumbnail")}>
                  <Controller
                    name="thumbnail"
                    control={control}
                    render={({ field }) => (
                      <Form.File
                        accept={["image/*"]}
                        maxSize={2}
                        maxFiles={1}
                        {...field}
                        append={
                          <span
                            className="text-xs text-gray-700"
                            dir="ltr"
                          >
                            {t("preferred_ratio", { ratio: "1324*744 PX" })}
                          </span>
                        }
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={<div className="flex items-center gap-2">{t("courses.course_intro_video")}</div>}
                  errors={errors.intro_video?.message}
                >
                  <Controller
                    render={({ field: { value, ...reset } }) => (
                      <Form.Input
                        dir="auto"
                        value={value ?? ""}
                        placeholder={t("courses.course_intro_video_input_placeholder")}
                        {...reset}
                      />
                    )}
                    name="intro_video"
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  label={t("courses.course_summary")}
                  errors={errors.summary?.message}
                >
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field: { value, ...rest } }) => {
                      return (
                        <div className="relative mb-4 flex flex-col">
                          <Form.Textarea
                            placeholder={t("courses.course_summary_placeholder")}
                            value={value ?? ""}
                            rows={5}
                            maxLength={200}
                            {...rest}
                          />

                          <div className="absolute -bottom-6 left-0 flex gap-1">
                            <span className="text-xs text-gray-800">200</span>
                            <span className="text-xs text-gray-800">/</span>
                            <span className="text-xs">{value?.length ?? 0}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </Form.Group>
                <Form.Group label={t("courses.course_description")}>
                  <Controller
                    name={"description"}
                    control={control}
                    render={({ field: { onBlur, value, ...rest } }) => {
                      return (
                        <Editor
                          toolbar={FULL_TOOLBAR_BUTTONS}
                          defaultValue={course.description}
                          placeholder={t("courses.course_description_placeholder")}
                          {...rest}
                        />
                      );
                    }}
                  />
                </Form.Group>
                <Form.Group label={t("courses.course_outcomes")}>
                  <Controller
                    name={"outcomes"}
                    control={control}
                    render={({ field }) => (
                      <Select
                        placeholder={t("courses.course_outcomes_input_placeholder")}
                        isMulti
                        isCreatable
                        isClearable
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("courses.course_requirements")}
                  className="mb-0"
                >
                  <Controller
                    name={"requirements"}
                    control={control}
                    render={({ field }) => (
                      <Select
                        placeholder={t("courses.course_requirements_input_placeholder")}
                        isMulti
                        isCreatable
                        isClearable
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </div>
            </Form.Section>

            <Form.Section
              title={t("courses.settings.seo.title")}
              description={t("courses.settings.seo.description")}
              className="mb-6"
              hasDivider
            >
              <Form.Group label={t("meta_title")}>
                <Controller
                  name="meta_title"
                  control={control}
                  render={({ field }) => (
                    <Form.Input
                      placeholder={t("meta_title_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group label={t("meta_description")}>
                <Controller
                  name="meta_description"
                  control={control}
                  render={({ field }) => (
                    <Form.Textarea
                      rows={5}
                      placeholder={t("meta_description_input_placeholder")}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
            </Form.Section>

            <Form.Section
              title={t("courses.settings.category.title")}
              description={t("courses.settings.category.description")}
              className="mb-6"
              hasDivider
            >
              <Form.Group label={t("difficulty")}>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultOptions
                      isCreatable={true}
                      placeholder={t("difficulty_select_placeholder")}
                      loadOptions={(inputValue, callback) => {
                        loadDifficulties(inputValue, callback, {
                          cache_key: randomUUID()
                        });
                      }}
                      {...field}
                    />
                  )}
                />
              </Form.Group>
              <Form.Group
                label={t("category")}
                className="mb-0"
                errors={errors.category?.message}
                required
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultOptions
                      isCreatable={true}
                      placeholder={t("category_select_placeholder")}
                      loadOptions={(inputValue, callback) => {
                        loadCategories(inputValue, callback, TaxonomyType.COURSE_CATEGORY, {
                          cache_key: randomUUID()
                        });
                      }}
                      {...field}
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
