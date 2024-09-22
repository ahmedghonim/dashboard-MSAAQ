import React, { forwardRef, useEffect, useState } from "react";

import { isObject } from "lodash";
import { useTranslation } from "next-i18next";

import { Form } from "@msaaqcom/abjad";

type DurationState = {
  hours: number;
  minutes: number;
  seconds: number;
};

interface DurationInputProps {
  value?: DurationState | number | string | null;
  secondsInput?: "include" | "exclude";
  onChange?: (durationInSeconds: number, duration: DurationState) => any;
}

const DurationInput = forwardRef(
  ({ value = null, onChange, secondsInput = "include" }: DurationInputProps, ref: any) => {
    const defaultValues = {
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    const datalist = {
      hours: 25,
      minutes: 61
    };
    const { t } = useTranslation();
    const [duration, setDuration] = useState<DurationState>(defaultValues);

    const parseValue = (value: object | number | string | null): DurationState => {
      if (typeof value === "number" || typeof value === "string") {
        const duration = parseInt(value as string);

        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration - hours * 3600) / 60);
        const seconds = duration - hours * 3600 - minutes * 60;

        return {
          hours,
          minutes,
          seconds
        };
      }

      return isObject(value)
        ? {
            ...defaultValues,
            ...value
          }
        : defaultValues;
    };

    useEffect(() => {
      if (value) {
        setDuration(parseValue(value));
      }
    }, [value]);

    useEffect(() => {
      if (duration === defaultValues) {
        return;
      }

      // minutes to seconds
      const minutesToSeconds = duration.minutes * 60;
      // hours to seconds
      const hoursToSeconds = duration.hours * 60 * 60;
      // total seconds
      const totalSeconds = minutesToSeconds + hoursToSeconds + duration.seconds;

      onChange?.(totalSeconds, duration);
    }, [duration]);

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDuration({ ...duration, [name]: value ? parseInt(value) : 0 });
    };

    return (
      <div
        className="flex flex-col items-center justify-between gap-2 sm:flex-row"
        ref={ref}
      >
        <Form.Number
          min={0}
          name="hours"
          withHandlers={false}
          suffix={t("hour")}
          list="duration-hours"
          placeholder="0"
          onChange={handleDurationChange}
          value={duration.hours}
        />

        <Form.Number
          min={0}
          name="minutes"
          withHandlers={false}
          suffix={t("minute")}
          list="duration-minutes"
          placeholder="0"
          onChange={handleDurationChange}
          value={duration.minutes}
        />

        {secondsInput === "include" && (
          <Form.Number
            min={0}
            name="seconds"
            withHandlers={false}
            suffix={t("second")}
            list="duration-minutes"
            placeholder="0"
            onChange={handleDurationChange}
            value={duration.seconds}
          />
        )}

        {Object.keys(datalist).map((key) => (
          <datalist
            key={key}
            id={`duration-${key}`}
            className="hidden"
          >
            {/*@ts-ignore*/}
            {Array.from({ length: datalist[key] }, (_, i) => i).map((i) => (
              <option
                key={i}
                value={i}
              />
            ))}
          </datalist>
        ))}
      </div>
    );
  }
);

export default DurationInput;
