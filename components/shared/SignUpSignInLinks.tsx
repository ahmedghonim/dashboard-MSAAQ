import { useContext } from "react";

import Link from "next/link";

import { useTranslation } from "next-i18next";

import { AppContext } from "@/contextes";

import { Typography } from "@msaaqcom/abjad";

const SignUpSignInLinks = () => {
  const { tenant } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <div className="mt-4 text-center">
      <Typography.Paragraph
        size="md"
        as={Link}
        href={"/login"}
        weight="medium"
        className="inline-block text-primary-700"
      >
        {t("auth.sign_in")}
      </Typography.Paragraph>
      {!tenant && (
        <>
          <Typography.Paragraph
            size="md"
            weight="medium"
            className="mx-1 inline-block"
            children={t("auth.or")}
          />
          <Typography.Paragraph
            size="md"
            as={Link}
            weight="medium"
            href={"/register"}
            className="inline-block text-primary-700"
            children={t("auth.create_account")}
          />
        </>
      )}
    </div>
  );
};

export default SignUpSignInLinks;
