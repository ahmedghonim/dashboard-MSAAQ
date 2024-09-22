import { useEffect, useState } from "react";

import { arSA, enUS } from "date-fns/locale";
import { i18n } from "next-i18next";
import { DateRange, DayPicker } from "react-day-picker";

type Props = {
  onChange: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
  value: DateRange;
};

const RangeDatePicker = ({ onChange, value, numberOfMonths = 2 }: Props) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>();

  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  const onRangeSelected = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onChange(range);
  };

  return (
    <div className="range-date-picker">
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={onRangeSelected}
        locale={i18n?.language == "ar" ? arSA : enUS}
        dir="ltr"
        numberOfMonths={numberOfMonths}
        pagedNavigation
        month={selectedRange?.from}
        fixedWeeks
        onMonthChange={(v) => setSelectedRange({ from: v, to: undefined })}
      />
    </div>
  );
};

export default RangeDatePicker;
