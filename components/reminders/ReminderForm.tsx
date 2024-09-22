import { useCallback, useContext, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout } from "@/components";
import { AuthContext } from "@/contextes";
import { useAppDispatch, useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useCreateReminderMutation, useUpdateReminderMutation } from "@/store/slices/api/abandonedCartsSlice";
import { APIActionResponse, Reminder } from "@/types";
import { Coupon, CouponType } from "@/types/models/coupon";
import { classNames, convertPrice } from "@/utils";

import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { BanknotesIcon, ReceiptPercentIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Form, Icon, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  channel: "email" | "sms";
  //duration in days
  abandonment_duration: number;
  cart_min_total: number;
  discount_type: CouponType;
  discount_enabled: boolean;
  discount: number;
  //duration hours
  discount_duration: number;
  message: string;
}

const MESSAGE_LENGTH = 70;
const MAX_MESSAGES_COUNT = 2;
const STUDENT_NAME_LENGTH = 15;
const DISCOUNT_DURATION_SUFFIX_LENGTH = 5;
const STUDENT_NAME_VAR = "{{name}}";
const DISCOUNT_AMOUNT_VAR = "{{discount}}";
const DISCOUNT_DURATION_VAR = "{{discount_duration}}";

export default function ReminderForm({ reminder, custom }: { reminder?: Reminder; custom?: boolean }) {
  const { t } = useTranslation();
  const [createReminderMutation] = useCreateReminderMutation();
  const [updateReminderMutation] = useUpdateReminderMutation();

  const { current_academy } = useContext(AuthContext);

  const { currentCurrency, formatRawPriceWithoutCurrency } = useFormatPrice();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    query: { reminderId }
  } = router;

  const getMessagesCount = useCallback((msg: string, discount: string | number, discount_duration: string | number) => {
    const hasStudentName = msg.includes(STUDENT_NAME_VAR);
    const studentNameUsedCount = (msg.match(new RegExp(STUDENT_NAME_VAR, "g")) || []).length;
    const hasDiscountAmount = msg.includes(DISCOUNT_AMOUNT_VAR);
    const discountAmountUsedCount = (msg.match(new RegExp(DISCOUNT_AMOUNT_VAR, "g")) || []).length;
    const hasDiscountDuration = msg.includes(DISCOUNT_DURATION_VAR);
    const discountDurationUsedCount = (msg.match(new RegExp(DISCOUNT_DURATION_VAR, "g")) || []).length;

    const messageLength = msg.replace(
      new RegExp(`${STUDENT_NAME_VAR}|${DISCOUNT_AMOUNT_VAR}|${DISCOUNT_DURATION_VAR}`, "g"),
      ""
    ).length;

    const reservedChars =
      (hasStudentName ? STUDENT_NAME_LENGTH * studentNameUsedCount : 0) +
      (hasDiscountAmount ? discount.toString().length * discountAmountUsedCount : 0) +
      (hasDiscountDuration
        ? (discount_duration.toString().length + DISCOUNT_DURATION_SUFFIX_LENGTH) * discountDurationUsedCount
        : 0);

    const messagesCount = Math.ceil((messageLength + reservedChars) / MESSAGE_LENGTH);
    const nextMessageLength = messagesCount * MESSAGE_LENGTH;

    return {
      messagesCount,
      nextMessageLength,
      messageLength: messageLength + reservedChars
    };
  }, []);

  const schema = yup.object().shape({
    channel: yup.string().required(),
    abandonment_duration: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .when([], (schema) => {
        if (custom) {
          return schema.nullable().notRequired();
        }
        return schema.nullable().required().min(1);
      }),
    cart_min_total: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .when([], (schema) => {
        if (custom) {
          return schema.nullable().notRequired();
        }
        return schema.nullable().required().min(1);
      }),
    discount_type: yup.string().when("discount_enabled", {
      is: true,
      then: yup.string().required(),
      otherwise: yup.string().nullable()
    }),
    discount: yup.number().when("discount_enabled", {
      is: true,
      then: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
        .required()
        .min(1),
      otherwise: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
    }),
    discount_duration: yup.number().when("discount_enabled", {
      is: true,
      then: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
        .required()
        .min(1),
      otherwise: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
        .nullable()
    }),
    discount_enabled: yup.boolean().notRequired(),
    message: yup
      .string()
      .test(
        "message-length",
        t("marketing.abandoned_carts.message_length_error", {
          count: MESSAGE_LENGTH * MAX_MESSAGES_COUNT
        }),
        (value, ctx) => {
          return (
            getMessagesCount(value ?? "", ctx.parent.discount ?? 0, ctx.parent.discount_duration ?? 0).messagesCount <=
            MAX_MESSAGES_COUNT
          );
        }
      )
      .required()
  });

  const form = useForm<IFormInputs>({
    mode: "all",
    defaultValues: {
      channel: "sms",
      discount_type: CouponType.PERCENTAGE
    },
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setError,
    setValue,
    reset
  } = form;

  const { displaySuccess, displayErrors } = useResponseToastHandler({ setError });

  useEffect(() => {
    if (reminder) {
      reset({
        channel: reminder.channel,
        message: reminder.message,
        discount_type: reminder.discount_type,
        cart_min_total: convertPrice(reminder.cart_min_total),
        discount: reminder.discount,
        discount_duration: reminder.discount_duration,
        abandonment_duration: reminder.abandonment_duration,
        discount_enabled: reminder.discount > 0
      });
    }
  }, [reminder]);

  useEffect(() => {
    dispatch({
      type: "app/setBackLink",
      payload: "/marketing/abandoned-carts"
    });

    dispatch({
      type: "app/setTitle",
      payload: reminder?.id
        ? t("marketing.abandoned_carts.edit_reminder")
        : t("marketing.abandoned_carts.create_new_reminder")
    });
  }, [reminder]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const mutation = reminder?.id ? updateReminderMutation : createReminderMutation;

    const couponResponse = (await mutation({
      url: custom ? "carts/reminders/custom" : undefined,
      cart_id: custom ? (reminderId as string) : undefined,
      id: reminder?.id as number,
      channel: data.channel,
      message: data.message,
      cart_min_total: data.cart_min_total,
      abandonment_duration: data.abandonment_duration,
      ...(data.discount_enabled && {
        discount_type: data.discount_type,
        discount: data.discount,
        discount_duration: data.discount_duration
      }),
      discount_enabled: data.discount_enabled ?? false
    })) as APIActionResponse<Coupon>;

    if (displayErrors(couponResponse)) return;
    displaySuccess(couponResponse);

    await router.push({
      pathname: `/marketing/abandoned-carts`
    });
  };

  const calculateMessageLength = useCallback(
    (msg: string) => {
      return getMessagesCount(msg, watch("discount") ?? 0, watch("discount_duration") ?? 0);
    },
    [watch("discount"), watch("discount_duration")]
  );

  function insertTextAtCaretPosition(text: string) {
    const textarea = document.getElementById("message") as HTMLTextAreaElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Insert the text at the caret position
    const newText = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos);

    // Update the textarea value
    setValue("message", newText, {
      shouldValidate: true,
      shouldDirty: true
    });

    // Update the caret position
    const newCaretPos = startPos + text.length;
    textarea.setSelectionRange(newCaretPos, newCaretPos);

    // Focus back on the textarea
    textarea.focus();
  }

  const insertVariable = (variable: string) => {
    insertTextAtCaretPosition(variable);
    /*setValue("message", `${getValues("message") ?? ""}${variable}`);*/
  };

  const formatMessage = useCallback((template: string) => {
    if (!template) return t("marketing.abandoned_carts.message_placeholder");
    return template.replace(/{{(.*?)}}/g, function (_, variable) {
      return "<b class='text-black'>{{" + variable.trim() + "}}</b>";
    });
  }, []);

  return (
    <Layout
      title={
        reminder?.id ? t("marketing.abandoned_carts.edit_reminder") : t("marketing.abandoned_carts.create_new_reminder")
      }
    >
      <Layout.Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                product={{ id: 1, ...reminder }}
                redirect="/marketing/abandoned-carts"
                form={form}
              />
            }
          >
            <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
              <Typography.Paragraph
                size="sm"
                className="font-medium text-gray-700"
              >
                {t("billing.sms_bundles.available_balance")}
              </Typography.Paragraph>
              <div className="flex items-start justify-between gap-4">
                <Typography.Paragraph
                  size="lg"
                  className="font-semibold"
                >
                  {t("billing.sms_bundles.sms_amount", {
                    amount: formatRawPriceWithoutCurrency(current_academy.sms_amount)
                  })}
                </Typography.Paragraph>
                <Button
                  as={Link}
                  href="/settings/billing/sms-bundles"
                  icon={
                    <Icon>
                      <EnvelopeOpenIcon />
                    </Icon>
                  }
                >
                  {t("billing.sms_bundles.buy_extra_bundle")}
                </Button>
              </div>
            </div>
            <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
              <Typography.Paragraph
                size="sm"
                className="font-medium text-gray-700"
              >
                {t("marketing.abandoned_carts.reminder_details")}
              </Typography.Paragraph>
              <div className="flex flex-col items-start justify-between gap-4">
                <Typography.Paragraph
                  size="md"
                  className="font-medium"
                >
                  {t("marketing.abandoned_carts.reminder_channel")}
                </Typography.Paragraph>
                <div className="flex w-full items-center justify-between gap-4">
                  <label
                    className={classNames(
                      "w-full cursor-default rounded-lg border px-4 py-4",
                      "flex items-center gap-2",
                      "border-primary bg-primary-50"
                    )}
                  >
                    <Form.Checkbox
                      id="sms-channel"
                      value="sms"
                      checked
                      label={t("marketing.abandoned_carts.reminder_channel_sms")}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        return false;
                      }}
                    />
                  </label>
                  <label
                    className={classNames(
                      "w-full cursor-not-allowed rounded-lg border px-4 py-4",
                      "flex items-center gap-2",
                      "border-gray-300 opacity-40"
                    )}
                  >
                    <Form.Checkbox
                      id="email-channel"
                      value="email"
                      disabled
                      className="text-gray-700"
                      label={t("marketing.abandoned_carts.reminder_channel_email")}
                    />
                    <Badge
                      variant="default"
                      rounded
                      size="sm"
                      className="mr-auto px-6"
                    >
                      {t("soon")}
                    </Badge>
                  </label>
                </div>
              </div>
            </div>
            {!custom ? (
              <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
                <Typography.Paragraph
                  size="sm"
                  className="font-medium text-gray-700"
                >
                  {t("marketing.abandoned_carts.reminder_settings")}
                </Typography.Paragraph>
                <div className="flex flex-col items-start gap-1 sm:flex-row">
                  <Form.Group
                    required
                    label={t("marketing.abandoned_carts.abandonment_duration")}
                    errors={errors.abandonment_duration?.message}
                    placeholder="0"
                    className="w-full"
                  >
                    <Controller
                      name="abandonment_duration"
                      control={control}
                      render={({ field }) => (
                        <Form.Number
                          placeholder="0"
                          suffix={t("day")}
                          min={0}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    required
                    label={
                      <>
                        <Trans
                          i18nKey="marketing.abandoned_carts.cart_min_total"
                          components={{
                            span: <span className="mx-0.5 text-xs text-gray-700" />
                          }}
                        />
                        <span className="text-danger">&nbsp;*</span>
                      </>
                    }
                    errors={errors.cart_min_total?.message}
                    placeholder="0"
                    className="w-full"
                  >
                    <Controller
                      name="cart_min_total"
                      control={control}
                      render={({ field }) => (
                        <Form.Number
                          placeholder="0"
                          suffix={currentCurrency}
                          min={0}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                </div>
              </div>
            ) : null}
            <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
              <Controller
                control={control}
                name="discount_enabled"
                render={({ field: { value, ...rest } }) => (
                  <Form.Toggle
                    id={rest.name}
                    value={Number(value ?? 0)}
                    checked={value}
                    label={
                      <Typography.Paragraph
                        size="sm"
                        className="font-medium text-gray-700"
                      >
                        {t("marketing.abandoned_carts.discount_settings")}
                      </Typography.Paragraph>
                    }
                    {...rest}
                  />
                )}
              />
              {watch("discount_enabled") && (
                <>
                  <Form.Group
                    label={t("marketing.coupons.form.type")}
                    required
                  >
                    <div className="flex items-start gap-4">
                      <Controller
                        name="discount_type"
                        control={control}
                        defaultValue={CouponType.PERCENTAGE}
                        render={({ field: { value, ...field } }) => (
                          <label
                            className={classNames(
                              "w-full cursor-pointer rounded border px-4 py-4",
                              "flex items-center gap-2",
                              value === CouponType.PERCENTAGE ? "border-primary bg-primary-50" : "border-gray"
                            )}
                          >
                            <Form.Radio
                              id="type-percentage"
                              value={CouponType.PERCENTAGE}
                              checked={value === CouponType.PERCENTAGE}
                              label={t("marketing.coupons.types.percentage")}
                              {...field}
                            />

                            <Icon
                              size="lg"
                              children={<ReceiptPercentIcon />}
                              className="mr-auto"
                            />
                          </label>
                        )}
                      />

                      <Controller
                        name="discount_type"
                        control={control}
                        defaultValue={CouponType.FLat}
                        render={({ field: { value, ...field } }) => (
                          <label
                            className={classNames(
                              "w-full cursor-pointer rounded border px-4 py-4",
                              "flex items-center gap-2",
                              value === CouponType.FLat ? "border-primary bg-primary-50" : "border-gray"
                            )}
                          >
                            <Form.Radio
                              id="type-flat"
                              value={CouponType.FLat}
                              checked={value === CouponType.FLat}
                              label={t("marketing.coupons.types.flat")}
                              {...field}
                            />

                            <Icon
                              size="lg"
                              children={<BanknotesIcon />}
                              className="mr-auto"
                            />
                          </label>
                        )}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group
                    required
                    errors={errors.discount?.message}
                  >
                    <Controller
                      name="discount"
                      control={control}
                      render={({ field }) => (
                        <Form.Number
                          placeholder="0"
                          suffix={watch("discount_type") === CouponType.PERCENTAGE ? t("percent") : currentCurrency}
                          min={0}
                          max={watch("discount_type") === CouponType.PERCENTAGE ? 100 : undefined}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                  <Form.Group
                    label={t("marketing.abandoned_carts.discount_expires_at")}
                    errors={errors.discount_duration?.message}
                    help={t("marketing.abandoned_carts.discount_expires_at_help")}
                    className="mb-0"
                    required
                  >
                    <Controller
                      name="discount_duration"
                      control={control}
                      render={({ field }) => (
                        <Form.Number
                          placeholder="0"
                          suffix={t("hour")}
                          min={0}
                          {...field}
                        />
                      )}
                    />
                  </Form.Group>
                </>
              )}
            </div>
            <div className="mb-4 space-y-4 rounded-2xl bg-white p-4">
              <Typography.Paragraph
                size="sm"
                className="font-medium text-gray-700"
              >
                {t("marketing.abandoned_carts.reminder_message")}
              </Typography.Paragraph>
              <Form.Group
                required
                label={t("marketing.abandoned_carts.message")}
                errors={errors.message?.message}
              >
                <Controller
                  name="message"
                  control={control}
                  render={({ field: { value, ...rest } }) => {
                    return (
                      <div className="relative mb-4 flex flex-col rounded-lg border border-gray bg-gray-50 p-2">
                        <Form.Textarea
                          id={rest.name}
                          placeholder={t("marketing.abandoned_carts.message_placeholder")}
                          className="break-words"
                          value={value ?? ""}
                          rows={5}
                          maxLength={MAX_MESSAGES_COUNT * MESSAGE_LENGTH}
                          {...rest}
                        />
                        <div className="my-2 flex justify-end gap-1">
                          <span className="text-xs">
                            {t("marketing.abandoned_carts.messages_count", {
                              messages_count: calculateMessageLength(value ?? "").messagesCount,
                              next_message_length: calculateMessageLength(value ?? "").nextMessageLength
                            })}
                          </span>
                          <span className="text-xs text-gray-800">/</span>
                          <span
                            className="text-xs text-gray-800"
                            key={`key-${watch("discount")}-${watch("discount_duration")}`}
                          >
                            {calculateMessageLength(value ?? "").messageLength}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Typography.Paragraph
                              size="sm"
                              className="text-gray-700"
                            >
                              {t("students_flow.student_name")}:
                            </Typography.Paragraph>
                            <Badge
                              onClick={() => insertVariable(STUDENT_NAME_VAR)}
                              variant="primary"
                              soft
                              rounded
                              className="cursor-pointer select-none px-3"
                            >
                              {STUDENT_NAME_VAR}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Typography.Paragraph
                              size="sm"
                              className="text-gray-700"
                            >
                              {t("marketing.abandoned_carts.discount_amount")}
                            </Typography.Paragraph>
                            <Badge
                              onClick={() => insertVariable(DISCOUNT_AMOUNT_VAR)}
                              variant="primary"
                              soft
                              rounded
                              className="cursor-pointer select-none px-3"
                            >
                              {DISCOUNT_AMOUNT_VAR}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Typography.Paragraph
                              size="sm"
                              className="text-gray-700"
                            >
                              {t("marketing.abandoned_carts.discount_duration")}
                            </Typography.Paragraph>
                            <Badge
                              onClick={() => insertVariable(DISCOUNT_DURATION_VAR)}
                              variant="primary"
                              soft
                              rounded
                              className="cursor-pointer select-none px-3"
                            >
                              {DISCOUNT_DURATION_VAR}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <div className="flex items-center gap-3 text-center before:h-px before:w-full before:bg-gray-400 after:h-px after:w-full after:bg-gray-400">
                  <Typography.Paragraph
                    size="sm"
                    className="shrink grow basis-auto whitespace-nowrap"
                  >
                    {t("marketing.abandoned_carts.message_preview")}
                  </Typography.Paragraph>
                </div>
                <div className="flex">
                  <Avatar
                    name={current_academy.title}
                    imageUrl={current_academy.favicon}
                    size="md"
                    className="ml-2 border-2 border-secondary"
                  />
                  <p
                    className="text-paragraph-sm w-full rounded bg-gray-300 p-2 font-normal text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(watch("message"))
                    }}
                  />
                </div>
              </Form.Group>
            </div>
          </Layout.FormGrid>
        </Form>
      </Layout.Container>
    </Layout>
  );
}
