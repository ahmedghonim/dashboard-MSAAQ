import { useEffect } from "react";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import { getCookie, setCookie } from "cookies-next";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation, useTranslation } from "next-i18next";
import "nprogress/nprogress.css";
import { Provider as ReduxProvider } from "react-redux";
import { addMethod, mixed } from "yup";

import { ShareContextProvider } from "@/components";
import "@/components/checkout-animation/_checkout-animation.scss";
import { ToastProvider } from "@/components/toast";
import {
  AnnouncementProvider,
  AppProvider,
  AuthProvider,
  FreshchatProvider,
  GTMProvider,
  MixpanelProvider,
  SubscriptionProvider
} from "@/contextes";
import { CustomTemplateProvider } from "@/contextes/CustomTemplateContext";
import { ErrorProvider } from "@/contextes/ErrorContext";
import { OnboardingProvider } from "@/contextes/OnboardingContext";
import { PhoneVerificationProvider } from "@/contextes/PhoneVerificationContext";
import { StripeProvider } from "@/contextes/StripeContext";
import store from "@/store";

import { AbjadProvider, SingleFile } from "@msaaqcom/abjad";
import "@msaaqcom/abjad/dist/style.css";

import "../styles/globals.scss";

addMethod(mixed, "fileSize", function (maxSize, message) {
  return this.test("fileSize", message, (value) => {
    if (!value) {
      return true;
    } else if (Array.isArray(value)) {
      return value.every((file: SingleFile) => {
        /**
         * file size is in bytes
         * divided by 1024 to convert to kilobytes,
         * again by 1024 to convert to megabytes
         * */
        const size = file.size / 1024 / 1024;
        return size <= maxSize;
      });
    } else {
      /**
       * file size is in bytes
       * divided by 1024 to convert to kilobytes,
       * again by 1024 to convert to megabytes
       * */
      const size = value.size / 1024 / 1024;
      return size <= maxSize;
    }
  });
});

addMethod(mixed, "fileType", function (types, message) {
  return this.test("fileType", message, (value) => {
    const convertedTypes = Array.isArray(types) ? types : [types];
    if (Array.isArray(value)) {
      return value.every((file) => convertedTypes.includes(file.mime));
    } else {
      return value && convertedTypes.includes(value.mime);
    }
  });
});

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  useEffect(() => {
    if (locale == "en") {
      setCookie("current_locale", "en-US");
    }

    if (getCookie("current_locale") == "en-US") {
      router.replace(router.asPath, router.asPath, { locale: getCookie("current_locale") == "en-US" ? "en" : "ar" });
    }
  }, [locale]);

  const FileUploaderLabel = (props: any) => {
    return (
      <div
        className="flex"
        {...props}
      >
        {t("file_uploader.label_drag_and_drop_or")}
        <div className="mx-1 text-info underline">{t("file_uploader.label_browse")}</div>
        {t("file_uploader.label_files_on_your_device")}
      </div>
    );
  };
  return (
    <AbjadProvider
      direction={locale === "ar" ? "rtl" : "ltr"}
      locales={{
        file_uploader: {
          download: t("file_uploader.download"),
          label: <FileUploaderLabel />,
          max_files_allowed: (maxFileAllowed: string | number) =>
            t("file_uploader.max_files_allowed", { files: maxFileAllowed }),
          max_size_allowed: (maxSizeAllowed: string | number) =>
            t("file_uploader.max_size_allowed", { size: maxSizeAllowed })
        },
        editor: {
          toolbar: {
            formats: {
              paragraph: t("editor.paragraph"),
              headings: {
                h1: t("editor.headings.h1"),
                h2: t("editor.headings.h2"),
                h3: t("editor.headings.h3"),
                h4: t("editor.headings.h4")
              },
              bullet_list: t("editor.bullet_list"),
              numbered_list: t("editor.numbered_list"),
              quote: t("editor.quote"),
              code_block: t("editor.code_block")
            },
            insert_image: {
              title: t("editor.insert_image.title"),
              upload_label: t("editor.insert_image.upload_label"),
              alt: t("editor.insert_image.alt"),
              alt_placeholder: t("editor.insert_image.alt_placeholder"),
              add_btn_label: t("editor.insert_image.add_btn_label")
            },
            embed: {
              youtube: {
                title: t("editor.embed.youtube.title"),
                embed_label: t("editor.embed.youtube.embed_label"),
                embed_btn_label: t("editor.embed.youtube.embed_btn_label")
              }
            },
            insert_table: {
              title: t("editor.insert_table.title"),
              number_of_rows: t("editor.insert_table.number_of_rows"),
              number_of_columns: t("editor.insert_table.number_of_columns"),
              add_btn_label: t("editor.insert_table.add_btn_label"),
              actions: {
                insert_row_above: (rowsCount: number) =>
                  t("editor.insert_table.actions.insert_row_above", { rows: rowsCount }),
                insert_row_below: (rowsCount: number) =>
                  t("editor.insert_table.actions.insert_row_below", { rows: rowsCount }),
                insert_column_left: (columnsCount: number) =>
                  t("editor.insert_table.actions.insert_column_left", { columns: columnsCount }),
                insert_column_right: (columnsCount: number) =>
                  t("editor.insert_table.actions.insert_column_right", { columns: columnsCount }),
                delete_row: t("editor.insert_table.actions.delete_row"),
                delete_column: t("editor.insert_table.actions.delete_column"),
                delete_table: t("editor.insert_table.actions.delete_table"),
                toggle_row_header: (isRowHeader: boolean) =>
                  t(`editor.insert_table.actions.toggle_row_header_${isRowHeader}`),
                toggle_column_header: (isColumnHeader: boolean) =>
                  t(`editor.insert_table.actions.toggle_column_header_${isColumnHeader}`)
              }
            }
          },
          auto_embed: {
            Dismiss: t("editor.auto_embed.Dismiss"),
            "Embed Youtube Video": t("editor.auto_embed.embed_youtube_video")
          }
        }
      }}
    >
      <GTMProvider>
        <MixpanelProvider>
          <ToastProvider dir={locale == "ar" ? "rtl" : "ltr"}>
            <SessionProvider session={pageProps.session}>
              <ReduxProvider store={store}>
                <ErrorProvider>
                  {!router.pathname.startsWith("/verify/email") ? (
                    <AuthProvider>
                      <FreshchatProvider>
                        <OnboardingProvider>
                          <AppProvider>
                            <StripeProvider>
                              <SubscriptionProvider>
                                <ShareContextProvider>
                                  <PhoneVerificationProvider>
                                    <AnnouncementProvider>
                                      <CustomTemplateProvider>
                                        <Component {...pageProps} />
                                      </CustomTemplateProvider>
                                    </AnnouncementProvider>
                                  </PhoneVerificationProvider>
                                </ShareContextProvider>
                              </SubscriptionProvider>
                            </StripeProvider>
                          </AppProvider>
                        </OnboardingProvider>
                      </FreshchatProvider>
                    </AuthProvider>
                  ) : (
                    <Component {...pageProps} />
                  )}
                </ErrorProvider>
              </ReduxProvider>
            </SessionProvider>
          </ToastProvider>
        </MixpanelProvider>
      </GTMProvider>
    </AbjadProvider>
  );
};

export default appWithTranslation(App);
