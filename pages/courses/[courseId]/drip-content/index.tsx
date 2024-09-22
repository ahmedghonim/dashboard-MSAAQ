import { useEffect, useMemo, useState } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, EmptyState, Layout, Taps } from "@/components";
import { Select } from "@/components/select";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  DripPayloadType,
  useFetchChaptersQuery,
  useUpdateChaptersDripMutation
} from "@/store/slices/api/chaptersSlice";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, APIResponse, Chapter, Course } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { CalendarIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

import { Alert, Badge, Button, Collapse, Form, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  drip_type: string | "started_at" | "created_at" | "dripped_at";
  default_dripped_at: {
    label: string;
    value: "daily" | "weekly" | "monthly" | "custom";
  };
  chapters: {
    id: number;
    chapter_id: string | number;
    title: string;
    drip_after: string | number | undefined;
    dripped_at: string | undefined;
    drip_enabled: boolean;
  }[];
}

const guessFrequency = (drippedDates: string[]): "daily" | "weekly" | "monthly" | "custom" => {
  if (drippedDates.length < 2) return "custom";

  const dayDifferences: number[] = [];

  const sortedDates = drippedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / (1000 * 60 * 60 * 24);
    dayDifferences.push(diff);
  }

  if (dayDifferences.some((diff) => diff !== dayDifferences[0])) {
    return "custom";
  }

  if (dayDifferences[0] === 1) return "daily";
  if (dayDifferences[0] === 7) return "weekly";
  if (dayDifferences[0] >= 28 && dayDifferences[0] <= 31) return "monthly";

  return "custom";
};

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [hasAnyDrip, setHasAnyDrip] = useState<boolean>(false);

  const {
    query: { courseId }
  } = router;

  useEffect(() => {
    if (router.query.onboarding == "course-drip") {
      setHasAnyDrip(true);
    }
  }, [router]);

  const {
    data: chapters = {} as APIResponse<Chapter>,
    isLoading,
    refetch
  } = useFetchChaptersQuery(courseId as string, {
    refetchOnMountOrArgChange: true
  });

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  useEffect(() => {
    if (!isLoading && chapters.data?.length) {
      const drippedChapter = chapters.data?.find((chapter) => chapter.drip_type);
      reset({
        ...(drippedChapter?.drip_type === "dripped_at"
          ? {
              default_dripped_at: {
                label: t(
                  `courses.default_drip_options.${guessFrequency(chapters.data?.map((chapter) => chapter.dripped_at))}`
                ),
                value: guessFrequency(chapters.data?.map((chapter) => chapter.dripped_at))
              }
            }
          : {
              default_dripped_at: {
                label: t(`courses.default_drip_options.daily`),
                value: "daily"
              }
            }),
        drip_type: drippedChapter?.drip_type ?? "started_at",
        chapters:
          chapters.data?.map((chapter, index) => ({
            id: chapter.id,
            chapter_id: chapter.id,
            title: chapter.title,
            drip_after: chapter.drip_after ?? undefined,
            dripped_at: chapter.dripped_at != null ? dayjs(chapter.dripped_at).format("YYYY-MM-DD") : undefined,
            drip_enabled: !drippedChapter ? true : chapter.drip_enabled
          })) ?? []
      });
      if (router?.query?.onboarding == "course-drip") {
        setHasAnyDrip(true);
      } else {
        setHasAnyDrip(!!drippedChapter);
      }
    }
  }, [chapters, router]);

  const schema = yup.object().shape({
    default_dripped_at: yup.object().when("drip_type", {
      is: "dripped_at",
      then: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .nullable()
        .required()
    }),
    drip_type: yup.string().required(),
    chapters: yup.array().when("drip_type", {
      is: (value: string) => value !== "dripped_at",
      then: yup.array().of(
        yup.object().shape({
          chapter_id: yup.mixed().required(),
          drip_after: yup
            .number()
            .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
            .when("drip_enabled", {
              is: true,
              then: yup
                .number()
                .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
                .integer()
                .min(1, t("courses.drip_after_validation"))
                .required()
            }),
          drip_enabled: yup.boolean().required()
        })
      ),
      otherwise: yup.array().of(
        yup.object().shape({
          chapter_id: yup.mixed().required(),
          dripped_at: yup.string().when("drip_enabled", {
            is: true,
            then: yup.string().nullable().required(),
            otherwise: yup.string().nullable().notRequired()
          }),
          drip_enabled: yup.boolean().required()
        })
      )
    })
  });

  const form = useForm<IFormInputs>({
    defaultValues: {
      default_dripped_at: {
        label: t("courses.default_drip_options.daily"),
        value: "daily"
      },
      chapters: []
    },
    resolver: yupResolver(schema),
    mode: "all"
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    setError,
    getValues,
    formState: { errors, isValid, isDirty }
  } = form;

  const [durationType, setDurationType] = useState<string | null>(null);

  useEffect(() => {
    let date: string | undefined = undefined;
    const $chapters = getValues("chapters")?.map((chapter, index) => {
      if (durationType == "daily") {
        date = dayjs()
          .add(index + 1, "day")
          .format("YYYY-MM-DD");
      } else if (durationType == "weekly") {
        date = dayjs()
          .add(index + 1, "week")
          .format("YYYY-MM-DD");
      } else if (durationType == "monthly") {
        date = dayjs()
          .add(index + 1, "month")
          .format("YYYY-MM-DD");
      } else {
        date =
          chapter.dripped_at != undefined
            ? dayjs(chapter.dripped_at).format("YYYY-MM-DD")
            : dayjs()
                .add(index + 1, "day")
                .format("YYYY-MM-DD");
      }

      return {
        ...chapter,
        chapter_id: chapter.id,
        dripped_at: date,
        drip_after: undefined,
        drip_enabled: chapter.drip_enabled
      };
    });
    setValue("chapters", $chapters);
  }, [durationType, watch("drip_type")]);

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  const [updateChaptersDripMutation] = useUpdateChaptersDripMutation();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedCourse = (await updateChaptersDripMutation({
      id: courseId as any,
      drip_type: data.drip_type,
      chapters: data.chapters.map((chapter) => ({
        id: chapter.chapter_id,
        ...(data.drip_type !== "dripped_at" && { drip_after: chapter.drip_after }),
        ...(data.drip_type === "dripped_at" && { dripped_at: chapter.dripped_at }),
        drip_enabled: chapter.drip_enabled
      })) as DripPayloadType["chapters"]
    })) as APIActionResponse<Course>;
    if (displayErrors(updatedCourse)) return;

    displaySuccess(updatedCourse);
    if (!router.query.onboarding) {
      await router.push(`/courses/${courseId}/pricing`);
      refetch();
    } else {
      eventBus.emit("tour:nextStep");
    }
  };

  const dripType = useMemo<any>(
    () => ({
      started_at: t("courses.drip_after_start_watching"),
      created_at: t("courses.drip_after_enrollment"),
      dripped_at: t("courses.drip_after_custom_input_helper")
    }),
    []
  );

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
        {hasAnyDrip ? (
          <AddonController addon="courses.drip-content">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Layout.FormGrid
                sidebar={
                  <>
                    <Layout.FormGrid.Actions
                      product={course}
                      redirect={`/courses/${courseId}`}
                      form={form}
                    />
                    <div className="rounded-md border border-gray bg-white px-4 py-6">
                      <Alert
                        variant="default"
                        title={t("courses.drip_content.pro_tips.title")}
                        children={t("courses.drip_content.pro_tips.description")}
                        dismissible
                        className="mb-6"
                      />
                      <div className="flex flex-col space-y-4">
                        {Array.from({ length: 3 }).map((tip, index) => (
                          <div
                            key={index}
                            className="flex items-center"
                          >
                            <div className="ml-1.5 h-[24px] w-[24px] items-center justify-center rounded-full bg-gray text-center">
                              <Typography.Paragraph
                                size="sm"
                                weight="normal"
                                as="span"
                                children={index + 1}
                              />
                            </div>
                            <Typography.Paragraph
                              size="md"
                              weight="medium"
                              as="span"
                              children={t(`courses.drip_content.pro_tips.tips.${index + 1}`)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                }
              >
                <Form.Section
                  title={t("courses.drip_content.title")}
                  description={t("courses.drip_content.description")}
                  id="drip-content"
                >
                  <div className="mb-6 flex flex-col">
                    <Typography.Subtitle
                      as="h3"
                      size="sm"
                      weight="bold"
                      children={t("courses.drip_content.section_title")}
                    />
                    <Typography.Paragraph
                      size="md"
                      weight="medium"
                      className="text-gray-700"
                      children={t("courses.drip_content.section_description")}
                    />
                  </div>
                  <Form.Group className="mb-1">
                    <Controller
                      name={"drip_type"}
                      control={control}
                      render={({ field: { value, ...rest } }) => {
                        return (
                          <Form.Radio
                            label={t("courses.drip_after_start_watching")}
                            description={t("courses.drip_after_start_watching_help")}
                            id="started_at"
                            value={"started_at"}
                            checked={value === "started_at"}
                            {...rest}
                          />
                        );
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Controller
                      name={"drip_type"}
                      control={control}
                      render={({ field: { value, ...rest } }) => (
                        <Form.Radio
                          label={t("courses.drip_after_enrollment")}
                          description={t("courses.drip_after_enrollment_help")}
                          id="created_at"
                          value={"created_at"}
                          checked={value === "created_at"}
                          {...rest}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Errors errors={errors.drip_type?.message} />
                  <Form.Group className="relative mb-1">
                    <AddonController
                      type="item"
                      className="my-4 mb-0"
                      addon="courses.drip-content.specific-date"
                    >
                      <Controller
                        name={"drip_type"}
                        control={control}
                        render={({ field: { value, ...rest } }) => (
                          <Form.Radio
                            label={
                              <span className="flex items-center gap-2">
                                {t("courses.dripped_at_enrollment")}
                                <Badge
                                  variant="success"
                                  size="xs"
                                  rounded
                                  children={t("new")}
                                />
                              </span>
                            }
                            description={t("courses.dripped_at_enrollment_help")}
                            id="dripped_at"
                            value={"dripped_at"}
                            checked={value === "dripped_at"}
                            {...rest}
                          />
                        )}
                      />
                    </AddonController>
                  </Form.Group>

                  <Form.Errors errors={errors.drip_type?.message} />
                  <div className="mt-6 space-y-6">
                    {watch("drip_type") === "dripped_at" && (
                      <Form.Group
                        className="mb-0 mr-8"
                        label={t("courses.default_drip_label")}
                        errors={errors.default_dripped_at?.message}
                      >
                        <Controller
                          name={`default_dripped_at`}
                          control={control}
                          render={({ field }) => {
                            return (
                              <Select
                                className="max-w-[240px]"
                                options={[
                                  { label: t("courses.default_drip_options.daily"), value: "daily" },
                                  { label: t("courses.default_drip_options.weekly"), value: "weekly" },
                                  { label: t("courses.default_drip_options.monthly"), value: "monthly" },
                                  { label: t("courses.default_drip_options.custom"), value: "custom" }
                                ]}
                                defaultValue={{
                                  label: t("courses.default_drip_options.daily"),
                                  value: "daily"
                                }}
                                {...field}
                                onChange={(option) => {
                                  setDurationType(option.value);
                                  field.onChange(option);
                                }}
                              />
                            );
                          }}
                        />
                      </Form.Group>
                    )}
                    {getValues("chapters")?.map((chapter, index) => (
                      <Collapse
                        defaultOpen
                        key={chapter.chapter_id}
                      >
                        {({ isOpen }) => (
                          <>
                            <Collapse.Button className="bg-primary-50 text-end">
                              <div className="flex flex-grow flex-row justify-between text-start">
                                <Typography.Paragraph
                                  size="md"
                                  weight="medium"
                                  children={chapter.title}
                                />
                                <div className="flex items-center gap-x-1">
                                  <Controller
                                    name={`chapters.${index}.drip_enabled`}
                                    control={control}
                                    render={({ field: { value, ...rest } }) => (
                                      <Form.Toggle
                                        id={rest.name}
                                        value={Number(value ?? 1)}
                                        checked={value}
                                        {...rest}
                                      />
                                    )}
                                  />
                                  <Icon
                                    className={`
                                      isOpen ? "rotate-180 transform" : ""
                                    } transition-all duration-300 ease-in-out`}
                                  >
                                    <ChevronUpIcon />
                                  </Icon>
                                </div>
                              </div>
                            </Collapse.Button>
                            <Collapse.Content className="bg-primary-50  p-4">
                              <div className="flex flex-row items-center">
                                <Typography.Paragraph
                                  as="span"
                                  weight="medium"
                                  children={t("courses.will_drip_after")}
                                />

                                {watch("drip_type") !== "dripped_at" ? (
                                  <Controller
                                    name={`chapters.${index}.drip_after`}
                                    control={control}
                                    render={({ field }) => {
                                      return (
                                        <Form.Number
                                          className="mx-2 w-2/4"
                                          placeholder="0"
                                          suffix="يوم"
                                          disabled={!watch(`chapters.${index}.drip_enabled`)}
                                          {...field}
                                        />
                                      );
                                    }}
                                  />
                                ) : (
                                  <Controller
                                    name={`chapters.${index}.dripped_at`}
                                    control={control}
                                    render={({ field }) => {
                                      return (
                                        <Form.Input
                                          type="date"
                                          placeholder="DD/MM/YYYY"
                                          disabled={
                                            !watch(`chapters.${index}.drip_enabled`) ||
                                            watch("default_dripped_at")?.value !== "custom"
                                          }
                                          className="mx-2 w-2/4"
                                          {...field}
                                        />
                                      );
                                    }}
                                  />
                                )}
                                <Typography.Paragraph
                                  as="span"
                                  weight="medium"
                                >
                                  {dripType[watch("drip_type")]}
                                </Typography.Paragraph>
                              </div>
                              {watch("drip_type") !== "dripped_at" ? (
                                <Form.Errors errors={errors.chapters?.[index]?.drip_after?.message} />
                              ) : (
                                <Form.Errors errors={errors.chapters?.[index]?.dripped_at?.message} />
                              )}
                            </Collapse.Content>
                          </>
                        )}
                      </Collapse>
                    ))}
                  </div>
                </Form.Section>
              </Layout.FormGrid>
            </Form>
          </AddonController>
        ) : (
          <EmptyState
            title={t("courses.drip_content_empty_state_title")}
            icon={<CalendarIcon />}
            content={t("courses.drip_content_empty_state_description")}
          >
            <Button
              onClick={() => {
                setHasAnyDrip(true);
              }}
              children={t("courses.create_drip_content")}
            />
          </EmptyState>
        )}
      </Layout.Container>
    </Layout>
  );
}
