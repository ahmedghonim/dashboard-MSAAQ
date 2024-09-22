import { FC, ReactNode, useContext, useEffect } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { setCookie } from "cookies-next";
import { useTranslation } from "next-i18next";

import { Header, Sidenav } from "@/components";
import { AuthContext, SubscriptionContext } from "@/contextes";
import { PhoneVerificationContext } from "@/contextes/PhoneVerificationContext";
import { StripeContext } from "@/contextes/StripeContext";
import { isCustomizedDomain, useAppDispatch, useAppSelector } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { AddPaymentMethodButton } from "@/pages/settings/billing/payment-methods";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { classNames } from "@/utils";

import { Alert, Button, Typography } from "@msaaqcom/abjad";

import Container from "./Container";
import { FormGrid } from "./form-grid";

interface LayoutProps {
  children: ReactNode;
  parentClassName?: string;
  className?: string;
  hasHeader?: boolean;
  title?: string;
}

const Layout: FC<LayoutProps> = ({ children, parentClassName, title: providedTitle, hasHeader = true, ...props }) => {
  const { showPaymentMethodAlert, handleIncompletePayment } = useContext(StripeContext);
  const { incompletePayment } = useContext(SubscriptionContext);
  const { openOTPModal } = useContext(PhoneVerificationContext);
  const { current_academy } = useContext(AuthContext);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector<AuthSliceStateType>((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    Object.keys(router.query).forEach((key) => {
      if (key.startsWith("utm_")) {
        setCookie(key, router.query[key]);
      }
      if (key == "coupon") {
        setCookie(key, router.query[key], {
          maxAge: 864000
        });
      }
    });
  }, [router]);

  useEffect(() => {
    if (providedTitle) {
      dispatch({ type: "app/setHeaderTitle", payload: providedTitle ?? "" });
    }
  }, [providedTitle]);

  return (
    <>
      <Head>
        <title>
          {t("page_title", {
            title: providedTitle,
            tenant: isCustomizedDomain() ? current_academy.title : t("app_name")
          })}
        </title>
      </Head>
      <div className={classNames(parentClassName)}>
        <style
          global
          jsx
        >
          {`
            :root {
              --badge-text: "${t("new")}";
            }
          `}
        </style>
        <Sidenav />
        <div className={classNames("flex flex-1 flex-col", "md:ltr:pl-52 md:rtl:pr-52 print:md:rtl:pr-0")}>
          {hasHeader && <Header title={providedTitle} />}

          {auth.user &&
            !auth.user.phone_verified &&
            7 - dayjs().diff(dayjs(auth?.user?.phone_verification_checkpoint), "day") > 0 && (
              <Container>
                <Alert
                  variant="warning"
                  className="w-full [&>.flex]:w-full"
                  title={
                    <span className="flex w-full items-center">
                      <span>
                        {t("otp.change_phone_number_description", {
                          day: 7 - dayjs().diff(dayjs(auth?.user?.phone_verification_checkpoint), "day")
                        })}
                      </span>
                      <Button
                        className="mr-auto"
                        variant="warning"
                        onClick={openOTPModal}
                      >
                        {t("otp.change_phone_number")}
                      </Button>
                    </span>
                  }
                />
              </Container>
            )}

          {showPaymentMethodAlert && (
            <Container className="!pb-4">
              <Alert
                variant="info"
                title={"تنويه هام: تحديث تجربة دفع اشتراك مساق!"}
              >
                <Typography.Paragraph>
                  نحن نطور تجربة وطرق الدفع لدينا لتكون أكثر سلاسة وسهولة. يجب تحديث بيانات الدفع الخاصة بك* حتى يبقى
                  اشتراكك فعالًا.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <strong>*ملاحظة:</strong>
                  لن يتم خصم أي مبالغ عند التحديث.
                </Typography.Paragraph>

                <div className="mt-4">
                  <AddPaymentMethodButton
                    variant="info"
                    children={"حدّث بياناتي الآن"}
                  />
                </div>
              </Alert>
            </Container>
          )}

          {incompletePayment && (
            <Container>
              <Alert
                variant="warning"
                title={t(`billing.subscriptions.alerts.past_due.title`)}
                children={t(`billing.subscriptions.alerts.past_due.description`)}
                actions={
                  <Button
                    children={t("billing.plans.pay_now")}
                    variant={"warning"}
                    onClick={() => handleIncompletePayment(incompletePayment)}
                  />
                }
              />
            </Container>
          )}

          <main
            {...props}
            children={children}
          />
        </div>
      </div>
    </>
  );
};

type LayoutComponent<P = {}> = FC<P> & {
  Container: typeof Container;
  FormGrid: typeof FormGrid;
};
export default Layout as LayoutComponent<LayoutProps>;
