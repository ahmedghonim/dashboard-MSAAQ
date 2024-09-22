import { useEffect } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Layout } from "@/components";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useAppDispatch, useAppSelector, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { APIActionResponse, Academy } from "@/types";

import { Badge, Form } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
const codeCustomDefaults = {
  mixed:
    "<!--Start of HTML code-->\n" +
    "\n" +
    "<!--End of HTML code-->\n" +
    "\n" +
    "<!--Start of JS code-->\n" +
    '<script type="text/javascript">\n' +
    "  //JS code goes here\n" +
    "</script>\n" +
    "<!--Start of JS code-->\n" +
    "\n" +
    "<!--Start of CSS code-->\n" +
    "<style>\n" +
    " /*CSS code goes here*/\n" +
    "</style>\n" +
    "<!--End of CSS code-->",
  "css-js":
    "<!--Start of JS code-->\n" +
    '<script type="text/javascript">\n' +
    "  //JS code goes here\n" +
    "</script>\n" +
    "<!--Start of JS code-->\n" +
    "\n" +
    "<!--Start of CSS code-->\n" +
    "<style>\n" +
    " /*CSS code goes here*/\n" +
    "</style>\n" +
    "<!--End of CSS code-->",
  css:
    "/*CSS code goes here*/\n" +
    "/*\n" +
    ".exampleClass {\n" +
    "    text-align: center;\n" +
    "    color: red;\n" +
    "    font-size: 16px;\n" +
    "}\n" +
    "\n" +
    "#exampleId {\n" +
    "    display: flex;\n" +
    "    flex-direction: column;\n" +
    "}\n" +
    "*/"
};

interface IFormInputs {
  meta: {
    custom_head_code: string;
    custom_body_code: string;
    custom_logged_in_code: string;
    custom_logged_out_code: string;
  };
}

export default function CodeSnippets() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const academy = useAppSelector((state) => state.auth.current_academy);

  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();

  const schema = yup.object().shape({
    meta: yup.object().shape({
      custom_head_code: yup.string(),
      custom_body_code: yup.string(),
      custom_logged_in_code: yup.string(),
      custom_logged_out_code: yup.string()
    })
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors }
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (Object.keys(academy).length) {
      reset({
        meta: {
          custom_head_code: academy.meta.custom_head_code ?? codeCustomDefaults["css-js"],
          custom_body_code: academy.meta.custom_body_code ?? codeCustomDefaults["css-js"],
          custom_logged_in_code: academy.meta.custom_logged_in_code ?? codeCustomDefaults["css-js"],
          custom_logged_out_code: academy.meta.custom_logged_out_code ?? codeCustomDefaults["css-js"]
        }
      });
    }
  }, [academy]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const updatedAcademy = (await updateAcademySettingsMutation({
      meta: data.meta
    })) as APIActionResponse<Academy>;
    if (displayErrors(updatedAcademy)) {
      return;
    }
    displaySuccess(updatedAcademy);
    dispatch({ type: "auth/setCurrentAcademy", payload: updatedAcademy.data.data });
  };

  return (
    <Layout title={t("academy_settings.title")}>
      <SettingsTabs />
      <Layout.Container>
        <AddonController addon="code-snippets">
          <Form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <Layout.FormGrid
              sidebar={
                <Layout.FormGrid.Actions
                  product={academy}
                  redirect={"/settings/code-snippets"}
                  form={form}
                />
              }
              sidebarAppend={
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                  <div>
                    <Trans
                      i18nKey="custom_codes_change_alert"
                      components={{
                        a: (
                          <Link
                            target="_blank"
                            href={"https://play.tailwindcss.com/LzZqbCYmRd?layout=preview"}
                            className="text-primary underline"
                          />
                        )
                      }}
                    />
                  </div>
                  <Badge
                    size="sm"
                    rounded
                    variant="success"
                    children={t("new")}
                  />
                </div>
              }
            >
              <Form.Group
                label={t("academy_settings.code_snippets.custom_head_code")}
                errors={errors.meta?.custom_head_code?.message}
              >
                <Controller
                  render={({ field }) => (
                    <CodeMirror
                      height="400px"
                      theme="dark"
                      extensions={[langs.html(), langs.css(), langs.javascript()]}
                      style={{
                        direction: "ltr",
                        boxShadow:
                          "0 0 0 1px rgb(16 22 26 / 10%), 0 0 0 rgb(16 22 26 / 0%), 0 1px 1px rgb(16 22 26 / 20%)",
                        textAlign: "left",
                        maxWidth: "995px",
                        overflow: "auto",
                        borderRadius: "5px"
                      }}
                      {...field}
                    />
                  )}
                  name={"meta.custom_head_code"}
                  control={control}
                />
              </Form.Group>
              <Form.Group
                label={t("academy_settings.code_snippets.custom_body_code")}
                errors={errors.meta?.custom_body_code?.message}
              >
                <Controller
                  render={({ field }) => (
                    <CodeMirror
                      height="400px"
                      theme="dark"
                      extensions={[langs.html(), langs.css(), langs.javascript()]}
                      style={{
                        direction: "ltr",
                        boxShadow:
                          "0 0 0 1px rgb(16 22 26 / 10%), 0 0 0 rgb(16 22 26 / 0%), 0 1px 1px rgb(16 22 26 / 20%)",
                        textAlign: "left",
                        maxWidth: "995px",
                        overflow: "auto",
                        borderRadius: "5px"
                      }}
                      {...field}
                    />
                  )}
                  name={"meta.custom_body_code"}
                  control={control}
                />
              </Form.Group>
              <Form.Group
                label={t("academy_settings.code_snippets.custom_logged_in_code")}
                tooltip={t("academy_settings.code_snippets.custom_logged_in_code_tooltip")}
                errors={errors.meta?.custom_logged_in_code?.message}
              >
                <Controller
                  render={({ field }) => (
                    <CodeMirror
                      height="400px"
                      theme="dark"
                      extensions={[langs.html(), langs.css(), langs.javascript()]}
                      style={{
                        direction: "ltr",
                        boxShadow:
                          "0 0 0 1px rgb(16 22 26 / 10%), 0 0 0 rgb(16 22 26 / 0%), 0 1px 1px rgb(16 22 26 / 20%)",
                        textAlign: "left",
                        maxWidth: "995px",
                        overflow: "auto",
                        borderRadius: "5px"
                      }}
                      {...field}
                    />
                  )}
                  name={"meta.custom_logged_in_code"}
                  control={control}
                />
              </Form.Group>
              <Form.Group
                label={t("academy_settings.code_snippets.custom_logged_out_code")}
                tooltip={t("academy_settings.code_snippets.custom_logged_out_code_tooltip")}
                errors={errors.meta?.custom_logged_out_code?.message}
                className="mb-0"
              >
                <Controller
                  render={({ field }) => (
                    <CodeMirror
                      height="400px"
                      theme="dark"
                      extensions={[langs.html(), langs.css(), langs.javascript()]}
                      style={{
                        direction: "ltr",
                        boxShadow:
                          "0 0 0 1px rgb(16 22 26 / 10%), 0 0 0 rgb(16 22 26 / 0%), 0 1px 1px rgb(16 22 26 / 20%)",
                        textAlign: "left",
                        maxWidth: "995px",
                        overflow: "auto",
                        borderRadius: "5px"
                      }}
                      {...field}
                    />
                  )}
                  name={"meta.custom_logged_out_code"}
                  control={control}
                />
              </Form.Group>
            </Layout.FormGrid>
          </Form>
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
