import { useState } from "react";

import { useTranslation } from "next-i18next";
import { DateRange } from "react-day-picker";

import ReportRangeModal from "@/components/modals/ReportRangeModal";
import dayjs from "@/lib/dayjs";
import { DateRangeType } from "@/types";

import { CalendarIcon } from "@heroicons/react/24/outline";

import { Form, Icon, Typography } from "@msaaqcom/abjad";

interface Props {
  onChange: (range: DateRangeType) => void;
  defaultValue?: DateRangeType;
}

const RangeDateInput = ({ onChange, defaultValue }: Props) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);

  const [range, setRange] = useState<DateRange>(defaultValue ?? { from: new Date(), to: new Date() });

  const onRangeSelected = (range: DateRange) => {
    onChange({
      from: range.from,
      formatted_from: dayjs(range.from).format("YYYY-MM-DD"),
      to: range.to,
      formatted_to: dayjs(range.to).format("YYYY-MM-DD")
    });
    setRange(range);
    setShow(false);
  };

  const customRanges = {
    [t("intervals.today")]: {
      from: dayjs().toDate(),
      to: dayjs().toDate()
    },
    [t("intervals.yesterday")]: {
      from: dayjs().subtract(1, "day").toDate(),
      to: dayjs().subtract(1, "day").toDate()
    },
    [t("intervals.last_seven_days")]: {
      from: dayjs().subtract(6, "day").toDate(),
      to: dayjs().toDate()
    },
    [t("intervals.this_month")]: {
      from: dayjs().startOf("month").toDate(),
      to: dayjs().endOf("month").toDate()
    },
    [t("intervals.last_month")]: {
      from: dayjs().subtract(1, "month").startOf("month").toDate(),
      to: dayjs().subtract(1, "month").endOf("month").toDate()
    },
    [t("intervals.this_year")]: {
      from: dayjs().startOf("year").toDate(),
      to: dayjs().toDate()
    },
    [t("intervals.last_year")]: {
      from: dayjs().subtract(1, "year").startOf("year").toDate(),
      to: dayjs().subtract(1, "year").endOf("year").toDate()
    },
    [t("intervals.all_time")]: {
      from: dayjs("01/01/2019").startOf("year").toDate(),
      to: dayjs().toDate()
    },
    [t("intervals.custom_range")]: {
      from: dayjs().toDate(),
      to: dayjs().toDate()
    }
  };

  return (
    <>
      <div
        className="mb-2 flex w-fit items-center gap-4"
        onClick={() => {
          setShow(true);
        }}
      >
        <Typography.Paragraph
          size="md"
          children={t("report_date")}
        />
        <Form.Input
          prepend={
            <Icon
              size="sm"
              children={<CalendarIcon />}
            />
          }
          className="w-64 bg-transparent px-3 [&>input]:pl-0 [&>input]:pr-2"
          readOnly
          value={
            range.to
              ? `${dayjs(range.from).format("DD MMM YYYY")} - ${dayjs(range.to).format("DD MMM YYYY")}`
              : String(dayjs(range.from).format("DD MMM YYYY"))
          }
        />
      </div>
      <ReportRangeModal
        open={show}
        defaultValue={defaultValue}
        ranges={customRanges}
        onSubmit={onRangeSelected}
        onDismiss={() => {
          setShow(false);
        }}
      />
    </>
  );
};
export default RangeDateInput;
