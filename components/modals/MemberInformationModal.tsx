import React, { FC, useEffect, useMemo, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import { Trans, useTranslation } from "next-i18next";
import { ErrorBoundary } from "react-error-boundary";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { components } from "react-select";
import * as yup from "yup";

import { loadSegments } from "@/actions/options";
import PhoneInput from "@/components/shared/PhoneInput";
import { useResponseToastHandler } from "@/hooks";
import { useFetchFormQuery } from "@/store/slices/api/formsSlice";
import { useCreateMemberMutation, useUpdateMemberMutation } from "@/store/slices/api/membersSlice";
import { APIActionResponse, Member } from "@/types";
import { FieldForm } from "@/types/models/form";
import { minimalCountriesList } from "@/utils/countriesList";

import { UserIcon, XCircleIcon as XCircleIconOutlined } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";

import { Avatar, Button, Form, Icon, Modal, ModalProps } from "@msaaqcom/abjad";

import { SelectSegmentType } from "../campaigns/CampaignForm";
import { Select } from "../select";

interface IFormInputs {
  name: string;
  email: string;
  country_code: {
    label: string;
    value: any;
  };
  national_id: string;
  phone: {
    number: string;
    dialCode: string;
  };
  dob: string;
  avatar: any;

  english_name: string;
  username: string;
  gender: {
    label: string;
    value: any;
  };
  job_title: string;
  bio: string;
  education: {
    label: string;
    value: any;
  };
  meta: {
    complete_profile: {
      [key: string]: any;
    };
  };
  segments: Array<SelectSegmentType>;
}

interface MemberModalProps extends ModalProps {
  member?: Member;
}

const MemberInformationModal: FC<MemberModalProps> = ({ open = false, member, ...props }: MemberModalProps) => {
  const { t } = useTranslation();
  const [show, setShow] = useState<boolean>(open);
  const { data: fetchForm, isLoading } = useFetchFormQuery("complete_profile");

  const [createMemberMutation] = useCreateMemberMutation();
  const [updateMemberMutation] = useUpdateMemberMutation();

  const countries = useMemo(() => orderBy(minimalCountriesList, ["ar_name", "preferred"], "desc"), []);
  useEffect(() => {
    setShow(open);
  }, [open]);

  const generateCustomFieldsSchema = (fields: Array<FieldForm>) => {
    return fields
      .filter((field) => field.required)
      .reduce((acc, field) => {
        switch (field.type) {
          case "select":
            return {
              ...acc,
              [field.name]: yup.object().required()
            };
          case "email":
            return {
              ...acc,
              [field.name]: yup.string().email().required()
            };
          case "number":
            return {
              ...acc,
              [field.name]: yup
                .number()
                .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
                .required()
            };
          case "phone":
            return {
              ...acc,
              [field.name]: yup.mixed().nullable()
            };
          default:
            return {
              ...acc,
              [field.name]: yup.string().required()
            };
        }
      }, {});
  };

  const schema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    country_code: yup
      .object({
        label: yup.string(),
        value: yup.object()
      })
      .nullable()
      .notRequired(),
    national_id: yup.string().when("country", (country_code) => {
      if (country_code && country_code.value && country_code.value.hasOwnProperty("iso2")) {
        if (country_code.value.iso2 === "sa") {
          return yup.string().required();
        } else {
          return yup.string().nullable();
        }
      }
      return yup.string().nullable();
    }),
    ...(member
      ? {
          phone: yup.mixed().required(),
          username: yup.string().required(),
          ...(fetchForm && fetchForm?.data?.fields.length > 0
            ? {
                meta: yup.object().shape({
                  complete_profile: yup.object().shape(generateCustomFieldsSchema(fetchForm?.data?.fields))
                })
              }
            : {})
        }
      : {
          phone: yup.mixed().nullable(),
          username: yup.string().nullable()
        }),
    dob: yup.string().nullable(),
    gender: yup
      .object()
      .shape({
        label: yup.string().nullable(),
        value: yup.string().nullable()
      })
      .nullable(),
    job_title: yup.string().nullable(),
    bio: yup.string().nullable(),
    segments: yup.array(),
    education: yup
      .object()
      .shape({
        label: yup.string().nullable(),
        value: yup.string().nullable()
      })
      .nullable()
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty, isValid, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      segments: []
    },
    mode: "all"
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const isSaudi = useMemo(() => watch("country_code")?.value?.iso2 === "sa", [watch("country_code")]);
  const [profilePicture, setProfilePicture] = useState<any>(null);

  const genderOptions = [
    { value: "male", label: "male" },
    { value: "female", label: "female" }
  ];

  const educationalLevelOptions = [
    { value: "primary", label: "primary" },
    { value: "intermediate", label: "intermediate" },
    { value: "bachelor", label: "bachelor" },
    { value: "prof", label: "prof" }
  ];

  const completeProfileData = (data: any, type: string = "fill") => {
    if (type == "submit") {
      return Object.keys(data || {}).reduce((acc, fieldName) => {
        const formField = fetchForm?.data?.fields.find((formField) => formField.name == fieldName);
        const fieldValue = formField?.type == "select" ? data[fieldName]?.value : data[fieldName];

        if (formField?.type === "phone") {
          return {
            ...acc,
            [fieldName]: {
              phone: data[fieldName]?.number,
              phone_code: data[fieldName]?.dialCode
            }
          };
        }

        return {
          ...acc,
          [fieldName]: fieldValue
        };
      }, {});
    } else {
      return Object.keys(data || {}).reduce((acc, fieldName) => {
        const formField = fetchForm?.data?.fields.find((formField) => formField.name == fieldName);

        const fieldValue =
          formField?.type === "select"
            ? {
                label: formField?.options?.find((option: any) => option.value == data[fieldName])?.label,
                value: data[fieldName]
              }
            : data[fieldName];

        if (formField?.type === "phone") {
          return {
            ...acc,
            [fieldName]: {
              number: data[fieldName]?.phone,
              dialCode: data[fieldName]?.phone_code
            }
          };
        }

        return {
          ...acc,
          [fieldName]: fieldValue
        };
      }, {});
    }
  };

  useEffect(() => {
    if (member) {
      setProfilePicture(member.avatar?.url);
      const gender = find(genderOptions, (el) => el.value == member.gender);
      const education = find(educationalLevelOptions, (el) => el.value === member.education);

      reset({
        name: member.name,
        username: member.username,
        education: member?.education
          ? {
              label: t(education?.label as string),
              value: education?.value
            }
          : undefined,
        bio: member.bio ?? "",
        job_title: member.job_title ?? "",
        gender: member?.gender
          ? {
              label: t(gender?.label as string),
              value: gender?.value
            }
          : undefined,
        email: member.email,
        national_id: member.national_id ?? "",
        dob: member.dob ?? "",
        ...(member.segments && {
          segments: member.segments ?? []
        }),
        avatar: member.avatar ? [member.avatar] : null,
        phone: {
          number: member.phone ?? "",
          dialCode: member.phone_code ?? ""
        },
        // @ts-ignore
        country_code: find(minimalCountriesList, (el) => el.value.iso2 === member.country_code?.toLowerCase()),
        meta: {
          complete_profile: completeProfileData(member?.meta?.complete_profile) ?? {}
        }
      });
    }
  }, [member, fetchForm]);

  const generateCustomFields = fetchForm?.data.fields.map((field, index) => {
    return (
      <Form.Group
        key={index}
        label={field?.label}
        required={field?.required}
        errors={errors.meta?.complete_profile?.[field.name]?.message as string}
      >
        {field?.type === "select" ? (
          <Controller
            render={({ field: $field }) => (
              <Select
                placeholder={field?.placeholder}
                options={field?.options?.map((option) => ({
                  label: t(option.label),
                  value: option.value
                }))}
                {...$field}
              />
            )}
            name={`meta.complete_profile.${field.name}`}
            control={control}
          />
        ) : field?.type === "phone" ? (
          <Controller
            render={({ field: $field }) => (
              <PhoneInput
                placeholder={field?.placeholder}
                {...$field}
              />
            )}
            name={`meta.complete_profile.${field.name}`}
            control={control}
          />
        ) : field?.type === "number" ? (
          <Controller
            render={({ field: $field }) => (
              <Form.Number
                min={0}
                placeholder={field?.placeholder}
                {...$field}
                type={field?.type}
              />
            )}
            name={`meta.complete_profile.${field.name}`}
            control={control}
          />
        ) : (
          <Controller
            render={({ field: $field }) => (
              <Form.Input
                placeholder={field?.placeholder}
                {...$field}
                type={field?.type}
              />
            )}
            name={`meta.complete_profile.${field.name}`}
            control={control}
          />
        )}
      </Form.Group>
    );
  });

  const onProfilePictureChange = (input: any) => {
    if (input.files && input.files[0]) {
      let reader = new FileReader();

      reader.onload = function (e) {
        setProfilePicture(e?.target?.result ?? "");
      };
      setValue("avatar", [{ file: input.files[0] }], { shouldValidate: true, shouldDirty: true });
      reader.readAsDataURL(input.files[0]);
    }
  };
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;
    const mutation = member ? updateMemberMutation : createMemberMutation;
    const newMember = (await mutation({
      id: member?.id ?? 0,
      ...data,
      avatar: data.avatar?.map((file: any) => file.file).pop(),
      ...(data.phone && {
        phone: data.phone?.number ?? "",
        phone_code: data.phone?.dialCode ?? ""
      }),
      gender: data.gender.value,
      education: data.education.value,
      country_code: data.country_code?.value?.iso2 ?? "",
      ...(data.segments && data.segments.length > 0
        ? {
            segments: [...data.segments.map((segment: any) => segment.value)]
          }
        : { segments: [] }),
      meta: {
        complete_profile: completeProfileData(data.meta ? data.meta.complete_profile : [], "submit")
      }
    })) as APIActionResponse<Member>;

    if (displayErrors(newMember)) return;

    displaySuccess(newMember);
    setShow(false);
    if (!member) {
      reset({});
    }
    props.onDismiss?.();
  };

  return (
    <Modal
      size="lg"
      open={show}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle children={member ? t("students_flow.edit_student") : t("students_flow.add_new_student")} />
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Content className="mx-2">
          <Modal.Body>
            <label className="flex flex-col items-center">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => onProfilePictureChange(e.target)}
              />
              {!profilePicture && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray bg-gray-50">
                  <Icon children={<UserIcon />} />
                </div>
              )}
              {profilePicture && (
                <Avatar
                  size="xl"
                  name={member?.name ?? ""}
                  imageUrl={profilePicture}
                />
              )}
              <Button
                as="span"
                variant="default"
                children={
                  member?.avatar ? t("students_flow.change_profile_picture") : t("students_flow.upload_profile_picture")
                }
                className="mt-4"
              />
            </label>
            <Form.Group
              required
              label={t("students_flow.student_name")}
              errors={errors.name?.message}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    required
                    placeholder={t("students_flow.student_name_input_placeholder")}
                    {...field}
                  />
                )}
                name={"name"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("students_flow.username")}
              errors={errors.username?.message}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    required
                    placeholder={t("students_flow.username_input_placeholder")}
                    {...field}
                  />
                )}
                name={"username"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("students_flow.email")}
              errors={errors.email?.message}
            >
              <Controller
                render={({ field }) => (
                  <Form.Input
                    required
                    type="email"
                    placeholder="example@domain.com"
                    {...field}
                  />
                )}
                name={"email"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              className="w-full"
              label={t("students_flow.owner_phone")}
              errors={errors.phone?.message}
              required={member ? true : false}
            >
              <Controller
                render={({ field }) => (
                  <PhoneInput
                    placeholder={t("students_flow.owner_phone_placeholder")}
                    {...field}
                  />
                )}
                name={"phone"}
                control={control}
              />
            </Form.Group>
            {member && (
              <>
                <Form.Group
                  label={t("students_flow.date_of_birth")}
                  errors={errors.dob?.message}
                >
                  <Controller
                    render={({ field }) => (
                      <Form.Input
                        type="date"
                        {...field}
                      />
                    )}
                    name={"dob"}
                    control={control}
                  />
                </Form.Group>
              </>
            )}
            <Form.Group
              label={t("students_flow.country")}
              errors={errors.country_code?.message}
            >
              <Controller
                render={({ field }) => (
                  <Select
                    options={countries}
                    components={{
                      Option: (props) => (
                        <components.Option {...props}>
                          <div className="flex items-center">
                            <div
                              style={{
                                backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.iso2?.toLowerCase()}.svg)`
                              }}
                              className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                            />
                            <span className="mr-2">{props.data.label}</span>
                          </div>
                        </components.Option>
                      ),
                      SingleValue: (props) => (
                        <components.SingleValue {...props}>
                          <div className="flex items-center">
                            <div
                              style={{
                                backgroundImage: `url(https://cdn.msaaq.com/assets/flags/${props?.data?.value?.iso2?.toLowerCase()}.svg)`
                              }}
                              className="h-5 w-7 rounded bg-cover bg-center bg-no-repeat"
                            />
                            <span className="mr-2">{props.data.label}</span>
                          </div>
                        </components.SingleValue>
                      )
                    }}
                    {...field}
                  />
                )}
                name={"country_code"}
                control={control}
              />
            </Form.Group>
            <div className="flex items-end gap-2">
              <Form.Group
                className="w-full"
                label={t("students_flow.segment_label")}
              >
                <Controller
                  control={control}
                  name={"segments"}
                  render={({ field }) => {
                    return (
                      <div className="relative">
                        <Select
                          classNames={{
                            menuList: () => "!p-0"
                          }}
                          hideSelectedOptions={false}
                          isMulti
                          placeholder={t("marketing.campaigns.pick_segment")}
                          loadOptions={(inputValue, callback) => {
                            loadSegments(inputValue, callback);
                          }}
                          components={{
                            Option: (props) => {
                              return (
                                <div
                                  onClick={() => {
                                    const segments = field.value as Array<SelectSegmentType>;
                                    if (segments.some((segment) => segment.value == props.data.value)) {
                                      field.onChange(segments.filter((segment) => segment.value != props.data.value));
                                    } else {
                                      field.onChange([...segments, props.data]);
                                    }
                                  }}
                                  className="flex cursor-pointer items-center gap-2 border-b border-gray-300 p-4"
                                >
                                  <Form.Checkbox
                                    checked={(field.value as Array<SelectSegmentType>)?.some(
                                      (segment) => segment.value == props.data.value
                                    )}
                                    onChange={() => {
                                      const segments = field.value as Array<SelectSegmentType>;
                                      if (segments.some((segment) => segment.value == props.data.value)) {
                                        field.onChange(segments.filter((segment) => segment.value != props.data.value));
                                      } else {
                                        field.onChange([...segments, props.data]);
                                      }
                                    }}
                                    id={props.data.value}
                                  />
                                  <span>
                                    <Icon className="h-4 w-4 text-gray-800">
                                      <ErrorBoundary fallback={<XCircleIcon className="h-4 w-4 text-gray-800" />}>
                                        {React.createElement(require("@heroicons/react/24/solid")[props.data.icon])}
                                      </ErrorBoundary>
                                    </Icon>
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{props.data.label}</span>
                                  <span className="mr-auto text-sm font-medium text-gray-800">
                                    {props.data.members_count}
                                  </span>
                                </div>
                              );
                            },
                            MenuList: (props) => {
                              return (
                                <div className="max-h-[400px] overflow-scroll !p-0">
                                  <div
                                    onClick={() => {
                                      const segments = props.options;
                                      if ((field.value as Array<SelectSegmentType>).length == segments.length) {
                                        field.onChange([]);
                                      } else {
                                        field.onChange(segments);
                                      }
                                    }}
                                    className="flex cursor-pointer items-center gap-2 border-b border-gray-300 p-4"
                                  >
                                    <Form.Checkbox
                                      checked={
                                        (field.value as Array<SelectSegmentType>)?.length == props.options.length
                                      }
                                      onChange={() => {
                                        const segments = props.options;
                                        if ((field.value as Array<SelectSegmentType>).length == segments.length) {
                                          field.onChange([]);
                                        } else {
                                          field.onChange(segments);
                                        }
                                      }}
                                      id={"select-all"}
                                    />

                                    <span className="text-sm font-medium text-gray-800">
                                      {t("marketing.campaigns.segments_placeholder")}
                                    </span>
                                  </div>
                                  {props.children}
                                </div>
                              );
                            },
                            MultiValue: (props) => {
                              const overflow = props
                                .getValue()
                                .slice(2)
                                .map((x) => x.label);

                              return props.index < 2 ? (
                                <div className="mr-2 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-[6px] text-xs text-gray-950">
                                  <span>
                                    <Icon className="h-4 w-4 text-black">
                                      <ErrorBoundary fallback={<XCircleIcon className="h-4 w-4 text-black" />}>
                                        {React.createElement(require("@heroicons/react/24/solid")[props.data.icon])}
                                      </ErrorBoundary>
                                    </Icon>
                                  </span>
                                  <span className="text-xs font-medium text-gray-950">{props.data.label}</span>
                                  <button
                                    onClick={() => {
                                      field.onChange(
                                        (field.value as Array<SelectSegmentType>).filter(
                                          (segment) => segment.value != props.data.value
                                        )
                                      );
                                    }}
                                    className="mr-auto text-sm font-medium text-gray-800"
                                  >
                                    <Icon children={<XCircleIconOutlined className="h-5 w-5 text-gray-800" />} />
                                  </button>
                                </div>
                              ) : props.index == 2 ? (
                                <div className="mr-2 text-xs font-medium text-gray-700">
                                  {t("marketing.campaigns.segments_WithCount", {
                                    count: overflow.length
                                  })}
                                </div>
                              ) : null;
                            }
                          }}
                          {...field}
                        />
                        {errors.segments && (
                          <div className="absolute mt-1 flex flex-col">
                            <div className="flex items-center text-danger">
                              <span className="ms-icon ms-icon-sm ltr:mr-2 rtl:ml-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              </span>
                              <span className="text-paragraph-sm font-normal">
                                {errors?.segments?.message as string}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </Form.Group>
            </div>
            {isSaudi && (
              <Form.Group
                required
                label={t("national_id")}
                errors={errors.national_id?.message}
              >
                <Controller
                  render={({ field }) => (
                    <Form.Input
                      placeholder={"مثال: 2889-726-277"}
                      {...field}
                    />
                  )}
                  name={"national_id"}
                  control={control}
                />
              </Form.Group>
            )}
            {member && (
              <>
                <Form.Group
                  label={t("students_flow.gender")}
                  errors={errors.gender?.value?.message as string}
                >
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select
                        options={genderOptions.map((gender) => ({
                          label: t(gender.label),
                          value: gender.value
                        }))}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("students_flow.job_title")}
                  errors={errors.job_title?.message as string}
                >
                  <Controller
                    control={control}
                    name="job_title"
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("students_flow.job_title")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("students_flow.bio")}
                  errors={errors.bio?.message}
                >
                  <Controller
                    control={control}
                    name="bio"
                    render={({ field }) => (
                      <Form.Input
                        placeholder={t("students_flow.bio")}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
                <Form.Group
                  label={t("students_flow.educational_level")}
                  errors={errors.education?.value?.message as string}
                >
                  <Controller
                    control={control}
                    name="education"
                    render={({ field }) => (
                      <Select
                        options={educationalLevelOptions.map((level) => ({
                          label: t(level.label),
                          value: level.value
                        }))}
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </>
            )}
            {member && !isLoading && fetchForm && fetchForm?.data?.fields?.length > 0 && generateCustomFields}
          </Modal.Body>
        </Modal.Content>
        <Modal.Footer>
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={member ? t("save_changes") : t("add")}
            disabled={!isDirty || !isValid || isSubmitting}
          />
          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => props.onDismiss && props.onDismiss()}
          >
            <Trans i18nKey="cancel">Cancel</Trans>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default MemberInformationModal;
