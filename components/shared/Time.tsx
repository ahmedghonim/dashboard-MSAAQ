//@ts-nocheck
import React, { FC, HTMLAttributes, useEffect, useState } from "react";

import dayjs from "@/lib/dayjs";

interface TimeProps extends HTMLAttributes<HTMLTimeElement> {
  date: string;
  format?: string;
  title?: string;
  titleFormat?: string;
  interval?: number;
  className?: string;
  withoutSuffix?: boolean;
}

const Time: FC<TimeProps> = ({
  date,
  format,
  title,
  titleFormat = "DD/MM/YYYY HH:mm [GMT]Z",
  interval = 60000,
  withoutSuffix = false,
  className,
  ...props
}: TimeProps) => {
  const [parsedDate, setParsedDate] = useState(dayjs.tz(date));

  useEffect(() => {
    const timer = setInterval(() => setParsedDate(dayjs.tz(date)), interval);

    setParsedDate(dayjs.tz(date));

    return () => clearInterval(timer);
  }, [date]);

  return (
    <time
      dir="auto"
      title={title ?? parsedDate.fromNow(withoutSuffix ?? false)}
      className={className}
      children={parsedDate.format(format ?? "D MMM YYYY. h:mmA")}
      {...props}
    />
  );
};

export default Time;
