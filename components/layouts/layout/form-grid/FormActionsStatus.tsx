import React, { useEffect, useState } from "react";

import { arSA, enUS } from "date-fns/locale";
import { i18n, useTranslation } from "next-i18next";
import { CaptionProps, DayPicker, useNavigation } from "react-day-picker";
import { Controller } from "react-hook-form";
import { UseFormReturn } from "react-hook-form/dist/types/form";

import { Select } from "@/components/select";
import dayjs from "@/lib/dayjs";

import { ChevronLeftIcon, ChevronRightIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { MoonIcon as SolidMoonIcon, SunIcon as SolidSunIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Modal, Typography } from "@msaaqcom/abjad";

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between rounded-t-lg border-b border-gray bg-[#FCFCFD]">
      <Button
        size="lg"
        variant="default"
        ghost
        icon={
          <Icon
            size="lg"
            children={<ChevronRightIcon />}
          />
        }
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      />
      <Typography.Paragraph
        weight="medium"
        children={dayjs(props.displayMonth).format("MMM YYYY")}
      />
      <Button
        size="lg"
        variant="default"
        ghost
        icon={
          <Icon
            size="lg"
            children={<ChevronLeftIcon />}
          />
        }
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      />
    </div>
  );
}

type FormActionsStatuses = "draft" | "published" | "unlisted" | "scheduled" | "early-access";

export interface FormStatusesProps {
  form: UseFormReturn<any>;
  statuses?: FormActionsStatuses[];
  schedulingModalTitle?: string;
  schedulingDateLabel?: string;
  schedulingDateDescription?: string;
  schedulingTimeLabel?: string;
  customPublishedDescription?: string;
  customScheduledDescription?: string;
  customDraftDescription?: string;
  customPublishedLabel?: string;
  customScheduledLabel?: string;
  customDraftLabel?: string;
  name?: string;
  item?: any & {
    id: string | number;
    updated_at: string;
    created_at: string;
    published_at?: string;
    publish_at?: string;
  };
}

