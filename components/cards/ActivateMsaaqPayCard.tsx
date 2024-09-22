import { FC, ReactNode, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import isEqual from "lodash/isEqual";
import { useTranslation } from "next-i18next";

import { Card, SuccessModal } from "@/components";
import CancelMsaaqPayModal from "@/components/modals/CancelMsaaqPayModal";
import { GTM_EVENTS, useAppDispatch, useAppSelector, useGTM, useResponseToastHandler } from "@/hooks";
import { useInstallAppMutation } from "@/store/slices/api/appsSlice";
import { AppSliceStateType, fetchInstalledApps } from "@/store/slices/app-slice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { APIActionResponse, App } from "@/types";
import { classNames } from "@/utils";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Title, Typography } from "@msaaqcom/abjad";

interface ActivateMsaaqPayCardProps {
  showInPricingForm?: boolean;
  hideImage?: boolean;
  canCancel?: boolean;
  className?: string;
  prepend?: ReactNode;
}

const ActivateMsaaqPayCard: FC<ActivateMsaaqPayCardProps> = ({
  showInPricingForm,
  canCancel = true,
  className,
  hideImage = false,
  prepend
}) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { msaaqpay } = useAppSelector<AppSliceStateType>((state) => state.app, isEqual);

  const {
    current_academy: { is_verified }
  } = useAppSelector<AuthSliceStateType>((state) => state.auth);

  const [showMsaaqPayActivatedModal, setShowMsaaqPayActivatedModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const [installAppMutation] = useInstallAppMutation();
  const { displayErrors } = useResponseToastHandler({});

  const { sendGTMEvent } = useGTM();

  const installPaymentApp = async () => {
    if (!msaaqpay) {
      return;
    }
    const installed = (await installAppMutation({
      id: msaaqpay.id
    })) as APIActionResponse<App>;

    if (displayErrors(installed)) {
      return;
    }

    sendGTMEvent(GTM_EVENTS.MSAAQ_PAY_ACTIVATED);
    setIsLoading(false);
    setShowMsaaqPayActivatedModal(true);
  };
  const refetch = (redirect: boolean) => {
    setShowMsaaqPayActivatedModal(false);
    dispatch(fetchInstalledApps());
    if (redirect) router.push("/msaaq-pay");
  };
  return (
    <>
      <Card className={classNames("mb-6 w-full", className)}>
        {prepend && prepend}
        <Card.Body className="flex justify-between">
          <div>
            <div className="flex gap-4 pb-8 pt-4">
              <div className="flex items-center rounded border border-black/5 bg-gray-200 p-2">
                <Image
                  src={"/images/msaaq-pay-logo.svg"}
                  alt={"pay-with-msaaq-pay"}
                  width={64.25}
                  height={24}
                />
              </div>
              <Title
                title={t("msaaq_pay.title")}
                subtitle={t("msaaq_pay.slogan")}
              />
            </div>
            <ul className="space-y-2">
              {(t("msaaq_pay.features", { returnObjects: true }) as string[] | undefined | null)?.map(
                (feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <Icon
                      size="sm"
                      className="text-secondary"
                      children={<CheckCircleIcon />}
                    />
                    <Typography.Paragraph children={feature} />
                  </li>
                )
              )}
            </ul>
            <div className="flex items-center px-2 py-8">
              <Image
                src="https://cdn.msaaq.com/assets/images/payments/visa-master.svg"
                alt={"master"}
                width={70}
                height={70}
                className="ml-2"
              />
              <Image
                src="https://cdn.msaaq.com/assets/images/payments/mada.svg"
                alt={"mada"}
                width={70}
                height={70}
                className="ml-2"
              />
              <Image
                src="https://cdn.msaaq.com/assets/images/payments/applepay.svg"
                alt={"applepay"}
                width={60}
                height={60}
                className="ml-2"
              />
              <Image
                src="https://cdn.msaaq.com/assets/images/payments/googlepay.svg"
                alt={"googlepay"}
                width={60}
                height={60}
              />
            </div>
          </div>
          {!hideImage && (
            <div
              style={{ maxWidth: "100%", height: "auto" }}
              className="p-7"
            >
              <Image
                src={"/images/msaaq-pay-dashboadrd.svg"}
                alt={"pay-with-msaaq-pay"}
                width={0}
                height={0}
                style={{
                  width: "354px"
                }}
              />
            </div>
          )}
        </Card.Body>
        <Card.Actions>
          {msaaqpay && !msaaqpay.installed ? (
            <>
              <Button
                as={!showInPricingForm ? "button" : Link}
                href={!showInPricingForm ? undefined : "/settings/payment-gateways"}
                disabled={(!showInPricingForm && !is_verified) || isLoading}
                size="lg"
                children={t("msaaq_pay.banner.activate_now")}
                isLoading={isLoading}
                onClick={
                  showInPricingForm
                    ? undefined
                    : () => {
                        setIsLoading(true);
                        installPaymentApp();
                      }
                }
              />
              {showInPricingForm && (
                <Button
                  as={Link}
                  href="/settings/payment-gateways"
                  variant="dismiss"
                  size="lg"
                  children={t("msaaq_pay.banner.discover_other_available_payment_gateways")}
                />
              )}
            </>
          ) : (
            <>
              <div className="flex gap-x-2">
                <Button
                  disabled={!is_verified}
                  as={!is_verified ? "button" : Link}
                  href={!is_verified ? undefined : "/msaaq-pay"}
                  size="lg"
                  children={t("msaaq_pay.banner.manage")}
                />
                {canCancel && (
                  <Button
                    disabled={!is_verified}
                    size="lg"
                    ghost
                    variant="danger"
                    children={t("msaaq_pay.banner.cancel")}
                    onClick={() => setShowCancelModal(true)}
                  />
                )}
              </div>
            </>
          )}
        </Card.Actions>
      </Card>
      <CancelMsaaqPayModal
        open={showCancelModal}
        onDismiss={() => setShowCancelModal(false)}
      />
      <SuccessModal
        open={showMsaaqPayActivatedModal}
        onDismiss={() => {
          refetch(true);
        }}
        title={t("msaaq_pay.success_activation.title")}
        description={t("msaaq_pay.success_activation.description")}
        buttons={
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                refetch(true);
              }}
              size="lg"
              children={t("msaaq_pay.banner.manage")}
            />
            <Button
              variant="default"
              size="lg"
              children={t("msaaq_pay.success_activation.cancel")}
              onClick={() => {
                refetch(false);
              }}
            />
          </div>
        }
      />
    </>
  );
};

export default ActivateMsaaqPayCard;
