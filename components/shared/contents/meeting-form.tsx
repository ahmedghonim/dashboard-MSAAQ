import React, { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { DurationInput, Layout } from "@/components";
import { Select } from "@/components/select";
import { useAppDispatch, useConfirmableDelete, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import timezones from "@/public/data/timezones.json";
import {
  useCreateContentMutation,
  useDeleteRecurringMeetingsMutation,
  useUpdateContentMutation
} from "@/store/slices/api/contentsSlice";
import { APIActionResponse, Content, Meeting } from "@/types";
import { classNames, minutesToSeconds, secondsToMinutes } from "@/utils";

import { ArrowPathIcon, ClockIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button, Editor, Form, Icon, Typography } from "@msaaqcom/abjad";

export type IMeetingFormInputs = {
  title: string;
  premium: boolean;
  type: string;
  summary: string;
  meta: {
    meeting_type: "meeting" | "webinar";
    start_time: {
      date: string;
      time: string;
    };
    duration: number | string;
    timezone: {
      label: string;
      value: string;
    };
    settings: {
      mute_upon_entry: boolean;
      allow_multiple_devices: boolean;
      auto_recording: boolean | string;
    };
    is_recurring: boolean;
    recurrence: {
      recurring_type: {
        label: string;
        value: "daily" | "weekly" | "monthly" | "yearly";
      };
      end_type: string;
      end_times: number;
      end_date_time: string;
    };
  };
};

interface IProps {
  defaultValues?: IMeetingFormInputs | any;
}

const recurringOptions = [
  {
    label: "يوم",
    value: "daily"
  },
  {
    label: "أسبوع",
    value: "weekly"
  },
  {
    label: "شهر",
    value: "monthly"
  }
];
export default function MeetingForm({ defaultValues }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const {
    query: { courseId, chapterId, contentId, sort }
  } = router;

  const [createContentMutation] = useCreateContentMutation();
  const [updateContentMutation] = useUpdateContentMutation();

  const schema = yup.object().shape({
    title: yup.string().min(3).required(),
    premium: yup.boolean(),
    type: yup.string(),
    summary: yup.string().nullable().required(),
    meta: yup.object().shape({
      meeting_type: yup.mixed().required().oneOf(["meeting", "webinar"]),
      start_time: yup
        .object()
        .shape({
          date: yup
            .string()
            .required(t("contents.meeting.field_start_time"))
            .test("dateAfterNow", t("contents.meeting.time_after_now"), (_, value) => {
              const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
              const currentTime = dayjs(new Date()).format("HH:mm");
              return value.parent.date > currentDate || value.parent.date === currentDate;
            }),
          time: yup
            .string()
            .required(t("contents.meeting.field_start_time"))
            .test("dateAfterNow", t("contents.meeting.time_after_now"), (_, value) => {
              const currentDate = dayjs(new Date()).format("YYYY-MM-DD");
              const currentTime = dayjs(new Date()).format("HH:mm");
              return (
                value.parent.date > currentDate ||
                (value.parent.date === currentDate && value.parent.time > currentTime)
              );
            })
        })
        .required(),
      duration: yup
        .mixed()
        .required(t("contents.meeting.field_duration"))
        .test("duration", t("contents.meeting.field_min_duration"), (value) => value >= 1),
      timezone: yup
        .object()
        .shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
        .required(t("contents.meeting.field_time_zone")),
      settings: yup.object().shape({
        mute_upon_entry: yup.boolean(),
        auto_recording: yup.boolean()
      }),
      is_recurring: yup.boolean(),
      recurrence: yup.object().when("is_recurring", {
        is: true,
        then: yup.object().shape({
          recurring_type: yup.object().shape({
            label: yup.mixed().required(),
            value: yup.mixed().required().oneOf(["daily", "weekly", "monthly", "yearly"])
          }),
          end_type: yup.string().required(),
          end_times: yup.number().when("end_type", {
            is: "after",
            then: yup
              .number()
              .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
              .required(),
            otherwise: yup
              .number()
              .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
              .nullable()
          }),
          end_date_time: yup.string().when("end_type", {
            is: "at",
            then: yup.string().required(),
            otherwise: yup.string()
          })
        }),
        otherwise: yup.object().shape({
          recurring_type: yup.object().shape({
            label: yup.mixed(),
            value: yup.mixed()
          }),
          end_type: yup.string(),
          end_times: yup
            .number()
            .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value)),
          end_date_time: yup.string()
        })
      })
    })
  });

  const form = useForm<IMeetingFormInputs>({
    defaultValues: {
      type: "meeting",
      premium: false,
      meta: {
        meeting_type: "meeting",
        is_recurring: false,
        settings: {
          mute_upon_entry: false,
          auto_recording: false
        },
        timezone: {
          label: "(GMT+3:00) Riyadh",
          value: "Asia/Riyadh"
        },
        recurrence: {
          recurring_type: {
            label: "يوم",
            value: "daily"
          },
          end_type: "at"
        }
      }
    },
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset
  } = form;

  const mappedTimezones = useMemo(
    () =>
      Object.keys(timezones).map((tz) => ({
        label: timezones[tz as keyof typeof timezones],
        value: tz
      })),
    []
  );

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues?.temp_values) {
      reset({
        title: defaultValues.title,
        summary: defaultValues.summary,
        meta: {
          meeting_type: defaultValues.meta.meeting_type,
          start_time: {
            date: dayjs(defaultValues.meta.start_time).format("YYYY-MM-DD"),
            time: dayjs(defaultValues.meta.start_time).format("HH:mm")
          },
          duration: minutesToSeconds(Number(defaultValues.meta.duration)),
          settings: {
            mute_upon_entry: defaultValues.meta?.settings?.mute_upon_entry ?? false,
            allow_multiple_devices: defaultValues.meta?.settings?.allow_multiple_devices ?? false,
            auto_recording: defaultValues.meta?.settings?.auto_recording == "cloud"
          },
          timezone: {
            label: mappedTimezones.find((tz) => tz.value === defaultValues.meta.timezone)?.label,
            value: mappedTimezones.find((tz) => tz.value === defaultValues.meta.timezone)?.value
          },
          is_recurring: Boolean(Number(defaultValues.meta.is_recurring)),
          ...(defaultValues.meta.recurrence && {
            recurrence: {
              recurring_type: {
                label: recurringOptions.find((r) => r.value === defaultValues.meta.recurrence.type)?.label,
                value: recurringOptions.find((r) => r.value === defaultValues.meta.recurrence.type)?.value as
                  | "daily"
                  | "weekly"
                  | "monthly"
                  | "yearly"
              },
              end_type: defaultValues.meta.recurrence.end_date_time ? "at" : "after",
              end_times: defaultValues.meta.recurrence.end_times,
              end_date_time: defaultValues.meta.recurrence.end_date_time
                ? dayjs(defaultValues.meta.recurrence.end_date_time).format("YYYY-MM-DD")
                : undefined
            }
          })
        }
      });
    }
  }, [defaultValues]);

  useEffect(() => {
    if (!isEmpty(defaultValues) && !defaultValues?.temp_values) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: defaultValues?.title ?? "" });
      }
    }
  }, [watch("title")]);

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: defaultValues?.title ?? "" });
      }
    }
  }, [watch("title")]);

  const onSubmit: SubmitHandler<IMeetingFormInputs> = async (data) => {
    const $data = {
      ...data,
      sort: defaultValues?.sort ?? sort ?? 999,
      meta: {
        ...data.meta,
        recurrence: {
          ...omit(data.meta.recurrence, ["end_type", "recurring_type"]),
          type: data.meta.recurrence.recurring_type.value,
          end_date_time: data.meta.recurrence.end_date_time ? `${data.meta.recurrence.end_date_time} 00:00:00` : null,
          end_times: data.meta.recurrence.end_times
        },
        timezone: data.meta.timezone.value,
        start_time: `${data.meta.start_time.date} ${data.meta.start_time.time}:00`,
        duration: secondsToMinutes(Number(data.meta.duration))
      }
    };

    const mutation = contentId ? updateContentMutation : createContentMutation;
    const content = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: $data
    })) as APIActionResponse<Content<Meeting>>;

    if (displayErrors(content)) {
      return;
    } else {
      displaySuccess(content);
      await router.push({
        pathname: `/courses/[courseId]/chapters`,
        query: { courseId }
      });
    }
  };

  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteRecurringMeetingsMutation
  });

  const handleDeleteRecurringMeetings = async () => {
    await confirmableDelete({
      title: t("contents.meeting.delete_all_recurring_meetings"),
      children: t("contents.meeting.delete_all_recurring_meetings_confirmation"),
      id: contentId as any,
      payload: {
        courseId: courseId as any,
        chapterId: chapterId as any,
        contentId: contentId as any
      },
      callback: () => {
        router.push({
          pathname: `/courses/[courseId]/chapters`,
          query: { courseId }
        });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Layout.FormGrid
        sidebar={
          <Layout.FormGrid.Actions
            product={defaultValues}
            redirect={`/courses/${courseId}/chapters`}
            form={form}
          />
        }
      >
        <Form.Group
          label={t("contents.meeting.input_title")}
          required
          errors={errors.title?.message}
        >
          <Controller
            render={({ field }) => (
              <Form.Input
                placeholder={t("contents.meeting.title_input_placeholder")}
                {...field}
              />
            )}
            name={"title"}
            control={control}
          />
        </Form.Group>

        <Form.Group label={t("contents.meeting.event_type")}>
          <div className="flex items-start justify-between">
            <Controller
              render={({ field: { value, ...rest } }) => (
                <label
                  className={classNames(
                    "w-full cursor-pointer rounded border px-4 py-6",
                    "ml-4 flex items-center gap-2",
                    value === "meeting" ? "border-primary bg-primary-50" : "border-gray"
                  )}
                >
                  <Form.Radio
                    disabled={!defaultValues?.temp_values}
                    id="zoom_meeting"
                    value="meeting"
                    checked={value === "meeting"}
                    label={t("contents.meeting.zoom_meeting")}
                    tooltip={t("contents.meeting.zoom_meeting_tooltip")}
                    {...rest}
                  />
                </label>
              )}
              name={"meta.meeting_type"}
              control={control}
            />
            <Controller
              render={({ field: { value, ...rest } }) => (
                <label
                  className={classNames(
                    "w-full cursor-pointer rounded border px-4 py-6",
                    "flex items-center gap-2",
                    value === "webinar" ? "border-primary bg-primary-50" : "border-gray"
                  )}
                >
                  <Form.Radio
                    disabled={!defaultValues?.temp_values}
                    id="zoom_webinar"
                    value="webinar"
                    checked={value === "webinar"}
                    label={t("contents.meeting.zoom_webinar")}
                    tooltip={t("contents.meeting.zoom_webinar_tooltip")}
                    {...rest}
                  />
                </label>
              )}
              name={"meta.meeting_type"}
              control={control}
            />
            <div />
          </div>
        </Form.Group>
        <Form.Group
          label={t("description")}
          required
          errors={errors.summary?.message}
        >
          <Controller
            render={({ field }) => (
              <Editor
                placeholder={t("contents.meeting.description_input_placeholder")}
                defaultValue={defaultValues?.summary}
                {...field}
              />
            )}
            name={"summary"}
            control={control}
          />
        </Form.Group>

        {/* When */}
        <div className="mb-4 flex flex-col gap-4 md:gap-2">
          <div className="mb-4 flex flex-col">
            <Typography.Paragraph
              size="md"
              weight="medium"
              children={t("contents.meeting.schedule_meeting")}
            />
            <Typography.Paragraph
              size="sm"
              weight="normal"
              className="text-gray-700"
              children={t("contents.meeting.schedule_meeting_description")}
            />
          </div>

          {/* Datetime Selection */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="flex items-center">
              <Icon
                size="sm"
                className="ml-2"
                children={<ClockIcon />}
              />
              <Form.Label
                className="mb-0"
                required
                children={t("contents.meeting.starts_at")}
              />
            </div>
            <Controller
              render={({ field }) => (
                <Form.Input
                  type="date"
                  {...field}
                />
              )}
              name={"meta.start_time.date"}
              control={control}
            />
            <Controller
              render={({ field }) => (
                <Form.Input
                  type="time"
                  {...field}
                />
              )}
              name={"meta.start_time.time"}
              control={control}
            />
          </div>
          <Form.Errors errors={errors.meta?.start_time?.date?.message || errors.meta?.start_time?.time?.message} />

          {/* Duration Selection */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="flex items-center">
              <Icon
                size="sm"
                className="invisible ml-2 hidden md:block"
                children={<ClockIcon />}
              />
              <Form.Label
                required
                className="mb-0"
                children={t("contents.meeting.meeting_duration")}
              />
            </div>

            <div className="col-span-2">
              <Controller
                render={({ field: { onChange, ...field } }) => (
                  <DurationInput
                    secondsInput="exclude"
                    onChange={(duration) => onChange(duration)}
                    {...field}
                  />
                )}
                name={"meta.duration"}
                control={control}
              />
            </div>
          </div>
          <Form.Errors errors={errors.meta?.duration?.message} />

          {/* Timezone Selection */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="flex items-center">
              <Icon
                size="sm"
                className="invisible ml-2 hidden md:block"
                children={<ClockIcon />}
              />
              <Form.Label
                className="mb-0"
                children={t("contents.meeting.time_zone")}
              />
            </div>

            <Controller
              render={({ field }) => (
                <Select
                  options={mappedTimezones}
                  className="col-span-2"
                  {...field}
                />
              )}
              name={"meta.timezone"}
              control={control}
            />
          </div>
          <Form.Errors errors={errors.meta?.timezone?.message} />
        </div>

        {/* Recurring */}
        <Controller
          render={({ field: { value, ...rest } }) => (
            <Form.Checkbox
              id="recurring_meeting"
              checked={value}
              disabled={!!defaultValues?.meta?.is_recurring}
              tooltip={t("contents.meeting.make_it_recurring_meeting_tooltip")}
              label={t("contents.meeting.make_it_recurring_meeting")}
              {...rest}
            >
              {({ checked }) =>
                checked && (
                  <>
                    <div className="mb-4 mt-2 grid grid-cols-3 gap-2">
                      <div className="flex items-center">
                        <Icon
                          size="sm"
                          className="ml-2"
                          children={<ArrowPathIcon />}
                        />
                        <Form.Label className="mb-0">{t("contents.meeting.recurring_every")}</Form.Label>
                      </div>
                      <Controller
                        render={({ field }) => (
                          <Select
                            options={recurringOptions}
                            className="col-span-2"
                            disabled={!!defaultValues?.meta?.is_recurring}
                            {...field}
                          />
                        )}
                        name={"meta.recurrence.recurring_type"}
                        control={control}
                      />
                    </div>

                    <Form.Label children={t("contents.meeting.ends_at")} />
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      <div className="flex items-center">
                        <Controller
                          render={({ field: { value, ...rest } }) => (
                            <Form.Radio
                              label="في"
                              id={"at"}
                              checked={value === "at"}
                              disabled={!!defaultValues?.meta?.is_recurring}
                              value="at"
                              {...rest}
                            />
                          )}
                          name={"meta.recurrence.end_type"}
                          control={control}
                        />
                      </div>
                      <Form.Group
                        className="col-span-2 mb-0"
                        errors={errors.meta?.recurrence?.end_date_time?.message}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.Input
                              type="date"
                              disabled={!!defaultValues?.meta?.is_recurring}
                              {...field}
                            />
                          )}
                          name={"meta.recurrence.end_date_time"}
                          control={control}
                        />
                      </Form.Group>
                    </div>
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      <div className="flex items-center">
                        <Controller
                          render={({ field: { value, ...rest } }) => (
                            <Form.Radio
                              label="بعد"
                              id={"after"}
                              checked={value === "after"}
                              disabled={!!defaultValues?.meta?.is_recurring}
                              value="after"
                              {...rest}
                            />
                          )}
                          name={"meta.recurrence.end_type"}
                          control={control}
                        />
                      </div>
                      <Form.Group
                        className="col-span-2 mb-0"
                        errors={errors.meta?.recurrence?.end_times?.message}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.Number
                              suffix={t("contents.meeting.sessions")}
                              disabled={!!defaultValues?.meta?.is_recurring}
                              withHandlers={false}
                              {...field}
                            />
                          )}
                          name={"meta.recurrence.end_times"}
                          control={control}
                        />
                      </Form.Group>
                    </div>

                    {defaultValues?.meta?.is_recurring && (
                      <Button
                        variant="danger"
                        ghost
                        className="mt-6"
                        icon={<Icon children={<TrashIcon />} />}
                        onClick={handleDeleteRecurringMeetings}
                        children={t("contents.meeting.delete_all_recurring_meetings")}
                      />
                    )}
                  </>
                )
              }
            </Form.Checkbox>
          )}
          name={"meta.is_recurring"}
          control={control}
        />

        <div className="mt-4">
          <div className="relative py-12">
            <div className="border-grey-500 border"></div>
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 px-6 py-3">
              <Typography.Paragraph
                as="span"
                size="md"
                weight="medium"
                children={t("contents.extra_settings")}
              />
            </div>
          </div>

          <Form.Group>
            <Controller
              name="meta.settings.auto_recording"
              control={control}
              render={({ field: { value, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  checked={!!value}
                  label={t("contents.meeting.auto_recording_label")}
                  description={t("contents.meeting.auto_recording_description")}
                  tooltip={t("contents.meeting.auto_recording_tooltip")}
                  {...rest}
                />
              )}
            />
          </Form.Group>
          <Form.Group>
            <Controller
              name="meta.settings.mute_upon_entry"
              control={control}
              render={({ field: { value, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  checked={!!value}
                  label={t("contents.meeting.auto_mute")}
                  description={t("contents.meeting.auto_mute_description")}
                  {...rest}
                />
              )}
            />
          </Form.Group>
          <Form.Group>
            <Controller
              name="meta.settings.allow_multiple_devices"
              control={control}
              render={({ field: { value, ...rest } }) => (
                <Form.Toggle
                  id={rest.name}
                  checked={!!value}
                  label={t("contents.meeting.allow_multiple_devices")}
                  description={t("contents.meeting.allow_multiple_devices_description")}
                  {...rest}
                />
              )}
            />
          </Form.Group>
        </div>
      </Layout.FormGrid>
    </Form>
  );
}
