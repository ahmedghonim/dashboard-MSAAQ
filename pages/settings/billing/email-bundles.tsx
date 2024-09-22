import { useContext, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";

import { Card, PaymentMethodLogo, Price } from "@/components";
import CheckoutAnimation from "@/components/checkout-animation";
import ProgressRing from "@/components/progress/ProgressRing";
import { AuthContext, SubscriptionContext } from "@/contextes";
import { StripeContext } from "@/contextes/StripeContext";
import { useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchEmailPlansQuery, usePurchaseEmailBundleMutation } from "@/store/slices/api/billing/emailPlansSlice";
import { useFetchCardsQuery } from "@/store/slices/api/billing/paymentMethodsSlice";
import { APIActionResponse } from "@/types";
import { EmailPlan } from "@/types/models/emailPlan";
import { classNames } from "@/utils";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Form, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  plan_price_id: number;
  card_id: string | null;
  quantity: number;
  plan: EmailPlan;
}
const LoadingScreen = () => {
  return (
    <>
      <div className="h-[400px] w-[448px] flex-shrink-0 animate-pulse rounded-xl bg-gray-300"></div>
      <div className="h-[400px] w-[calc(100%-_-448px)] animate-pulse rounded-xl bg-gray-300"></div>
    </>
  );
};

const EmailBundleItem = ({
  plan,
  index,
  selectedPlan,
  onSelectItem
}: {
  plan: EmailPlan;
  index: number;
  selectedPlan: EmailPlan | null;
  onSelectItem: (plan: EmailPlan) => void;
}) => {
  const { t } = useTranslation();
  let nf = new Intl.NumberFormat("en-US");
  const { isAddonAvailable, getAddon } = useContext(SubscriptionContext);

  return (
    <div
      onClick={() => {
        onSelectItem(plan);
      }}
      role="button"
      className={classNames(
        "relative !mb-0 flex h-[76px] cursor-pointer select-none items-center rounded-2xl border p-4 transition-all hover:border-primary hover:bg-primary-50",
        selectedPlan == plan ? "border-primary bg-primary-50" : "border-transparent bg-gray-100"
      )}
      children={
        <div className="flex w-full items-center gap-3 ">
          <Image
            className="h-6 w-6 flex-shrink-0"
            src={`/images/email-plans/plan-${index}.svg`}
            width={24}
            height={24}
            alt="plan"
          />
          <span className="font-semibold">
            {t("email_bundles.interval", {
              interval: nf.format(plan.up_to)
            })}
          </span>
          <span className="mr-auto">
            {isAddonAvailable("emails") && plan.up_to == Number(getAddon("emails")?.limit) ? (
              <div className="w-fit rounded-full bg-black px-4 py-1 text-xs text-white">
                {t("email_bundles.current_plan")}
              </div>
            ) : (
              <Price
                price={plan.price}
                currency={plan.currency}
              />
            )}
          </span>
        </div>
      }
    />
  );
};
export default function EmailBundles() {
  const { t } = useTranslation();
  const [checkoutAnimation, setCheckoutAnimation] = useState(false);
  const router = useRouter();

  let nf = new Intl.NumberFormat("en-US");

  const { data: plans, isLoading } = useFetchEmailPlansQuery({
    locale: router.locale
  });
  const { data: cards, isLoading: cardsLoading } = useFetchCardsQuery();
  const { toggleAddCard } = useContext(StripeContext);
  const [selectedPlan, setSelectedPlan] = useState<null | EmailPlan>(null);
  const [emailPurchase] = usePurchaseEmailBundleMutation();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const { isAddonAvailable, getAddon, subscription } = useContext(SubscriptionContext);
  const { refetchAuth } = useContext(AuthContext);

  const defaultCard = useMemo(() => {
    if (cards && cards.data.length > 0) {
      return cards.data.filter((card) => card.is_default)[0];
    }
  }, [cards, cardsLoading]);

  const endsAt = subscription?.next_payment?.date ?? subscription?.ends_at ?? subscription?.paused_from;
  const form = useForm<any>({
    mode: "all"
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid, isSubmitted }
  } = form;
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setCheckoutAnimation(true);
    const response = (await emailPurchase({
      card_id: defaultCard?.id as string,
      plan_price_id: data.plan.id,
      quantity: data.plan.up_to
    })) as APIActionResponse<EmailPlan>;

    if (displayErrors(response)) return;

    setTimeout(async () => {
      setCheckoutAnimation(false);
      displaySuccess(response);
      await refetchAuth();
      router.push("/marketing/campaigns");
    }, 3000);
  };
  return (
    <>
      <Head>
        <title>{t("email_bundles.title")}</title>
      </Head>
      <div className="my-10 flex min-h-screen items-center justify-center overflow-auto">
        <div className="container mx-auto">
          <Button
            isLoading={isLoading}
            variant={"default"}
            icon={<Icon children={<ArrowRightIcon />} />}
            className="mb-8"
            children={t("back")}
            as={Link}
            href="/marketing/campaigns"
          />
          <div className="flex gap-6">
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <div className="flex w-full flex-col">
                <div className="mb-10 flex w-full flex-col gap-3 lg:mb-0 lg:flex-row lg:gap-6">
                  <div className="w-full flex-shrink-0 lg:w-[448px]">
                    <div className="mb-8 flex flex-col gap-1">
                      <Typography.Paragraph
                        className="text-2xl !font-bold"
                        children={t("email_bundles.plans_title")}
                      />
                      <Typography.Paragraph
                        className="text-gray-900"
                        children={t("email_bundles.next_payment_at", {
                          date: dayjs(endsAt).format("DD/MM/YYYY")
                        })}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-[calc(100%-_-448px)]">
                    {isAddonAvailable("email") && !isEmpty(getAddon("emails")) && (
                      <div className="mb-auto flex gap-4">
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
                            <span className="text-sm !font-normal !text-gray-800">
                              {t("marketing.campaigns.message")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex w-full flex-col gap-6 lg:flex-row"
                >
                  <div className="w-full flex-shrink-0 lg:w-[448px]">
                    <Card>
                      <Card.Body>
                        <div className="flex items-center justify-between">
                          {subscription && (
                            <Typography.Paragraph
                              className="!text-xl !font-semibold"
                              children={t(`email_bundles.${subscription.price.interval}`)}
                            />
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                          {plans?.map((item, index) => (
                            <>
                              {item.up_to == 125000 && (
                                <span className="relative z-[1] -mb-8 w-fit rounded-full rounded-br-none bg-orange px-6 py-1 text-sm text-white">
                                  {t("email_bundles.most_value")}
                                </span>
                              )}
                              <EmailBundleItem
                                onSelectItem={(plan) => {
                                  setSelectedPlan(plan);
                                  setValue("plan", plan, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  });
                                }}
                                selectedPlan={selectedPlan ?? null}
                                index={index + 1}
                                key={item.id}
                                plan={item}
                              />
                            </>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="w-full lg:w-[calc(100%-_-448px)]">
                    <Card>
                      <Card.Body className="!p-6">
                        <Typography.Paragraph
                          className="mb-6 !text-xl !font-semibold"
                          children={t("email_bundles.subscription_details")}
                        />
                        {defaultCard && (
                          <div className="rounded-2xl bg-gray-100 p-4">
                            <div className="flex items-center">
                              <PaymentMethodLogo
                                className=""
                                method={defaultCard?.scheme.toLowerCase()}
                              />
                              <span className="mr-4 font-medium">{defaultCard.last_four}****</span>
                              <Badge
                                className="mr-6"
                                size="sm"
                                color="primary"
                                soft
                                rounded
                                children={t("email_bundles.default_card")}
                              />
                              <Button
                                onClick={() => {
                                  toggleAddCard();
                                }}
                                variant="default"
                                className="mr-auto !bg-primary-50 hover:!bg-primary-100"
                                icon={<Icon children={<PlusIcon />} />}
                              />
                            </div>
                          </div>
                        )}
                        {selectedPlan && (
                          <div className="mt-6">
                            <div className="flex justify-between">
                              <Typography.Paragraph
                                weight="normal"
                                children={t("email_bundles.interval", {
                                  interval: nf.format(selectedPlan.up_to)
                                })}
                              />
                              <div className="mr-auto">
                                <Price
                                  price={selectedPlan.price}
                                  currency={selectedPlan.currency}
                                />
                              </div>
                            </div>
                            <hr className="my-4" />
                            <div className="flex justify-between">
                              <Typography.Paragraph
                                weight="normal"
                                className="!font-semibold"
                                children={t("email_bundles.payment_price")}
                              />
                              <div className="mr-auto">
                                <Price
                                  price={selectedPlan.price}
                                  currency={selectedPlan.currency}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-6 flex w-full">
                          <Button
                            disabled={isSubmitted || isSubmitting || !isValid || !isDirty}
                            className="mr-auto"
                            variant="gradient"
                            children={t("email_bundles.submit")}
                            type="submit"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
      <CheckoutAnimation
        show={checkoutAnimation}
        children={
          <div className="flex flex-col justify-center text-center">
            <Typography.Paragraph
              className="dots-animate font-bold"
              children={t("email_bundles.checkout_animation")}
            />
          </div>
        }
      />
    </>
  );
}
