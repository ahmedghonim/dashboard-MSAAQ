import React, { FC } from "react";

import { useTranslation } from "next-i18next";

import { Alert, Typography } from "@msaaqcom/abjad";

const MsaaqpayWasDisabledAlert: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography.Paragraph
        weight="medium"
        className="mb-2"
      >
        {t("msaaq_pay.alerts.msaaq_pay_was_disabled.title")}
      </Typography.Paragraph>
      <Alert
        variant="info"
        title={t("msaaq_pay.alerts.msaaq_pay_was_disabled.subtitle")}
        className="mb-6"
      >
        {t("msaaq_pay.alerts.msaaq_pay_was_disabled.description")}
      </Alert>
    </>
  );
};

export default MsaaqpayWasDisabledAlert;
