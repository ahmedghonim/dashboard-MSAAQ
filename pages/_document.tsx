import type { DocumentProps } from "next/document";
import { Head, Html, Main, NextScript } from "next/document";

import i18nextConfig from "../next-i18next.config";

type Props = DocumentProps & {
  // add custom document props
};
const Document = ({ __NEXT_DATA__: { locale } }: Props) => {
  const currentLocale = locale ?? i18nextConfig.i18n.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Html
      lang={currentLocale}
      dir={dir}
    >
      <Head>
        <link
          rel="shortcut icon"
          href="https://cdn.msaaq.com/assets/images/logo/favicon.png"
        />

        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
