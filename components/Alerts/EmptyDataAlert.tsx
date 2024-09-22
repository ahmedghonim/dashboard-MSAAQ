import React from "react";

import { Trans, useTranslation } from "next-i18next";

import { Alert } from "@msaaqcom/abjad";

export default function EmptyDataAlert() {
  const { t } = useTranslation("common");

  return (
    <Alert
      variant="default"
      title={t("empty_data_alert_title")}
      bordered
      className="absolute bottom-14 ltr:left-14 rtl:right-14"
    >
      <Trans i18nKey="empty_data_alert_description">No Data</Trans>
    </Alert>
  );
}
