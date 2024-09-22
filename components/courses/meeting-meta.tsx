import React from "react";

import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";

import dayjs from "@/lib/dayjs";
import { Content, Meeting } from "@/types";

import { Typography } from "@msaaqcom/abjad";

const MeetingMeta = ({ content, size = "md" }: { content: Content<Meeting>; size?: "md" | "sm" | "lg" }) => {
  const { t } = useTranslation();
  const startAt = dayjs(content.meta.start_at).tz(content.meta.timezone);
  const { occurrence, is_recurring } = content.meta;

  return (
    <Typography.Paragraph
      size={size}
      weight="normal"
      className="text-gray-700"
    >
      <span
        children={startAt.format("DD/MM/YYYY")}
        dir="auto"
      />
      <span
        children={" • "}
        className="text-gray-900"
      />
      <span
        children={startAt.format("hh:mm A")}
        dir="auto"
      />
      {" - "}
      <span
        children={startAt.add(content.meta.duration, "minutes").format("hh:mm A")}
        dir="auto"
      />

      {is_recurring && !isEmpty(occurrence) && (
        <>
          <span
            children={" • "}
            className="text-gray-900"
          />
          {t("recurring")} {`${occurrence.current ? `${occurrence.current}/` : ""}${occurrence.total ?? ""}`.trim()}
        </>
      )}
    </Typography.Paragraph>
  );
};

export default MeetingMeta;
