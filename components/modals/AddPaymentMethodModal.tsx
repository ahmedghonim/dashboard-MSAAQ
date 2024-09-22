import React, { FC, useContext, useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeCardElementOptions } from "@stripe/stripe-js";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { PaymentMethodLogo } from "@/components";
import { useToast } from "@/components/toast";
import { AuthContext } from "@/contextes";
import { StripeContext } from "@/contextes/StripeContext";
import { GTM_EVENTS, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useCreateCardMutation } from "@/store/slices/api/billing/paymentMethodsSlice";
import { useSetupIntentMutation } from "@/store/slices/api/billing/stripeSlice";
import { APIActionResponse, Card, SetupIntent } from "@/types";

import { LockClosedIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface IFormInputs {
  cardholder_name: string;
}

interface AddPaymentMethodModalProps extends ModalProps {
  cardCreated?: (card: Card) => void;
}

const CARD_OPTIONS: StripeCardElementOptions = {
  classes: {
    base: "ms-form-control block stripe-element px-4 py-3",
    invalid: "ms-error",
    focus: "ms-form-control-focused"
  },
  style: {
    base: {
      fontFamily: `IBM Plex Sans Arabic, ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"`
    }
  }
};

const AddPaymentMethodModal: FC<AddPaymentMethodModalProps> = ({
  open = false,
  cardCreated,
  ...props
}: AddPaymentMethodModalProps) => {
  const { t } = useTranslation();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const { user } = useContext(AuthContext);
  const { setShowCheckoutAnimation } = useContext(StripeContext);
  const [toast] = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const { sendGTMEvent } = useGTM();

  const [setupIntentMutation] = useSetupIntentMutation();
  const [createCardMutation] = useCreateCardMutation();

  const schema = yup.object({
    cardholder_name: yup.string().trim().required()
  });

  useEffect(() => {
    if (!user?.name) {
      return;
    }

    setValue("cardholder_name", user?.name);
  }, [user]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    mode: "onSubmit"
  });

  const [clientSecret, setClientSecret] = useState<string>();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (isSubmitting) return;

    // Stripe.js has not loaded yet. Make sure to disable
    // form submission until Stripe.js has loaded.
    if (!stripe || !elements) {
      return;
    }

    setShowCheckoutAnimation(true);

    let client_secret = clientSecret;
    if (!client_secret) {
      const mutation = (await setupIntentMutation()) as APIActionResponse<SetupIntent>;
      if (displayErrors(mutation)) {
        return;
      }

      client_secret = mutation.data.data.client_secret;

      setClientSecret(client_secret);
    }

    const cardElement = elements.getElement(CardNumberElement);

    const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
      payment_method: {
        card: cardElement as any,
        billing_details: {
          name: data.cardholder_name,
          email: user.email
        }
      }
    });

    // @ts-ignore
    if (error || error?.message || error?.code) {
      let message =
        t(`billing.stripe_error_messages.${error?.decline_code}`, error.message) ??
        t(`billing.stripe_error_messages.${error.code}`, error.message);

      toast.error({
        message: message,
        dismissible: false
      });

      setShowCheckoutAnimation(false);
      setClientSecret(undefined);

      return;
    }

    const createCard = (await createCardMutation({
      payment_method_id: setupIntent.payment_method as string
    })) as APIActionResponse<Card>;

    if (displayErrors(createCard)) {
      setShowCheckoutAnimation(false);
      setClientSecret(undefined);

      return;
    }

    setShowCheckoutAnimation(false);

    displaySuccess(createCard);

    sendGTMEvent(GTM_EVENTS.ADD_PAYMENT_INFO, {
      currency: "USD",
      value: 0,
      coupon: null,
      payment_type: "Card"
    });

    setClientSecret(undefined);

    props.onDismiss?.();

    cardCreated?.(createCard.data.data);

    setTimeout(async () => {
      dispatch(apiSlice.util.invalidateTags(["payment-methods.index"]));
    }, 1000);
  };

  return (
    <Modal
      open={open}
      onDismiss={() => props.onDismiss?.()}
      className={"remove-dismiss-icon"}
      {...props}
    >
      <Modal.Header>
        <Modal.HeaderTitle>إضافة طريقة دفع جديدة</Modal.HeaderTitle>
        <div className="flex gap-2">
          <PaymentMethodLogo
            size={"sm"}
            method={"mada"}
          />
          <PaymentMethodLogo
            size={"sm"}
            method={"visa"}
          />
          <PaymentMethodLogo
            size={"sm"}
            method={"master"}
          />
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Content>
          <Form.Group
            errors={errors.cardholder_name?.message}
            required
            label={"الاسم على البطاقة"}
          >
            <Controller
              name="cardholder_name"
              control={control}
              render={({ field }) => (
                <Form.Input
                  placeholder={"أدخل الاسم المكتوب على البطاقة"}
                  {...field}
                />
              )}
            />
          </Form.Group>

          <Form.Group
            required
            label={"رقم البطاقة"}
          >
            <CardNumberElement options={CARD_OPTIONS} />
          </Form.Group>

          <div className="mb-6 flex w-full justify-between gap-6">
            <Form.Group
              required
              label={"تاريخ انتهاء الصلاحية"}
              className="mb-0 w-full"
            >
              <CardExpiryElement
                options={{
                  ...CARD_OPTIONS,
                  placeholder: "MM/YY"
                }}
              />
            </Form.Group>

            <Form.Group
              required
              label={"رمز التحقق من البطاقة CVC"}
              className="mb-0 w-full"
            >
              <CardCvcElement options={CARD_OPTIONS} />
            </Form.Group>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <div className="flex h-[32px] w-[32px] rounded-full bg-black/5">
                <Icon
                  className="m-auto"
                  children={<LockClosedIcon />}
                  size={"sm"}
                />
              </div>
            </div>

            <Typography.Paragraph
              children={"العملية آمنة تمامًا، معلومات البطاقة مشفّرة ولا يمكن ﻷحد الاطلاع عليها."}
            />
          </div>
        </Modal.Content>

        <Modal.Footer className="justify-between">
          <Button
            size="lg"
            className="ml-2"
            type="submit"
            children={isSubmitting ? t("submitting") : t("add")}
            disabled={!isDirty || !isValid || isSubmitting}
          />

          <Button
            ghost
            size="lg"
            variant="default"
            onClick={() => props.onDismiss?.()}
            children={t("cancel")}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
export default AddPaymentMethodModal;
