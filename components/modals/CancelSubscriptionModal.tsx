import React, { useContext, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { Trans, useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Select } from "@/components/select";
import { AuthContext } from "@/contextes";
import { GTM_EVENTS, useGTM, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import {
  useFetchSubscriptionCancellationReasonsQuery,
  usePauseSubscriptionMutation
} from "@/store/slices/api/billing/subscriptionsSlice";
import { APIActionResponse, Subscription } from "@/types";

import { Alert, Button, Form, Modal, Typography } from "@msaaqcom/abjad";

export type IFormInputs = {
  reason: {
    label: string;
    value: string;
  };
  password: string;
  step: "reason" | "confirm";
};

const CancelSubscriptionModal = ({ subscription }: { subscription: Subscription }) => {
  const { t } = useTranslation();
  const { refetchAuth } = useContext(AuthContext);
  const [show, setShow] = useState<boolean | undefined>(false);
  const [pauseSubscriptionMutation] = usePauseSubscriptionMutation();
  const { data: cancelReasons = { data: [] } } = useFetchSubscriptionCancellationReasonsQuery();
  const cancelNotes: string[] = t("billing.subscriptions.cancellation.cancel_notes", { returnObjects: true }) ?? [];

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
    setError,
    reset
  } = useForm<IFormInputs>({
    defaultValues: {
      step: "reason"
    },
    mode: "all",
    resolver: yupResolver(
      yup.object().shape({
        reason: yup
          .object()
          .shape({
            label: yup.string().required(),
            value: yup.string().required()
          })
          .when("step", {
            is: "reason",
            then: yup
              .object()
              .shape({
                label: yup.string().required(),
                value: yup.string().required()
              })
              .required()
          }),
        password: yup.string().when("step", { is: "confirm", then: yup.string().required() })
      })
    )
  });

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const { sendGTMEvent } = useGTM();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;

    const response = (await pauseSubscriptionMutation({
      reason_id: data.reason.value,
      password: data.password
    })) as APIActionResponse<Subscription>;

    if (displayErrors(response)) return;

    sendGTMEvent(GTM_EVENTS.SUBSCRIPTION_CANCELED, {
      reason: data.reason.label
    });

    await refetchAuth();

    displaySuccess(response);
  };

  return (
    <>
      <Button
        children={t("billing.plans.cancel_subscription")}
        className="w-full"
        variant={"danger"}
        onClick={() => setShow(true)}
        ghost
      />

      <Modal
        size="lg"
        open={show}
        onDismiss={() => {
          setValue("step", "reason");
          setShow(false);
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle children={t("billing.subscriptions.cancellation.modal_title")} />
        </Modal.Header>

        <Modal.Body>
          {watch("step") === "reason" && (
            <Modal.Content className="space-y-6">
              <div>
                <Typography.Paragraph
                  weight="bold"
                  className="mb-1"
                  children={t("billing.subscriptions.cancellation.are_you_sure")}
                />
                <Typography.Paragraph children={t("billing.subscriptions.cancellation.we_will_miss_you")} />
              </div>

              <Alert
                variant="danger"
                title={t("billing.subscriptions.cancellation.before_you_cancel_note")}
              >
                <ul className="list-inside list-disc">
                  {cancelNotes?.map((item, i) => (
                    <li
                      key={i}
                      children={item}
                    />
                  ))}
                </ul>
              </Alert>

              <Form.Group
                label={t("billing.subscriptions.cancellation.cancel_reason")}
                help={t("billing.subscriptions.cancellation.cancel_reason_help")}
                errors={errors.reason?.message}
                className="mb-0"
              >
                <Controller
                  render={({ field }) => (
                    <Select
                      options={
                        cancelReasons.data.length
                          ? cancelReasons.data.map((reason) => ({
                              label: reason.reason,
                              value: reason.id
                            }))
                          : []
                      }
                      placeholder={t("billing.subscriptions.cancellation.cancel_reason_placeholder")}
                      {...field}
                    />
                  )}
                  name={"reason"}
                  control={control}
                />
              </Form.Group>
            </Modal.Content>
          )}

          {watch("step") === "confirm" && (
            <Modal.Content className="space-y-6">
              <Typography.Paragraph
                weight="medium"
                children={t("billing.subscriptions.cancellation.if_you_cancel")}
              />

              <Alert
                variant="warning"
                children={
                  <Trans
                    i18nKey="billing.subscriptions.cancellation.you_still_have_access_until"
                    values={{
                      expiry_date: dayjs(subscription.next_payment?.date).format("DD MMM YYYY")
                    }}
                    components={{
                      b: <strong />
                    }}
                  />
                }
              />

              <Form.Group
                required
                label={t("auth.password")}
                className="mb-0"
              >
                <Controller
                  render={({ field }) => (
                    <Form.Password
                      {...field}
                      autoComplete={"off"}
                      placeholder={t("enter_password_to_continue")}
                    />
                  )}
                  name={"password"}
                  control={control}
                />
              </Form.Group>
            </Modal.Content>
          )}
        </Modal.Body>

        <Modal.Footer className="gap-2">
          {watch("step") === "reason" && (
            <>
              <Button
                size="lg"
                children={t("billing.subscriptions.cancellation.stay_on_current_plan")}
                onClick={() => setShow(false)}
              />
              <Button
                variant="dismiss"
                size="lg"
                children={t("next")}
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                onClick={() => setValue("step", "confirm")}
              />
            </>
          )}
          {watch("step") === "confirm" && (
            <>
              <Button
                size="lg"
                children={t("billing.subscriptions.cancellation.confirm_cancellation")}
                variant="danger"
                disabled={!isValid}
                onClick={() => {
                  handleSubmit(onSubmit)();
                }}
              />
              <Button
                variant="dismiss"
                size="lg"
                children={t("billing.subscriptions.cancellation.go_back")}
                onClick={() => {
                  reset();
                  setValue("step", "reason");
                }}
              />
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default CancelSubscriptionModal;
