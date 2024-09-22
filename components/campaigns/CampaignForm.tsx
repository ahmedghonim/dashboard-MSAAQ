import React, { useContext, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { yupResolver } from "@hookform/resolvers/yup";
import camelCase from "camelcase";
import { isEmpty, omit } from "lodash";
import { Trans, useTranslation } from "next-i18next";
import { ErrorBoundary } from "react-error-boundary";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { loadSegments } from "@/actions/options";
import { Layout } from "@/components";
import { SubscriptionContext } from "@/contextes";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import {
  useCreateCampaignMutation,
  useFetchCampaignEstimateMessageQuery,
  usePreviewCampaignMutation,
  useUpdateCampaignMutation
} from "@/store/slices/api/campaignsSlice";
import { APIActionResponse, Campaign, CampaignStatus, GoalType } from "@/types";
import { classNames } from "@/utils";

import { EyeIcon, PaperAirplaneIcon, PlusIcon, XCircleIcon as XCircleIconOutlined } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";

import { Alert, Button, Editor, FULL_TOOLBAR_BUTTONS, Form, Icon, Typography, useAbjad } from "@msaaqcom/abjad";

import ProgressRing from "../progress/ProgressRing";
import SegmentModal from "../segments/SegmentModal";
import { Select } from "../select";
import ProductsAndCoursesSelect from "../select/ProductsAndCoursesSelect";
import MailTestModal from "./MailTestModal";

export type SelectSegmentType = {
  value: number;
  label: string;
  members_count: number;
  icon: string;
};
export interface IFormInputs {
  id: number;
  name: string;
  goal: {
    label: string;
    value: string;
  };
  product: {
    label: string;
    value: number;
    id: number;
    type: string;
  };
  message_subject: string;
  message_body: string;
  target: "all" | "segments";
  segments: Array<SelectSegmentType>;
  status: CampaignStatus;
}

const CLIENT_NAME_VAR = "{{name}}";
const PRODUCT_NAME_VAR = "{{product}}";

export default function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const { t } = useTranslation();
  const abjad = useAbjad();
  const [userCounts, setUserCounts] = useState<number>(0);
  const [newData, setNewData] = useState<any>("");
  const { data: campaignVolumes, isLoading } = useFetchCampaignEstimateMessageQuery();
  const [previewCampaign] = usePreviewCampaignMutation();
  const [createCampaignMutation] = useCreateCampaignMutation();
  const [updateCampaignMutation] = useUpdateCampaignMutation();
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const actionAfterSubmitRef = useRef<"open_modal" | "open_preview" | undefined>(undefined);
  const { getAddon, isAddonAvailable } = useContext(SubscriptionContext);
  let nf = new Intl.NumberFormat("en-US");

  const OPTIONS = [
    {
      label: t("marketing.campaigns.goals.launch_product"),
      value: GoalType.LAUNCH_PRODUCT
    },
    {
      label: t("marketing.campaigns.goals.discount_on_product"),
      value: GoalType.DISCOUNT_ON_PRODUCT
    },
    {
      label: t("marketing.campaigns.goals.update_product"),
      value: GoalType.UPDATE_PRODUCT
    },
    {
      label: t("marketing.campaigns.goals.custom_message"),
      value: GoalType.CUSTOM_MESSAGE
    }
  ];

  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    name: yup.string().required(),
    goal: yup
      .object({
        label: yup.string().required(),
        value: yup.string().required()
      })
      .nullable()
      .required(),
    message_subject: yup.string().nullable().required(),
    message_body: yup.string().nullable().min(3).required(),
    product: yup.object().when("goal", {
      is: (goal: any) => goal?.value !== GoalType.CUSTOM_MESSAGE,
      then: yup.object().nullable().required()
    }),
    segments: yup.array().when("target", {
      is: "segments",
      then: yup.array().min(1).required()
    })
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    defaultValues: {
      target: "all"
    },
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setError,
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (campaign) {
      setNewData(campaign.message_body);
      reset({
        name: campaign.name,
        message_subject: campaign.message_subject,
        message_body: campaign.message_body,
        ...(campaign.product && {
          product: {
            label: campaign.product.title,
            value: campaign.product.id,
            id: campaign.product.id,
            type: campaign.product_type
          }
        }),
        goal: OPTIONS.find((option) => option.value == campaign.goal),
        target: campaign.segments.length > 0 ? "segments" : "all",
        ...(campaign.segments && {
          segments: campaign.segments.map((segment) => {
            return {
              label: segment.name,
              value: segment.id,
              icon: `${camelCase(segment.icon, {
                pascalCase: true
              })}Icon`
            };
          })
        }),
        status: campaign.status
      });
    }
  }, [campaign]);

  useEffect(() => {
    dispatch({
      type: "app/setBackLink",
      payload: "/marketing/campaigns"
    });
    abjad.setEditorPlugin(
      "plugins.image.uploadURL",
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/admin/campaigns/${campaign?.id}/media`
    );
  }, [campaign]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const mutation = campaign?.id ? updateCampaignMutation : createCampaignMutation;
    const campaignResponse = (await mutation({
      ...omit(data, ["target"]),
      id: campaign?.id as number,
      goal: data.goal.value,
      ...(data.product && data.goal.value !== "custom_message"
        ? {
            product: {
              id: data.product.id,
              type: data.product.type.toLowerCase()
            }
          }
        : {
            product: {}
          }),
      ...(data.segments && data.segments.length > 0 && data.target == "segments"
        ? {
            segments: [...data.segments.map((segment: any) => segment.value)]
          }
        : { segments: [] }),
      ...(actionAfterSubmitRef.current !== undefined && {
        status: data.status == CampaignStatus.PUBLISHED ? CampaignStatus.DRAFT : data.status
      })
    })) as APIActionResponse<Campaign>;

    if (displayErrors(campaignResponse)) {
      actionAfterSubmitRef.current = undefined;
      return;
    }
    displaySuccess(campaignResponse);
    if (actionAfterSubmitRef.current == "open_modal") {
      setShowTestModal(true);
    }
    if (actionAfterSubmitRef.current == "open_preview") {
      const preview = (await previewCampaign({
        id: campaign?.id as number
      })) as any;
      const newTab = window.open();
      newTab?.document.write(preview?.data);
      newTab?.document.close();
    }
    actionAfterSubmitRef.current = undefined;
  };

  useEffect(() => {
    if (watch("target") == "all" && campaignVolumes) {
      setUserCounts(campaignVolumes.estimated_volume);
    }
    if (watch("target") == "segments" && watch("segments") && campaignVolumes) {
      const countAllSegmentsMembers = watch("segments").reduce((acc: number, segment: any) => {
        return acc + segment.members_count;
      }, 0);
      setUserCounts(countAllSegmentsMembers > 0 ? countAllSegmentsMembers : campaignVolumes.estimated_volume);
    }
  }, [watch("target"), watch("segments"), campaignVolumes]);

  return (
    <Layout title={campaign?.id ? campaign?.name : t("marketing.campaigns.create")}>
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                statuses={["draft", "published", "scheduled"]}
                customPublishedDescription="marketing.campaigns.campaign_description_published"
                customScheduledDescription="marketing.campaigns.campaign_description_scheduled"
                customDraftDescription="marketing.campaigns.campaign_description_draft"
                customPublishedLabel="marketing.campaigns.campaign_label_published"
                customScheduledLabel="marketing.campaigns.campaign_label_scheduled"
                customDraftLabel="marketing.campaigns.campaign_label_draft"
                product={{ id: 1, ...campaign }}
                redirect="/marketing/campaigns"
                form={form}
                name="scheduled_at"
                customSubmitButtonText={`marketing.campaigns.campaign_submit_${watch("status")}`}
                cancelCustomText={`cancel`}
              />
            }
          >
            {isAddonAvailable("emails") && (
              <div className="mb-4 rounded-2xl bg-white px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ProgressRing
                      color={"success"}
                      value={
                        ((Number(getAddon("emails")?.limit ?? 0) - Number(getAddon("emails")?.usage ?? 0)) /
                          Number(getAddon("emails")?.limit ?? 0)) *
                        100
                      }
                      width={15}
                      size={60}
                    />
                  </div>
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex gap-1 !font-medium text-gray-900">
                      <span>{t("marketing.campaigns.current_package")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xl !font-medium text-gray-900">
                      <span>
                        {nf.format(Number(getAddon("emails")?.limit) - Number(getAddon("emails")?.usage ?? 0))}
                      </span>
                      <span className="!font-normal !text-gray-800">
                        /{nf.format(Number(getAddon("emails")?.limit))}
                      </span>
                      <span className="text-sm !font-normal !text-gray-800">{t("marketing.campaigns.message")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
              <Typography.Paragraph
                size="sm"
                className="font-medium text-gray-700"
              >
                {t("marketing.campaigns.campaign_details")}
              </Typography.Paragraph>
              <Form.Group
                required
                label={t("marketing.campaigns.name")}
                errors={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Form.Input
                        placeholder={t("marketing.campaigns.name_placeholder")}
                        {...field}
                      />
                    );
                  }}
                />
              </Form.Group>
              <Form.Group
                required
                label={t("marketing.campaigns.goal")}
                errors={errors.goal?.message}
              >
                <Controller
                  name="goal"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        options={OPTIONS.map((option) => {
                          return {
                            label: option.label,
                            value: option.value
                          };
                        })}
                        placeholder={t("marketing.campaigns.goal_placeholder")}
                        {...field}
                      />
                    );
                  }}
                />
              </Form.Group>
              {watch("goal") && watch("goal")?.value !== "custom_message" && (
                <Form.Group
                  required
                  label={t("marketing.campaigns.product_name")}
                  errors={errors.product?.message}
                >
                  <Controller
                    name="product"
                    control={control}
                    render={({ field }) => {
                      return (
                        <ProductsAndCoursesSelect
                          isClearable
                          placeholder={t("marketing.campaigns.product_name")}
                          isMulti={false}
                          {...field}
                        />
                      );
                    }}
                  />
                </Form.Group>
              )}
            </div>
            <div className="mb-4 space-y-4 rounded-2xl bg-white">
              <div className="space-y-4 p-4">
                <Typography.Paragraph
                  size="sm"
                  className="font-medium text-gray-700"
                >
                  {t("marketing.campaigns.campaign_data")}
                </Typography.Paragraph>
                <Form.Group
                  required
                  label={t("marketing.campaigns.message_subject")}
                  errors={errors.message_subject?.message}
                >
                  <Controller
                    name="message_subject"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Form.Input
                          placeholder={t("marketing.campaigns.message_subject_placeholder")}
                          {...field}
                        />
                      );
                    }}
                  />
                </Form.Group>
                <Form.Group
                  required
                  label={t("marketing.campaigns.message_body")}
                  errors={errors.message_body?.message}
                >
                  <Controller
                    name="message_body"
                    control={control}
                    render={({ field: { value, onChange, ...rest } }) => {
                      return (
                        <Editor
                          variables={[
                            {
                              label: t("marketing.campaigns.client_name"),
                              variable: CLIENT_NAME_VAR
                            },
                            ...(watch("goal") && watch("goal")?.value !== "custom_message"
                              ? [{ label: t("marketing.campaigns.product_url"), variable: PRODUCT_NAME_VAR }]
                              : [])
                          ]}
                          id="message_body"
                          placeholder={t("marketing.campaigns.message_body_placeholder")}
                          defaultValue={newData}
                          toolbar={FULL_TOOLBAR_BUTTONS}
                          onChange={(value) => {
                            onChange(value);
                          }}
                          required
                        />
                      );
                    }}
                  />
                </Form.Group>
              </div>
              <div className="flex justify-between border-t p-4">
                <Button
                  icon={
                    <Icon>
                      <EyeIcon />
                    </Icon>
                  }
                  isLoading={actionAfterSubmitRef.current == "open_preview" && isSubmitting}
                  disabled={
                    isSubmitting ||
                    !watch("name") ||
                    !watch("message_subject") ||
                    isEmpty(watch("message_body")?.replace(/(<([^>]+)>)/gi, ""))
                  }
                  onClick={async () => {
                    if (isDirty) {
                      actionAfterSubmitRef.current = "open_preview";
                      await handleSubmit(onSubmit)();
                    } else {
                      const preview = (await previewCampaign({
                        id: campaign?.id as number
                      })) as any;
                      const newTab = window.open();
                      newTab?.document.write(preview?.data);
                      newTab?.document.close();
                    }
                  }}
                  outline
                  variant={"primary"}
                >
                  {t("marketing.campaigns.preview")}
                </Button>
                <Button
                  icon={
                    <Icon>
                      <PaperAirplaneIcon />
                    </Icon>
                  }
                  variant={"default"}
                  isLoading={actionAfterSubmitRef.current == "open_modal" && isSubmitting}
                  disabled={
                    isSubmitting ||
                    !watch("name") ||
                    !watch("message_subject") ||
                    isEmpty(watch("message_body")?.replace(/(<([^>]+)>)/gi, ""))
                  }
                  onClick={async () => {
                    if (isDirty) {
                      actionAfterSubmitRef.current = "open_modal";
                      await handleSubmit(onSubmit)();
                    } else {
                      setShowTestModal(true);
                    }
                  }}
                >
                  {t("marketing.campaigns.test_send")}
                </Button>
              </div>
            </div>
            <div
              className={classNames(
                "mb-4 space-y-4 rounded-2xl bg-white p-4",
                errors?.segments?.message ? "pb-8" : "pb-4"
              )}
            >
              <Typography.Paragraph
                size="sm"
                className="font-medium text-gray-700"
              >
                {t("marketing.campaigns.target.title")}
              </Typography.Paragraph>
              <Form.Group className="rounded-lg bg-gray-100 p-4">
                <Controller
                  name="target"
                  control={control}
                  render={({ field: { value, ...rest } }) => {
                    return (
                      <Form.Radio
                        id="all"
                        checked={value == "all"}
                        label={t("marketing.campaigns.target.all")}
                        {...rest}
                        value={"all"}
                      />
                    );
                  }}
                />
              </Form.Group>
              <Form.Group className="rounded-lg bg-gray-100 p-4">
                <div className="flex items-center">
                  <Controller
                    name="target"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Form.Radio
                          id="segments"
                          checked={field.value == "segments"}
                          label={t("marketing.campaigns.target.segments")}
                          {...field}
                          value={"segments"}
                        />
                      );
                    }}
                  />
                  {watch("target") == "segments" && (
                    <Button
                      className="mr-auto h-9 flex-shrink-0"
                      variant="primary"
                      size="sm"
                      children={t("students_flow.segments.create_new_segment")}
                      onClick={() => setShowModal(true)}
                      icon={<Icon children={<PlusIcon />} />}
                    />
                  )}
                </div>
              </Form.Group>
              {watch("target") == "segments" && (
                <div className="flex items-end gap-2 pr-8">
                  <Form.Group
                    className="!mb-0 w-full"
                    required
                  >
                    <Controller
                      control={control}
                      name="segments"
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
                                          field.onChange(
                                            segments.filter((segment) => segment.value != props.data.value)
                                          );
                                        } else {
                                          field.onChange([...segments, props.data]);
                                        }
                                      }}
                                      className="flex cursor-pointer items-center gap-2 border-b border-gray-300 p-4"
                                    >
                                      <Form.Checkbox
                                        checked={(field.value as Array<SelectSegmentType>).some(
                                          (segment) => segment.value == props.data.value
                                        )}
                                        onChange={() => {
                                          const segments = field.value as Array<SelectSegmentType>;
                                          if (segments.some((segment) => segment.value == props.data.value)) {
                                            field.onChange(
                                              segments.filter((segment) => segment.value != props.data.value)
                                            );
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
                                            (field.value as Array<SelectSegmentType>).length == props.options.length
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
              )}
              {campaignVolumes &&
                !isLoading &&
                Number(getAddon("emails")?.limit ?? 0) - Number(getAddon("emails")?.usage ?? 0) < userCounts && (
                  <Alert
                    variant="warning"
                    className="w-full [&>.flex]:w-full"
                    title={
                      <span className="flex w-full items-center gap-4">
                        <span className="font-normal">
                          <Trans
                            i18nKey={"email_bundles.alert_title"}
                            components={{
                              span: <span className="font-bold" />
                            }}
                            values={{
                              message: nf.format(userCounts)
                            }}
                          />
                        </span>
                        <Button
                          className="mr-auto flex-shrink-0"
                          variant="warning"
                          as={Link}
                          href="/settings/billing/email-bundles"
                        >
                          {t("email_bundles.upgrade_plan")}
                        </Button>
                      </span>
                    }
                  />
                )}
            </div>
          </Layout.FormGrid>
        </Form>
        <SegmentModal
          open={showModal}
          onDismiss={() => {
            setShowModal(false);
          }}
        />
        <MailTestModal
          open={showTestModal}
          onDismiss={() => {
            setShowTestModal(false);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
