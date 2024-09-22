import React, { createElement, useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Layout, Tabs } from "@/components";
import ColorPickerInput from "@/components/inputs/ColorPickerInput";
import { Select } from "@/components/select";
import { useAppDispatch, useAppSelector, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import {
  useCreateCertificateTemplateMutation,
  useUpdateCertificateTemplateMutation
} from "@/store/slices/api/certificatesTemplatesSlice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIActionResponse, CertificateTemplate } from "@/types";
import { getMissingFileIds, randomUUID } from "@/utils";

import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { Alert, Button, Form, Grid, Icon, SingleFile, Tooltip, Typography } from "@msaaqcom/abjad";

interface ICertificateTemplateFormFormInputs {
  name: string;
  content: {
    title: {
      active: boolean;
      value: string;
    };
    issued: {
      active: boolean;
      value: string;
    };
    serial: {
      active: boolean;
      value: string;
    };
    teacher: {
      active: boolean;
      value: string;
    };
    subtitle: {
      active: boolean;
      value: string;
    };
    course_name: {
      active: boolean;
      value: string;
    };
    certificate_cause: {
      active: boolean;
      value: string;
    };
    verify_certificate: {
      active: boolean;
      value: string;
    };
  };
  design: {
    font_family: {
      label: string;
      value: string;
    };
    primary_color: string;
    paragraph_color: string;
    secondary_color: string;
  };
  logo: Array<SingleFile>;
  background: Array<SingleFile>;
}

type IFormInputsKeys = keyof ICertificateTemplateFormFormInputs &
  keyof ICertificateTemplateFormFormInputs["content"] &
  keyof ICertificateTemplateFormFormInputs["design"];

interface Props {
  certificateTemplate?: CertificateTemplate | any;
}

export default function CertificateTemplateForm({ certificateTemplate }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [openTab, setOpenTab] = useState<string>("content");

  const [createCertificateTemplateMutation] = useCreateCertificateTemplateMutation();
  const [updateCertificateTemplateMutation] = useUpdateCertificateTemplateMutation();

  const schema = yup.object().shape({
    name: yup.string().min(3).required(),
    content: yup.object().shape({
      title: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      subtitle: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      course_name: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      certificate_cause: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      teacher: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      issued: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      serial: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      }),
      verify_certificate: yup.object({
        active: yup.boolean(),
        value: yup.string().min(3)
      })
    }),
    design: yup.object().shape({
      font_family: yup.object().shape({
        label: yup.string().min(3),
        value: yup.string().min(3)
      }),
      primary_color: yup.string().min(3),
      paragraph_color: yup.string().min(3),
      secondary_color: yup.string().min(3)
    }),
    logo: yup.mixed(),
    background: yup.mixed()
  });

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: "/students/certificates" });
  }, []);

  const form = useForm<ICertificateTemplateFormFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(schema),
    defaultValues: {
      name: "شهادة اجتياز",
      content: {
        title: {
          active: false,
          value: "شهادة اجتياز"
        },
        subtitle: {
          active: true,
          value: "تشهد منصة (اسم المنصة) أنّ الطالب"
        },
        course_name: {
          active: true,
          value: "أكمَل الدورة التعليمية"
        },
        certificate_cause: {
          active: true,
          value: "تمّ منح الطالب هذه الشهادة"
        },
        teacher: {
          active: true,
          value: "قام بتدريس المادة"
        },
        issued: {
          active: true,
          value: "تاريخ الإصدار"
        },
        serial: {
          active: true,
          value: "رقم الشهادة"
        },
        verify_certificate: {
          active: true,
          value: "أدخِل رابط للتأكُّد من صحة الشهادة"
        }
      },
      design: {
        primary_color: "#000000",
        secondary_color: "#0EBF5D",
        paragraph_color: "#7F7F7F",
        font_family: {
          value: "vazir",
          label: "Vazir (موصى به)"
        }
      },
      logo: [],
      background: []
    }
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    setFocus,
    reset,
    watch,
    getValues
  } = form;

  const [preview, setPreview] = useState();

  const toBase64 = (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const loadPreview = async () => {
    const values = getValues();

    await axios
      .post(
        `/certificate_templates/${router.query.certificateTemplateId}/preview`,
        {
          ...getValues(),
          design: {
            ...values.design,
            font_family: values.design.font_family.value
          },
          content: Object.entries(values.content).reduce((acc: any, [key, obj]) => {
            acc[key] = obj.active ? obj.value : false;
            return acc;
          }, {})
        },
        {
          responseType: "blob"
        }
      )
      .then(({ data }) => {
        const blob: any = new Blob([data], { type: "application/pdf; charset=utf-8" });

        setPreview(URL.createObjectURL(blob) as any);
      });
  };

  useEffect(() => {
    if (certificateTemplate?.id && !certificateTemplate.temp_values) {
      const transformedData = Object.entries(certificateTemplate.content).reduce((acc: any, [key, value]) => {
        acc[key] = {
          active: value ? true : false,
          value: value ?? ""
        };

        return acc;
      }, {});

      reset({
        name: certificateTemplate.name,
        content: transformedData,
        design: {
          ...certificateTemplate.design,
          font_family: {
            label: certificateTemplate.design.font_family,
            value: certificateTemplate.design.font_family
          }
        },
        logo: certificateTemplate.logo ? [certificateTemplate.logo] : [],
        background: certificateTemplate.background ? [certificateTemplate.background] : []
      });
    }
  }, [certificateTemplate]);

  useEffect(() => {
    if (router.query.certificateTemplateId) {
      loadPreview();
    }
  }, [certificateTemplate?.id]);

  const focusOn = useCallback(
    (key: IFormInputsKeys, tab: string) => {
      if (openTab !== tab) {
        setOpenTab(tab);
      }
      setTimeout(() => {
        setFocus(key);
      }, 100);
    },
    [openTab, setFocus, setOpenTab]
  );
  const certificateContentInputs = useMemo(
    () => [
      {
        name: "name",
        label: t("certificates_templates.certificate_name"),
        placeholder: t("certificates_templates.certificate_name_placeholder"),
        tooltip: t("certificates_templates.certificate_name_tooltip"),
        errors: errors?.name?.message
      },
      {
        name: "content.title",
        label: t("certificates_templates.certificate_title"),
        placeholder: t("certificates_templates.certificate_title_placeholder"),
        tooltip: t("certificates_templates.certificate_title_tooltip"),
        errors: errors?.content?.title?.message
      },
      {
        name: "content.subtitle",
        label: t("certificates_templates.certificate_subtitle"),
        placeholder: t("certificates_templates.certificate_subtitle_placeholder"),
        errors: errors?.content?.subtitle?.message
      },
      {
        name: "content.course_name",
        label: t("certificates_templates.certificate_post_course_title"),
        placeholder: t("certificates_templates.certificate_post_course_title_placeholder"),
        errors: errors?.content?.course_name?.message
      },
      {
        name: "content.certificate_cause",
        label: t("certificates_templates.certificate_post_certificate_cause_title"),
        placeholder: t("certificates_templates.certificate_post_certificate_cause_title_placeholder"),
        errors: errors?.content?.certificate_cause?.message
      },
      {
        name: "content.teacher",
        label: t("certificates_templates.certificate_post_instructor_title"),
        placeholder: t("certificates_templates.certificate_post_instructor_title_placeholder"),
        errors: errors?.content?.teacher?.message
      },
      {
        name: "content.issued",
        label: t("certificates_templates.certificate_issued_at"),
        placeholder: t("certificates_templates.certificate_issued_at_placeholder"),
        errors: errors?.content?.issued?.message
      },
      {
        name: "content.serial",
        label: t("certificates_templates.certificate_serial_number"),
        placeholder: t("certificates_templates.certificate_serial_number_placeholder"),
        errors: errors?.content?.serial?.message
      },
      {
        name: "content.verify_certificate",
        label: t("certificates_templates.certificate_validation_url"),
        placeholder: t("certificates_templates.certificate_validation_url_placeholder"),
        errors: errors?.content?.verify_certificate?.message
      }
    ],
    []
  );
  const certificateDesignInputs = useMemo(
    () => [
      {
        name: "design.primary_color",
        label: t("certificates_templates.certificate_design_primary_color"),
        errors: errors?.design?.primary_color?.message,
        component: ColorPickerInput
      },
      {
        name: "design.secondary_color",
        label: t("certificates_templates.certificate_design_secondary_color"),
        errors: errors?.design?.secondary_color?.message,
        component: ColorPickerInput
      },
      {
        name: "design.paragraph_color",
        label: t("certificates_templates.certificate_design_paragraph_color"),
        errors: errors?.design?.paragraph_color?.message,
        component: ColorPickerInput
      },
      {
        name: "design.font_family",
        label: t("certificates_templates.certificate_design_font_family"),
        errors: errors?.design?.font_family?.message,
        component: Select,
        options: [
          {
            value: "vazir",
            label: "Vazir (موصى به)"
          },
          {
            value: "NotoSansArabicUI",
            label: "Noto Sans Arabic"
          },
          {
            value: "Speda",
            label: "Speda"
          },
          {
            value: "Parastoo",
            label: "Parastoo"
          }
        ]
      }
    ],
    []
  );
  const onSubmit: SubmitHandler<ICertificateTemplateFormFormInputs> = async (data) => {
    const transformedData = Object.entries(data.content).reduce((acc: any, [key, obj]) => {
      acc[key] = obj.active ? obj.value : false;
      return acc;
    }, {});

    const mutation =
      certificateTemplate?.id && !certificateTemplate.temp_values
        ? updateCertificateTemplateMutation
        : createCertificateTemplateMutation;

    const certificate = (await mutation({
      id: certificateTemplate?.id,
      ...data,
      content: transformedData,
      design: {
        ...data.design,
        font_family: data.design.font_family.value
      },
      logo: data.logo?.map((file) => file.file).pop(),
      "deleted-logo": getMissingFileIds(certificateTemplate?.logo, data.logo),
      background: data.background?.map((file) => file.file).pop(),
      "deleted-background": getMissingFileIds(certificateTemplate?.background, data.background)
    })) as APIActionResponse<CertificateTemplate>;

    if (displayErrors(certificate)) {
      return;
    }

    displaySuccess(certificate);

    await router.push({
      pathname: `/students/certificates`,
      query: { fetch: randomUUID() }
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Grid
        columns={{
          lg: 3
        }}
      >
        <Grid.Cell
          columnSpan={{
            lg: 1
          }}
        >
          <Tabs.Group className="bg-white">
            <Tabs className="rounded-t-lg">
              <Tabs.Link
                href="#content"
                as="a"
                active={openTab === "content"}
                onClick={() => setOpenTab("content")}
                children={t("certificates_templates.content")}
              />
              <Tabs.Link
                as="a"
                active={openTab === "design"}
                href="#design"
                onClick={() => setOpenTab("design")}
                children={t("certificates_templates.design")}
              />
            </Tabs>
            {openTab == "content" && (
              <Tabs.Content className="flex flex-col space-y-4">
                {certificateContentInputs.map((input, index) => (
                  <React.Fragment key={index}>
                    {input.name != "name" && (
                      <Controller
                        render={({ field }) => (
                          <Form.Toggle
                            id={`active-${index}`}
                            label={input.label}
                            checked={field.value}
                            {...field}
                          />
                        )}
                        name={`${input.name}.active` as IFormInputsKeys}
                        control={control}
                      />
                    )}
                    {input.name == "name" ? (
                      <Form.Group
                        key={index}
                        className="!mb-0"
                        tooltip={input.tooltip}
                        label={input.label}
                        errors={input.errors}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.Input
                              {...input}
                              {...field}
                            />
                          )}
                          name={input.name}
                          control={control}
                        />
                      </Form.Group>
                    ) : (
                      <Form.Group
                        key={index}
                        tooltip={input.tooltip}
                        errors={input.errors}
                      >
                        <Controller
                          render={({ field }) => (
                            <Form.Input
                              {...input}
                              {...field}
                              // @ts-ignore
                              disabled={!watch(`${input.name}.active`) as IFormInputsKeys}
                            />
                          )}
                          name={`${input.name}.value` as IFormInputsKeys}
                          control={control}
                        />
                      </Form.Group>
                    )}
                  </React.Fragment>
                ))}
              </Tabs.Content>
            )}
            {openTab == "design" && (
              <Tabs.Content>
                {certificateDesignInputs.map((input, index) => (
                  <Form.Group
                    key={index}
                    label={input.label}
                    errors={input.errors}
                  >
                    <Controller
                      render={({ field }) =>
                        createElement(input.component as any, {
                          ...input,
                          ...field
                        })
                      }
                      name={input.name as IFormInputsKeys}
                      control={control}
                    />
                  </Form.Group>
                ))}
                <Form.Group
                  label={t("certificates_templates.certificate_design_logo")}
                  errors={errors?.logo?.message}
                  className="whitespace-nowrap"
                >
                  <Controller
                    render={({ field: { onChange, ...rest } }) => (
                      <Form.File
                        maxFiles={1}
                        accept={["image/png", "image/jpeg"]}
                        onChange={(files: SingleFile[]) => {
                          onChange(files);
                        }}
                        {...rest}
                      />
                    )}
                    name={"logo"}
                    control={control}
                  />
                </Form.Group>
                <Form.Group
                  label={t("certificates_templates.certificate_design_background")}
                  errors={errors?.background?.message}
                  className="whitespace-nowrap"
                >
                  <Controller
                    render={({ field: { onChange, ...rest } }) => (
                      <Form.File
                        maxFiles={1}
                        accept={["image/png", "image/jpeg"]}
                        onChange={(files: SingleFile[]) => {
                          onChange(files);
                        }}
                        {...rest}
                        append={
                          <Alert
                            className="mt-4 w-full"
                            dismissible
                            children={
                              <>
                                <Typography.Paragraph
                                  weight="medium"
                                  children={t("certificates_templates.certificate_design_background_alert_title")}
                                />
                                <Typography.Paragraph
                                  weight="medium"
                                  children={t("certificates_templates.certificate_design_background_alert_description")}
                                />
                              </>
                            }
                            variant="default"
                          />
                        }
                      />
                    )}
                    name={"background"}
                    control={control}
                  />
                </Form.Group>
              </Tabs.Content>
            )}
          </Tabs.Group>
        </Grid.Cell>
        <Grid.Cell
          columnSpan={{
            lg: 2
          }}
        >
          <div className="mb-4 flex items-center justify-end">
            <Layout.FormGrid.Actions
              className="flex flex-row-reverse items-center gap-4"
              size="sm"
              product={certificateTemplate}
              form={form}
              redirect="/students/certificates"
            />
          </div>

          <Card>
            <Card.Body>
              <div className="mb-4 flex items-center justify-between gap-4">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  children={t("certificates.preview_certificate")}
                />

                <Tooltip>
                  <Tooltip.Trigger>
                    <Button
                      size="sm"
                      disabled={!isDirty}
                      onClick={() => loadPreview()}
                      variant={"default"}
                      children={"إعادة تحميل"}
                      icon={
                        <Icon
                          size="sm"
                          children={<ArrowPathIcon />}
                        />
                      }
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content>لمعاينة الشعار والخلفية يجب حفظ التعديلات</Tooltip.Content>
                </Tooltip>
              </div>

              <object
                data={preview}
                type="application/pdf"
                width="100%"
                height="550px"
              />

              {/*
              <div
                style={{
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100% 100%",
                  backgroundImage: `url(${watch("background")?.[0]?.url ?? "/images/default-certificate.png"})`,
                  // maxWidth: "699px",
                  width: "100%",
                  height: "480px"
                }}
                className="m-auto text-center"
              >
                <div className="content mt-4 flex h-full  flex-col py-4">
                  <div className="content__top pt-4">
                    {watch("content.title.active") && (
                      <h1
                        className="title pt-4"
                        style={{
                          color: watch("design.primary_color"),
                          fontWeight: "500",
                          lineHeight: "1.2",
                          marginBottom: "0.5rem",
                          fontSize: "28px"
                        }}
                        onClick={() => {
                          focusOn("content.title.value" as IFormInputsKeys, "content");
                        }}
                      >
                        {watch("content.title.value")}
                      </h1>
                    )}
                    <div className="flex justify-center pt-1">
                      <a href="https://yaman.msaaqdev.com">
                        <img
                          src={watch("logo")?.[0]?.url ?? "/images/Academy.png"}
                          alt=""
                          style={{
                            height: "50px"
                          }}
                        />
                      </a>
                    </div>
                    <div className="pt-1">
                      <a href="https://yaman.msaaqdev.com">
                        <img
                          src=""
                          alt=""
                          height="50"
                        />
                      </a>
                    </div>
                    {watch("content.subtitle.active") && (
                      <p
                        className="lead pt-3"
                        style={{
                          color: watch("design.primary_color"),
                          fontSize: "14px",
                          fontWeight: 300
                        }}
                        onClick={() => {
                          focusOn("content.subtitle.value" as IFormInputsKeys, "content");
                        }}
                      >
                        {watch("content.subtitle.value")}
                        <br />
                        <strong
                          style={{
                            color: watch("design.secondary_color")
                          }}
                        >
                          {"{student_name}"}
                        </strong>
                      </p>
                    )}
                    {watch("content.course_name.active") && (
                      <p
                        className="lead pt-3"
                        style={{
                          color: watch("design.primary_color"),
                          fontSize: "14px",
                          fontWeight: 300
                        }}
                        onClick={() => {
                          focusOn("content.course_name.value" as IFormInputsKeys, "content");
                        }}
                      >
                        {watch("content.course_name.value")}
                        <br />
                        <strong
                          style={{
                            color: watch("design.secondary_color")
                          }}
                        >
                          {"{course_title}"}
                        </strong>
                      </p>
                    )}
                    {watch("content.certificate_cause.active") && (
                      <p
                        className="mb-0 pt-2"
                        style={{
                          color: watch("design.primary_color"),
                          fontSize: "14px",
                          fontWeight: 300
                        }}
                        onClick={() => {
                          focusOn("content.certificate_cause.value" as IFormInputsKeys, "content");
                        }}
                      >
                        {watch("content.certificate_cause.value")}
                        <br />
                        <strong
                          style={{
                            color: watch("design.secondary_color")
                          }}
                        >
                          {"{certificate_cause}"}
                        </strong>
                      </p>
                    )}
                  </div>

                  {watch("content.teacher.active") && (
                    <p
                      className="lead"
                      style={{
                        color: watch("design.primary_color"),
                        fontSize: "14px",
                        fontWeight: 300
                      }}
                      onClick={() => {
                        focusOn("content.teacher.value" as IFormInputsKeys, "content");
                      }}
                    >
                      {watch("content.teacher.value")}
                      <br />
                      <strong
                        style={{
                          color: watch("design.secondary_color")
                        }}
                      >
                        {"{teacher_name}"}
                      </strong>
                    </p>
                  )}

                  <div
                    className="mx-5 mb-4 mt-auto flex justify-between px-14"
                    style={{
                      color: watch("design.paragraph_color"),
                      fontSize: "14px"
                    }}
                  >
                    {watch("content.issued.active") && (
                      <div
                        onClick={() => {
                          focusOn("content.issued.value" as IFormInputsKeys, "content");
                        }}
                      >
                        <span className="block font-bold">{watch("content.issued.value")}</span>
                        <time
                          dir="ltr"
                          title=""
                        >
                          {"{issued_at}"}
                        </time>
                      </div>
                    )}

                    {watch("content.serial.active") && (
                      <div
                        onClick={() => {
                          focusOn("content.serial.value" as IFormInputsKeys, "content");
                        }}
                      >
                        <span className="block font-bold">{watch("content.serial.value")}</span>
                        <span>{"{certificate_serial}"}</span>
                      </div>
                    )}

                    {watch("content.verify_certificate.active") && (
                      <div
                        className="pl-4"
                        onClick={() => {
                          focusOn("content.verify_certificate.value" as IFormInputsKeys, "content");
                        }}
                      >
                        <span className="block font-bold">{watch("content.verify_certificate.value")}</span>
                        <p>
                          <a
                            href={`//${auth.current_academy.domain}/verify`}
                            target="_blank"
                            dir="ltr"
                            rel="noreferrer"
                          >
                            {`${auth.current_academy.domain}/verify`}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              */}
            </Card.Body>
          </Card>
        </Grid.Cell>
      </Grid>
    </Form>
  );
}
