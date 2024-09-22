import React, { useEffect, useState } from "react";

import Head from "next/head";
import Image from "next/image";

import { useTranslation } from "next-i18next";

import { Typography } from "@msaaqcom/abjad";

export const LoadingScreen = () => {
  const { t } = useTranslation();
  const quotes = t("loading_screen.quotes", { returnObjects: true });
  const [quote, setQuote] = useState<string>();

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <>
      <Head>
        <title>{t("welcome_back") + " | " + t("app_name")}</title>
      </Head>

      <div className="fixed inset-x-0 inset-y-0 flex h-full w-full bg-white/90">
        <div className="m-auto flex flex-col items-center">
          <div className="loader-6 mb-6">
            <Image
              src={"https://cdn.msaaq.com/assets/images/logo/favicon.png"}
              width={82}
              height={82}
              alt={"msaaq"}
            />
            <span />
          </div>

          <Typography.Paragraph
            size="lg"
            weight="bold"
            children={t("welcome_back")}
          />

          <Typography.Paragraph
            children={quote}
            className="mt-2 text-gray-800"
          />
        </div>
      </div>
    </>
  );
};
