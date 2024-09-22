import React, { FC, useEffect, useMemo, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Select } from "@/components/select";
import { useAppDispatch, useAppSelector, useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useUninstallAppMutation } from "@/store/slices/api/appsSlice";
import { useFetchMsaaqPaySettingsQuery } from "@/store/slices/api/msaaq-pay/msaaqpaySlice";
import { useFetchPayoutSettingsQuery } from "@/store/slices/api/msaaq-pay/payoutsSlice";
import { AppSliceStateType, fetchInstalledApps } from "@/store/slices/app-slice";
import { APIActionResponse, App } from "@/types";

import { Alert, Button, Form, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface CancelMsaaqPayModal extends ModalProps {}

export type IFormInputs = {
  reason: {
    label: string;
    value: string;
  };
  request_payout: boolean;
  password: string;
  step: "reason" | "confirm";
};

const CancelMsaaqPayModal: FC<CancelMsaaqPayModal> = ({ open, onDismiss }) => {
  const { t } = useTranslation();
  const { installedApps } = useAppSelector<AppSliceStateType>((state) => state.app);
  const { data: payoutSettings } = useFetchPayoutSettingsQuery();
  const { data: settings } = useFetchMsaaqPaySettingsQuery();
  const [available_balance, setAvailableBalance] = useState<number>(0);
  const [cancelReasons, setCancelReasons] = useState<any>([]);

  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const { formatPriceWithoutCurrency, currentCurrency } = useFormatPrice();

  const [uninstall] = useUninstallAppMutation();

  const schema = yup.object().shape({
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
    request_payout: yup.boolean().when("step", { is: "confirm", then: yup.boolean().required() }),
    password: yup.string().when("step", { is: "confirm", then: yup.string().required() })
  });

  const [show, setShow] = useState<boolean | undefined>(false);
  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<IFormInputs>({
    defaultValues: {
      step: "reason"
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (payoutSettings) {
      setAvailableBalance(payoutSettings.available_balance);
    }
  }, [payoutSettings]);

  useEffect(() => {
    if (settings) {
      setCancelReasons(() => {
        return settings.cancellation_reasons.map((reason) => {
          return {
            label: reason.reason,
            value: reason.id
          };
        });
      });
    }
  }, [settings]);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const msaaqpayApp = useMemo(() => installedApps.find((app) => app.slug === "msaaqpay"), [installedApps]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting || !msaaqpayApp) return;

    const app = (await uninstall({
      id: msaaqpayApp.id,
      ...{
        password: data.password,
        request_payout: data.request_payout,
        reason_id: data.reason.value
      }
    })) as APIActionResponse<App>;

    if (displayErrors(app)) return;

    displaySuccess(app);
    dispatch(fetchInstalledApps());
    onDismiss?.();
  };
  return (
    <Modal
      size="lg"
      open={show}
      onDismiss={() => {
        setValue("step", "reason");
        onDismiss?.();
      }}
    >
      <Modal.Header>
        <Modal.HeaderTitle>{t("msaaq_pay.banner.cancel")}</Modal.HeaderTitle>
      </Modal.Header>
      <Modal.Body>
        {watch("step") === "reason" && (
          <Modal.Content className="space-y-6">
            <Modal.BodyDescription>{t("msaaq_pay.cancel_confirmation.description")}</Modal.BodyDescription>
            <Alert
              variant="danger"
              title={t("msaaq_pay.cancel_confirmation.alert.title")}
            >
              {(
                t("msaaq_pay.cancel_confirmation.alert.list", {
                  returnObjects: true
                }) as string[]
              ).map((item, index) => (
                <span
                  key={index}
                  className="block"
                >
                  {item}
                </span>
              ))}
            </Alert>
            <Form.Group
              label={t("msaaq_pay.cancel_confirmation.reason")}
              help={t("msaaq_pay.cancel_confirmation.reason_help")}
              errors={errors.reason?.message}
              className="mb-0"
            >
              <Controller
                render={({ field }) => (
                  <Select
                    options={cancelReasons}
                    placeholder={t("msaaq_pay.cancel_confirmation.reason_placeholder")}
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
            <Typography.Paragraph weight="medium">{t("msaaq_pay.cancel_confirmation.warning_1")}</Typography.Paragraph>
            <Alert variant="warning">{t("msaaq_pay.cancel_confirmation.warning_2")}</Alert>
            <Form.Group className="mb-0">
              <Controller
                render={({ field: { value, ...rest } }) => (
                  <Form.Checkbox
                    id="test"
                    label={t("msaaq_pay.payouts.withdraw_all_amount", {
                      amount: formatPriceWithoutCurrency(available_balance),
                      currency: currentCurrency
                    })}
                    description={t("msaaq_pay.payouts.withdraw_all_amount_description")}
                    value={"test"}
                    {...rest}
                  />
                )}
                name={"request_payout"}
                control={control}
              />
            </Form.Group>
            <Form.Group
              required
              label={t("auth.password")}
              className="mb-0"
            >
              <Controller
                render={({ field }) => <Form.Password {...field} />}
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
              children={t("msaaq_pay.cancel_confirmation.back")}
              onClick={() => {
                onDismiss?.();
              }}
            />
            <Button
              variant="dismiss"
              size="lg"
              children={t("next")}
              disabled={!isValid || isSubmitting}
              onClick={() => setValue("step", "confirm")}
            />
          </>
        )}
        {watch("step") === "confirm" && (
          <>
            <Button
              size="lg"
              children={t("msaaq_pay.cancel_confirmation.confirm")}
              variant="danger"
              disabled={!isValid || isSubmitting}
              onClick={() => {
                handleSubmit(onSubmit)();
              }}
            />
            <Button
              variant="dismiss"
              size="lg"
              children={t("msaaq_pay.cancel_confirmation.cancel")}
              onClick={() => {
                onDismiss?.();
                reset();
                setValue("step", "reason");
              }}
            />
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};
export default CancelMsaaqPayModal;
