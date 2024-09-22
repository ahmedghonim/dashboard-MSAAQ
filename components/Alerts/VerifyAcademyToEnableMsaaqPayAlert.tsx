import React, { FC } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { Alert, Button, Typography } from "@msaaqcom/abjad";

const VerifyAcademyToEnableMsaaqPayAlert: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography.Paragraph
        weight="medium"
        className="mb-2"
      >
        {t("msaaq_pay.alerts.verify_academy_to_enable_msaaq_pay.title")}
      </Typography.Paragraph>
      <Alert
        variant="warning"
        title={t("msaaq_pay.alerts.verify_academy_to_enable_msaaq_pay.subtitle")}
        actions={
          <Button
            as={Link}
            href="/settings/verify"
            variant="warning"
            size="sm"
            outline
            ghost
            children={t("msaaq_pay.alerts.verify_academy_to_enable_msaaq_pay.action")}
          />
        }
        className="mb-6"
      >
        {t("msaaq_pay.alerts.verify_academy_to_enable_msaaq_pay.description")}
      </Alert>
    </>
  );
};

export default VerifyAcademyToEnableMsaaqPayAlert;
