import { FC, useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import { Layout } from "@/components";
import ActivateMsaaqPayCard from "@/components/cards/ActivateMsaaqPayCard";
import { useAppSelector } from "@/hooks";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { App } from "@/types";
import { convertPrice } from "@/utils";
import { eventBus } from "@/utils/EventBus";

import { Alert, Badge, Form } from "@msaaqcom/abjad";

export interface IFormPricingFormInputs {
  pricing_type: string;
  price: number;
  sales_price: number;
}

interface IProps {
  onSubmit: (data: IFormPricingFormInputs) => void;
  redirectToPathOnCancel: string;
  defaultValues?: (IFormPricingFormInputs & { was_edited: boolean }) | any;
  showMemberships?: boolean;
  labels: {
    freeLabel: string;
    freeDescription: string;
    paidLabel: string;
    paidDescription: string;
  };
  sectionTitle: string;
  sectionDescription: string;
}

const PricingForm: FC<IProps> = ({
  redirectToPathOnCancel,
  onSubmit,
  defaultValues,
  showMemberships,
  sectionDescription,
  sectionTitle,
  labels
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { installedPaymentGateways } = useAppSelector<AppSliceStateType>((state) => state.app);

  const schema = yup.object().shape({
    price: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .required(),
    pricing_type: yup.string().required(),
    sales_price: yup
      .number()
      .transform((value) => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0)
      .nullable()
      .when("pricing_type", {
        is: (pricingType: string) => pricingType !== "free",
        then: yup
          .number()
          .test(
            "is-greater-than-price",
            t("sales_price_should_be_bigger_then_price"),
            function (salesPrice: number | null | undefined, { resolve }) {
              const price: number = resolve(yup.ref("price"));
              return salesPrice == 0
                ? true
                : salesPrice !== null && typeof salesPrice !== "undefined" && salesPrice > price;
            }
          )
      })
  });

  const form = useForm<IFormPricingFormInputs>({
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isDirty }
  } = form;

  useEffect(() => {
    if (defaultValues) {
      reset({
        pricing_type: defaultValues.price > 0 ? "paid" : "free",
        price: convertPrice(defaultValues.price),
        sales_price: convertPrice(defaultValues.sales_price)
      });
    }
  }, [defaultValues]);

  useEffect(() => {
    if (watch("pricing_type") === "free") {
      setValue("price", 0);
      setValue("sales_price", 0);
    } else {
      setValue("price", convertPrice(defaultValues?.price));
      setValue("sales_price", convertPrice(defaultValues?.sales_price));
    }
  }, [watch("pricing_type")]);

  useEffect(() => {
    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Layout.FormGrid
        sidebar={
          <Layout.FormGrid.Actions
            product={defaultValues}
            redirect={redirectToPathOnCancel}
            form={form}
          />
        }
      >
        <Form.Section
          title={sectionTitle}
          description={sectionDescription}
          className="mb-6"
          id="pricing-form"
        >
          <Form.Group>
            <Controller
              name={"pricing_type"}
              control={control}
              render={({ field: { value, ...rest } }) => {
                return (
                  <Form.Radio
                    label={labels.freeLabel}
                    description={labels.freeDescription}
                    id="free"
                    value={"free"}
                    checked={value === "free"}
                    {...rest}
                  />
                );
              }}
            />
          </Form.Group>

          <Form.Group>
            <Controller
              name={"pricing_type"}
              control={control}
              render={({ field: { value, ...rest } }) => {
                return (
                  <Form.Radio
                    label={labels.paidLabel}
                    description={labels.paidDescription}
                    id="paid"
                    value={"paid"}
                    checked={value === "paid"}
                    {...rest}
                  >
                    {watch("pricing_type") === "paid" && (
                      <>
                        <Form.Group
                          errors={errors.price?.message || errors.sales_price?.message}
                          className="mt-2 gap-y-2"
                        >
                          <div className="mt-2 flex flex-col items-end md:flex-row">
                            <Form.Group
                              className="mb-0 w-full md:ml-4 md:w-2/4"
                              label={t("original_price")}
                              tooltip={t("original_price_tooltip")}
                              required
                            >
                              <Controller
                                name={"price"}
                                control={control}
                                render={({ field: { value, ...rest } }) => (
                                  <Form.Number
                                    value={value}
                                    placeholder={"0"}
                                    {...rest}
                                    disabled={!installedPaymentGateways.length}
                                  />
                                )}
                              />
                            </Form.Group>
                            <Form.Group
                              className="mb-0 w-full md:w-2/4"
                              label={t("price_after_discount")}
                              tooltip={t("price_after_discount_tooltip")}
                            >
                              <Controller
                                name={"sales_price"}
                                control={control}
                                render={({ field: { value, ...rest } }) => (
                                  <Form.Number
                                    value={value}
                                    placeholder={"0"}
                                    {...rest}
                                    disabled={!installedPaymentGateways.length}
                                  />
                                )}
                              />
                            </Form.Group>
                          </div>
                        </Form.Group>
                        {!installedPaymentGateways.length ||
                        installedPaymentGateways?.find((gateway: App) => gateway.slug === "msaaqpay")?.installed ==
                          undefined ? (
                          <div className="mt-4 flex md:-mx-6">
                            <ActivateMsaaqPayCard
                              showInPricingForm
                              hideImage
                              canCancel={false}
                              prepend={
                                !installedPaymentGateways.length ||
                                installedPaymentGateways?.find((gateway: App) => gateway.slug === "msaaqpay")
                                  ?.installed !== undefined ? (
                                  <Alert
                                    variant="warning"
                                    dismissible
                                    title={t("msaaq_pay.activate_msaaqpay_title")}
                                    children={t("msaaq_pay.activate_msaaqpay_description")}
                                  />
                                ) : null
                              }
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  </Form.Radio>
                );
              }}
            />
          </Form.Group>

          {showMemberships && (
            <>
              <Form.Group>
                <Form.Radio
                  label={
                    <>
                      <div className="flex items-center">
                        {t("member_ships_and_subscriptions")}
                        <Badge
                          variant="default"
                          rounded
                          className="mr-2"
                          size="sm"
                        >
                          {t("soon")}
                        </Badge>
                      </div>
                    </>
                  }
                  readOnly
                  id={"subscriptions"}
                  description={t("member_ships_and_subscriptions_description")}
                />
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Radio
                  label={
                    <>
                      <div className="flex items-center">
                        {t("payment_in_installments")}
                        <Badge
                          variant="default"
                          rounded
                          className="mr-2"
                          size="sm"
                        >
                          {t("soon")}
                        </Badge>
                      </div>
                    </>
                  }
                  id={"installments"}
                  readOnly
                  description={t("payment_in_installments_description")}
                />
              </Form.Group>
            </>
          )}
        </Form.Section>
      </Layout.FormGrid>
    </Form>
  );
};
export default PricingForm;
