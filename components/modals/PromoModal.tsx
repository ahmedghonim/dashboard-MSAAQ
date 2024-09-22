import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { deleteCookie, getCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useCheckPromoCodeMutation } from "@/store/slices/api/billing/stripeSlice";
import { APIActionResponse, Plan, Plans } from "@/types";

import { ReceiptPercentIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, ModalProps, Typography } from "@msaaqcom/abjad";

interface Props extends ModalProps {
  plan: Plan;
  interval: string;
  onPromoCodeSubmit: (code: any) => void;
  handleSubscribeSubmit: (code: any) => void;
}

const PromoModal: React.FC<Props> = ({ open, plan, interval, onPromoCodeSubmit, handleSubscribeSubmit, ...props }) => {
  const { t } = useTranslation();
  const { formatPrice } = useFormatPrice("USD");
  const [show, setShow] = useState<boolean>(false);
  const [code, setCode] = useState<any>();
  const [$error, set$Error] = useState<boolean>();
  const router = useRouter();

  const schema = yup
    .object({
      code: yup.string().nullable()
    })
    .nullable();
  const {
    control,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { isValid, isDirty, isSubmitting },
    reset
  } = useForm<{
    code: string;
  }>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const coupon = getCookie("coupon") || router?.query?.coupon;
    setShow(open ?? false);

    if (open) {
      if (coupon) {
        setCode(coupon);
        setValue("code", coupon as string);
        handleSubmit(onSubmit)();
      }
    }
  }, [open, router]);

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  let prices: any = {};
  plan?.prices?.map((price) => {
    prices = { ...prices, [price.interval]: price };
  });

  const PlanPrice = useCallback(() => {
    return interval === "yearly" ? (
      <div>
        <Typography.Paragraph
          size="sm"
          weight="medium"
          className={getPlanColor(plan)}
        >
          {formatPrice(prices?.yearly?.price, prices?.yearly?.currency)}
          {"/"}
          {t(`billing.plans.intervals.yearly`)}
        </Typography.Paragraph>
      </div>
    ) : (
      <Typography.Paragraph
        weight="medium"
        className={getPlanColor(plan)}
        size="sm"
        children={
          formatPrice(prices[interval].price, prices[interval].currency) +
          " " +
          t(`billing.plans.intervals.${interval}`)
        }
      />
    );
  }, [plan, interval]);
  const getPlanColor = (plan: Plan) => {
    switch (plan.slug) {
      case Plans.GROWTH:
        return "text-orange";
      case Plans.PRO:
        return "text-purple";
    }
  };

  const [checkPromoCode] = useCheckPromoCodeMutation();
  const onSubmit: SubmitHandler<{ code: string }> = async (data) => {
    const response = (await checkPromoCode({
      code: data.code
    })) as APIActionResponse<any>;
    if (response?.data) {
      set$Error(false);
      setCode(response.data.data);
      displaySuccess(response);
      onPromoCodeSubmit(response.data.data);
    } else {
      displayErrors(response);
      setCode(null);
      onPromoCodeSubmit(null);
      deleteCookie("coupon");
      set$Error(true);
    }
  };

  return (
    <>
      <Modal
        size="xl"
        open={show}
        onDismiss={() => {
          setShow(false);
          props.onDismiss?.();
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("promo.modal.title")}</Modal.HeaderTitle>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Modal.Content>
              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gray-100 p-6">
                <Image
                  src={`/images/subscription/${plan.slug}.svg`}
                  alt={plan.title}
                  width={40}
                  height={40}
                  className="pointer-events-none"
                />
                <div className="flex flex-col">
                  <Typography.Paragraph
                    className={getPlanColor(plan)}
                    children={plan.title}
                  />
                  <PlanPrice />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Form.Group className="!mb-0 w-full">
                  <Controller
                    control={control}
                    name="code"
                    render={({ field }) => {
                      return (
                        <Form.Input
                          placeholder={t("promo.code_input_placeholder")}
                          prepend={
                            <Icon className="mr-2">
                              <ReceiptPercentIcon className="text-orange" />
                            </Icon>
                          }
                          className="w-full"
                          {...field}
                        />
                      );
                    }}
                  />
                </Form.Group>
                <Button
                  disabled={isSubmitting || !isValid || !isDirty}
                  onClick={() => {
                    if (code || $error) {
                      set$Error(false);
                      setCode(null);
                      onPromoCodeSubmit(null);
                      reset({
                        code: ""
                      });
                    } else {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  variant={"default"}
                  children={code || $error ? t("promo.deactivate") : t("promo.activate")}
                />
              </div>
              {code && code.promo_code && (
                <>
                  <hr className="my-6" />
                  <div className="mb-3 flex justify-between">
                    <Typography.Paragraph
                      size="sm"
                      weight="normal"
                    >
                      {t("promo.before_cut_off")}
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      size="sm"
                      weight="normal"
                    >
                      {formatPrice(prices[interval].price)}
                    </Typography.Paragraph>
                  </div>
                  <div className="flex justify-between">
                    <Typography.Paragraph
                      size="md"
                      weight="medium"
                    >
                      {t("promo.payment_amount")}
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      size="md"
                      weight="medium"
                    >
                      {code.promo_code.discount_type == "percent"
                        ? formatPrice(
                            prices[interval].price - prices[interval].price * (code.promo_code.discount / 100)
                          )
                        : formatPrice(prices[interval].price - code.promo_code.discount)}
                    </Typography.Paragraph>
                  </div>
                </>
              )}
            </Modal.Content>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full justify-between">
              <Button
                size="lg"
                className="ml-2"
                children={t("promo.confirm_subscription")}
                onClick={() => {
                  handleSubscribeSubmit(code);
                  reset();
                  setCode(null);
                }}
                disabled={Boolean(watch("code") && code == null)}
              />
              <Button
                size="lg"
                variant="default"
                children={t("promo.cancel")}
                onClick={() => {
                  props.onDismiss?.();
                }}
              />
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
export default PromoModal;
