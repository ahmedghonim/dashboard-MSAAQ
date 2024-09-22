import { FC, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { isEmpty } from "lodash";
import omit from "lodash/omit";
import { useTranslation } from "next-i18next";
import { SubmitHandler } from "react-hook-form";

import { INelcVerificationFormInputs, StepProps } from "@/components/academyVerification/nelc";
import { Card } from "@/components/cards";
import CheckoutAnimation from "@/components/checkout-animation";
import { Frames } from "@/components/frames";
import { useFormatPrice, useResponseToastHandler } from "@/hooks";
import { useFetchNelcProductsQuery, useNelcCheckoutMutation } from "@/store/slices/api/nelcSlice";
import { APIActionResponse, Product } from "@/types";

import { Button, Typography } from "@msaaqcom/abjad";

const PriceTag = ({ price }: { price: number }) => {
  const { formatCurrency } = useFormatPrice("SAR");
  return (
    <span className="flex items-baseline gap-1">
      <strong children={price} />
      <small children={formatCurrency("SAR")} />
    </span>
  );
};

const VerificationPayment: FC<StepProps> = ({ handleBack, watch, form }) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { isSubmitting }
  } = form;

  const [canCheckout, setCanCheckout] = useState<boolean>(false);
  const [showCheckoutAnimation, setShowCheckoutAnimation] = useState<boolean>(false);
  const [$source, setSource] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const { displayErrors } = useResponseToastHandler({});

  const { data: products, isLoading } = useFetchNelcProductsQuery();

  const [nelcCheckout] = useNelcCheckoutMutation();

  useEffect(() => {
    if ($source) {
      handleSubmit(onSubmit)();
    }
  }, [$source]);

  const onSubmit: SubmitHandler<INelcVerificationFormInputs> = async (data) => {
    let statusValue = data.status_value;
    const checkout = (await nelcCheckout({
      ...omit(data, ["city", "status_value", "activity_license_expiry_date"]),
      sector: data.sector.value,
      education_license_type: data.education_license_type.value,
      commercial_register_status: statusValue,
      organization_type: data.organization_type.value,
      nelc_city_id: data.city.value,
      activity_license_image: data.activity_license_image?.map((file) => file.file).pop(),
      ...(data.activity_license_expiry_date
        ? { activity_license_expiry_date: data.activity_license_expiry_date }
        : null),
      ...(data.logo &&
        data.sector.value == "non_profit_without_commercial_registration" && {
          logo: data.logo?.map((file) => file.file).pop()
        }),
      source: $source
    })) as APIActionResponse<INelcVerificationFormInputs>;

    if (displayErrors(checkout)) {
      setShowCheckoutAnimation(false);
      return;
    }

    // @ts-ignore
    // TODO: Remove later
    const redirect_url = checkout.data?.redirect_url ?? checkout.data?.data?.redirect_url;

    if (redirect_url) {
      window.location.href = redirect_url;
    } else {
      setShowCheckoutAnimation(false);
      // @ts-ignore
      // TODO: Remove later
      if (checkout.data.status == "success" || checkout.data.data.status == "success") {
        window.location.href = "/settings/verify/status";
      } else {
        setError(t("validation.unexpected_error") as string);
      }
    }
  };

  const onCardTokenized = async (source: any) => {
    setCanCheckout(true);
    setShowCheckoutAnimation(true);
    Frames.enableSubmitForm();
    if (!isEmpty(source)) {
      setSource(source);
    }
  };

  const getCurrentProductPlanPrice = useMemo(() => {
    return (
      products?.data?.find((item: Product) => item.slug.includes(watch("education_license_type").value.split("_")[0]))
        .price / 100
    );
  }, [watch("education_license_type"), products]);

  return (
    <>
      <div className="mt-10">
        <Card className="mb-6">
          <Card.Body className="p-0">
            <div className="flex p-4 ">
              <Typography.Paragraph
                className="w-full"
                children={t("academy_verification.nelc.details")}
              />
              <Typography.Paragraph
                className="w-full"
                children={t("academy_verification.nelc.price")}
              />
            </div>
            {!isLoading && products && (
              <div className="flex flex-col divide-y">
                <div className="flex border-t">
                  <div className="flex w-full p-4">
                    <Typography.Paragraph
                      className="w-full text-gray-800"
                      weight="medium"
                      children={t("academy_verification.nelc.fee")}
                    />
                    <Typography.Paragraph
                      weight="bold"
                      className="w-full text-gray-800"
                      children={<PriceTag price={Number(getCurrentProductPlanPrice)} />}
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex w-full p-4">
                    <Typography.Paragraph
                      className="w-full text-gray-800"
                      weight="medium"
                      children={t("academy_verification.nelc.tax")}
                    />
                    <Typography.Paragraph
                      weight="bold"
                      className="w-full text-gray-800"
                      children={<PriceTag price={0} />}
                    />
                  </div>
                </div>
                <div className="flex">
                  <div className="flex w-full p-4">
                    <Typography.Paragraph
                      className="w-full text-gray-950"
                      weight="medium"
                      children={t("academy_verification.nelc.total")}
                    />
                    <Typography.Paragraph
                      weight="bold"
                      className="w-full text-gray-950"
                      children={<PriceTag price={Number(getCurrentProductPlanPrice)} />}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="divide-y">
            <div className="flex justify-between pb-4">
              <Typography.Paragraph
                children={"الدفع بالبطاقة الائتمانية"}
                weight="medium"
                size="sm"
              />

              <div className="flex items-center gap-3">
                <div className="flex h-[21px] items-center rounded-[3px] border border-[#F4F6F6] px-[3px] py-[6px]">
                  <Image
                    src="https://cdn.msaaq.com/assets/images/payments/visa.svg"
                    width={30}
                    height={30}
                    alt="visa"
                  />
                </div>
                <div className="flex h-[21px] items-center rounded-[3px] border border-[#F4F6F6] px-[3px] py-[6px]">
                  <Image
                    src="https://cdn.msaaq.com/assets/images/payments/master.svg"
                    width={30}
                    height={30}
                    alt="mastercard"
                  />
                </div>
                <div className="flex h-[21px] items-center rounded-[3px] border border-[#F4F6F6] px-[3px] py-[6px]">
                  <Image
                    src="https://cdn.msaaq.com/assets/images/payments/mada.svg"
                    width={30}
                    height={30}
                    alt="mada"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col pt-4">
              <Typography.Paragraph
                weight="medium"
                className="mb-2"
                children={"تفاصيل البطاقة"}
              />
              <Frames
                config={{
                  publicKey: process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY as string,
                  localization: {
                    cardNumberPlaceholder: "0000 0000 0000 0000",
                    expiryMonthPlaceholder: "MM",
                    expiryYearPlaceholder: "YY",
                    cvvPlaceholder: "CVC"
                  },
                  style: {
                    base: {
                      height: "46px",
                      color: "#000000",
                      fontSize: ".875rem",
                      lineHeight: "1.7",
                      fontWeight: "500"
                    },
                    invalid: {
                      color: "#ef4444"
                    },
                    placeholder: {
                      base: {
                        color: "#000000",
                        opacity: "28%"
                      }
                    }
                  }
                }}
                cardValidationChanged={(e) => {
                  setCanCheckout(e.isValid);
                }}
                frameValidationChanged={(e) => {
                  if (e.isValid && !e.isEmpty) {
                    setError("");
                  } else {
                    setError(t(`shopping_cart:${e.element}`) as string);
                  }
                }}
                cardSubmitted={() => {
                  setCanCheckout(false);
                }}
                cardTokenizationFailed={() => {
                  setCanCheckout(true);
                  Frames.enableSubmitForm();
                }}
                cardTokenized={(e) => {
                  onCardTokenized(e);
                }}
              >
                <Frames.Card />
              </Frames>
            </div>
          </Card.Body>
        </Card>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="dismiss"
          children={t("academy_verification.back")}
          onClick={handleBack}
        />
        <Button
          disabled={!canCheckout || isSubmitting}
          onClick={() => {
            Frames.submitCard();
          }}
          variant={"primary"}
        >
          دفع الآن
        </Button>
      </div>
      <CheckoutAnimation
        show={showCheckoutAnimation}
        children={
          <div className="flex flex-col justify-center text-center">
            <Typography.Paragraph
              className="dots-animate font-bold"
              children="الرجاءُ الانتظار، جارٍ إتمام العملية"
            />
          </div>
        }
      />
    </>
  );
};
export default VerificationPayment;
