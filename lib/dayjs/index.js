import dayjs from "dayjs";
import "dayjs/locale/en";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "./locale/ar";
import relativeTime from "./relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.tz.setDefault("Asia/Riyadh");

export default dayjs;