export const FormActionsStatus = ({
  form,
  name = "publish_at",
  statuses = [],
  schedulingTimeLabel,
  schedulingDateDescription,
  schedulingDateLabel,
  schedulingModalTitle,
  customPublishedDescription,
  customScheduledDescription,
  customDraftDescription,
  customPublishedLabel,
  customScheduledLabel,
  customDraftLabel,
  item = {}
}: FormStatusesProps) => {
  const { t } = useTranslation();
  const [showSchedulingModal, setShowSchedulingModal] = useState<boolean>(false);
  const {
    control,
    watch,
    setValue,
    formState: { isSubmitting }
  } = form;

  const [publishAt, setPublishAt] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [time, setTime] = useState<{
    hours: number | string;
    minutes: number | string;
    prefix: "AM" | "PM";
  }>({
    hours: 0,
    minutes: 0,
    prefix: dayjs(selectedDate).format("A").toString() as "AM" | "PM"
  });

  useEffect(() => {
    handleDateChange(selectedDate);
  }, [time]);

  const updatePublishAt = (publishAt: Date, shouldDirty: boolean) => {
    setValue(name, dayjs(publishAt).format("YYYY-MM-DD HH:mm:ss"), {
      shouldDirty: shouldDirty
    });
    setPublishAt(publishAt);
  };

  const statusHandledRef = React.useRef<boolean>(false);
  useEffect(() => {
    if (!item[name] || statusHandledRef.current) {
      return;
    }

    if (watch("status") === undefined) {
      return;
    }

    const date = dayjs(item[name]);
    if (date.isAfter(dayjs())) {
      setSelectedDate(date.toDate());
      updatePublishAt(date.toDate(), false);

      setTime({
        hours: date.format("hh").toString(),
        minutes: date.format("mm").toString(),
        prefix: date.format("A").toString() as "AM" | "PM"
      });

      statusHandledRef.current = true;
    }
  }, [item, watch("status")]);

  const handleDateChange = (date: Date | any) => {
    const data = dayjs(date).format("YYYY-M-D");
    setSelectedDate(dayjs(`${data} ${time.hours}:${time.minutes}:00 ${time.prefix}`).toDate());
  };

  const PickTime = () => {
    return publishAt ? (
      <div className="mb-2 mt-2 rounded-lg border border-gray bg-gray-50 p-4">
        <Typography.Paragraph
          size="sm"
          weight="normal"
          className="mb-1 text-gray-700"
          children={t("publishing_statuses_selector.publish_date")}
        />

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <Typography.Paragraph
              weight="medium"
              children={dayjs(publishAt).format("D MMM YYYY")}
            />
            <Typography.Paragraph
              weight="medium"
              children={t("publishing_statuses_selector.at_hour") + " " + dayjs(publishAt).format("h:mm A")}
            />
          </div>
          <Button
            size="sm"
            variant={"default"}
            onClick={() => setShowSchedulingModal(true)}
            children={t("publishing_statuses_selector.change_date")}
          />
        </div>
      </div>
    ) : (
      <Button
        size="sm"
        className="mt-4 w-full"
        variant={"primary"}
        onClick={() => setShowSchedulingModal(true)}
        children={t("publishing_statuses_selector.choose_date")}
      />
    );
  };

  return (
    <>
      <div className="mb-2 flex flex-col gap-2">
        {statuses.includes("published") && (
          <Controller
            name="status"
            control={control}
            render={({ field: { value, ...field } }) => (
              <div className="rounded-lg bg-white px-4 py-2">
                <Form.Radio
                  label={t(customPublishedLabel ?? "publishing_statuses_selector.publish")}
                  description={t(customPublishedDescription ?? "publishing_statuses_selector.publish_description")}
                  id="status_published"
                  value={"published"}
                  checked={value === "published"}
                  {...field}
                />
              </div>
            )}
          />
        )}

        {statuses.includes("draft") && (
          <Controller
            name={"status"}
            control={control}
            render={({ field: { value, ...field } }) => (
              <div className="rounded-lg bg-white px-4 py-2">
                <Form.Radio
                  label={t(customDraftLabel ?? "publishing_statuses_selector.draft")}
                  description={t(customDraftDescription ?? "publishing_statuses_selector.draft_description")}
                  id="status_draft"
                  value={"draft"}
                  checked={value === "draft"}
                  {...field}
                />
              </div>
            )}
          />
        )}

        {statuses.includes("unlisted") && (
          <Controller
            name={"status"}
            control={control}
            render={({ field: { value, ...field } }) => (
              <div className="rounded-lg bg-white px-4 py-2">
                <Form.Radio
                  label={t("publishing_statuses_selector.unlisted")}
                  description={t("publishing_statuses_selector.unlisted_description")}
                  id="status_unlisted"
                  value={"unlisted"}
                  checked={value === "unlisted"}
                  {...field}
                />
              </div>
            )}
          />
        )}

        {(statuses.includes("scheduled") || statuses.includes("early-access")) && (
          <div className="rounded-lg bg-white px-4 py-2">
            <Controller
              name={"status"}
              control={control}
              render={({ field: { value, ...field } }) => (
                <Form.Radio
                  label={
                    statuses.includes("early-access")
                      ? t("publishing_statuses_selector.early_access")
                      : t(customScheduledLabel ?? "publishing_statuses_selector.schedule")
                  }
                  description={
                    statuses.includes("early-access")
                      ? t("publishing_statuses_selector.early_access_description")
                      : t(customScheduledDescription ?? "publishing_statuses_selector.schedule_description")
                  }
                  id="status_scheduled"
                  value="scheduled"
                  checked={value === "scheduled"}
                  {...field}
                />
              )}
            />

            {watch("status") === "scheduled" && <PickTime />}
          </div>
        )}
      </div>

      {(statuses.includes("scheduled") || statuses.includes("early-access")) && (
        <Modal
          size="lg"
          open={showSchedulingModal}
          onDismiss={() => setShowSchedulingModal(false)}
        >
          <Modal.Header className="border-b border-gray">
            <Modal.HeaderTitle children={schedulingModalTitle ?? t("publishing_statuses_selector.modal_title")} />
          </Modal.Header>

          <Modal.Body>
            <Modal.Content>
              <div className="mb-6 flex flex-col gap-1">
                <Typography.Paragraph
                  size="lg"
                  weight={!schedulingDateDescription ? "medium" : "bold"}
                  children={schedulingDateLabel ?? t("publishing_statuses_selector.modal_date_label")}
                />

                {schedulingDateDescription && (
                  <Typography.Paragraph
                    weight="medium"
                    className="text-gray-700"
                    children={schedulingDateDescription}
                  />
                )}
              </div>

              <DayPicker
                mode="single"
                locale={i18n?.language == "ar" ? arSA : enUS}
                selected={selectedDate}
                onSelect={handleDateChange}
                components={{
                  Caption: CustomCaption
                }}
                disabled={{ before: new Date() }}
                required
                dir="rtl"
                className="w-full"
              />

              <Form.Group
                required
                className="mb-0 mt-6"
                label={schedulingTimeLabel ?? t("publishing_statuses_selector.modal_time_label")}
              >
                <div className="flex justify-between gap-2">
                  <div className="flex w-full gap-2">
                    <Select
                      hasDropdownIndicator={false}
                      placeholder={t("hour")}
                      name="hour"
                      defaultValue={{ value: time.hours, label: `${time.hours}`.padStart(2, "0") }}
                      options={Array.from({ length: 12 }).map((_, i) => ({
                        label: `${i + 1}`.padStart(2, "0"),
                        value: i + 1
                      }))}
                      onChange={({ value }) => {
                        setTime((prev) => ({
                          ...prev,
                          hours: value
                        }));
                      }}
                    />

                    <Select
                      hasDropdownIndicator={false}
                      placeholder={t("minute")}
                      name="minute"
                      defaultValue={{ value: time.minutes, label: `${time.minutes}`.padStart(2, "0") }}
                      options={Array.from({ length: 60 }).map((_, i) => ({
                        label: `${i}`.padStart(2, "0"),
                        value: i
                      }))}
                      onChange={({ value }) => {
                        setTime((prev) => ({
                          ...prev,
                          minutes: value
                        }));
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={time.prefix === "AM" ? "primary" : "default"}
                      outline={time.prefix !== "AM"}
                      className="h-full w-2/4"
                      children="AM"
                      icon={
                        <Icon
                          children={time.prefix === "AM" ? <SolidSunIcon className="text-secondary" /> : <SunIcon />}
                        />
                      }
                      onClick={() => {
                        setTime((prev) => ({
                          ...prev,
                          prefix: "AM"
                        }));
                      }}
                    />
                    <Button
                      variant={time.prefix === "PM" ? "primary" : "default"}
                      outline={time.prefix !== "PM"}
                      className="h-full w-2/4"
                      children="PM"
                      icon={
                        <Icon
                          children={time.prefix === "PM" ? <SolidMoonIcon className="text-white" /> : <MoonIcon />}
                        />
                      }
                      onClick={() => {
                        setTime((prev) => ({
                          ...prev,
                          prefix: "PM"
                        }));
                      }}
                    />
                  </div>
                </div>
              </Form.Group>
            </Modal.Content>
          </Modal.Body>

          <Modal.Footer>
            <Button
              size="lg"
              className="ml-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={() => {
                updatePublishAt(selectedDate, true);
                setShowSchedulingModal(false);
              }}
              children={t("publishing_statuses_selector.schedule_button")}
            />
            <Button
              ghost
              size="lg"
              variant="default"
              onClick={() => setShowSchedulingModal(false)}
              children={t("back")}
            />
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
