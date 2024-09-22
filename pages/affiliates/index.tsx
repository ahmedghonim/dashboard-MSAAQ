import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout, Price } from "@/components";
import AffiliatesIndexTabs from "@/components/shared/affiliates/AffiliatesIndexTabs";
import { useCopyToClipboard } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchAffiliatesSettingsQuery } from "@/store/slices/api/msaaq-affiliates/affiliateSettingsSlice";
import { MsaaqAffiliateSettings } from "@/types/models/msaaqAffiliateSettings";

import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Title, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Settings({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  const [copy, values] = useCopyToClipboard();

  const {
    data: affiliateSettings = {
      setting: { payouts_min_amount: 10 },
      balance: {
        available_balance: 0
      }
    } as MsaaqAffiliateSettings,
    isLoading
  } = useFetchAffiliatesSettingsQuery();

  const LoadingCard = () => {
    return (
      <Card className="mx-auto mb-6 h-[400px]">
        <Card.Body className=" animate-pulse">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-14 w-1/4 rounded bg-gray"></div>
              <div className="h-14 w-full rounded bg-gray"></div>
              <div className="h-14 w-full rounded bg-gray"></div>
            </div>
            <div className="h-20 w-full rounded bg-gray"></div>
            <div className="flex items-center gap-5">
              <div className="h-14 w-full rounded bg-gray"></div>
              <div className="h-14 w-full rounded bg-gray"></div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Layout title={t("affiliates.affiliates")}>
      <AffiliatesIndexTabs />
      <Layout.Container>
        <div className="mx-auto mb-6 w-[768px]">
          {isLoading ? (
            <LoadingCard />
          ) : (
            <>
              <Typography.Paragraph
                as="span"
                size="md"
                weight="medium"
                className="mb-2"
                children={t("affiliates.order_details")}
              />
              <Card>
                <Card.Body className="">
                  <div className="mb-6 grid grid-cols-12 gap-4">
                    <Card className="col-span-6">
                      <Card.Body className="flex flex-col">
                        <Typography.Paragraph
                          size="lg"
                          weight="bold"
                          children={`${affiliateSettings?.setting?.commission ?? 0}%`}
                        />

                        <Typography.Paragraph
                          size="sm"
                          children={t("affiliates.your_commission")}
                          className="text-gray-800"
                        />
                      </Card.Body>
                    </Card>

                    <Card className="col-span-6">
                      <Card.Body className="flex items-center justify-between">
                        <Title
                          title={
                            <>
                              <span className="flex gap-2">
                                <Typography.Paragraph
                                  as="span"
                                  weight="medium"
                                  size="md"
                                  children={
                                    <Price
                                      price={affiliateSettings?.balance?.available_balance ?? 0}
                                      currency={"USD"}
                                    />
                                  }
                                />
                                <Tooltip>
                                  <Tooltip.Trigger>
                                    <Icon>
                                      <ExclamationCircleIcon className="text-gray-600" />
                                    </Icon>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>{t("affiliates.max_payout_amount")}</Tooltip.Content>
                                </Tooltip>
                              </span>
                            </>
                          }
                          subtitle={
                            <>
                              <span className="flex gap-x-1">
                                <Typography.Paragraph
                                  as="span"
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-800"
                                  children={t("affiliates.available_balance")}
                                />
                              </span>
                            </>
                          }
                        />
                      </Card.Body>
                    </Card>
                  </div>
                  <Card className="bg-gray-100">
                    <Card.Body>
                      <Form.Group
                        className="mb-0"
                        label={t("affiliates.your_affiliate_url")}
                      >
                        <Form.Input
                          readOnly
                          value={affiliateSettings?.referral_link}
                          dir="ltr"
                          append={
                            <Button
                              ghost
                              variant="default"
                              onClick={() => copy(affiliateSettings?.referral_link ?? "")}
                              icon={
                                !values.includes(affiliateSettings?.referral_link ?? "") ? (
                                  <Icon
                                    size="sm"
                                    children={<ClipboardDocumentIcon />}
                                  />
                                ) : (
                                  <Icon
                                    size="sm"
                                    className="text-success"
                                    children={<ClipboardDocumentCheckIcon />}
                                  />
                                )
                              }
                            />
                          }
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                  <div className="my-6 border-t" />
                  <Typography.Paragraph
                    className="mb-6"
                    weight="medium"
                    size="lg"
                    children={t("affiliates.analytics")}
                  />
                  <div className="flex ">
                    <Title
                      className="w-full "
                      reverse
                      title={affiliateSettings?.stats?.referrals ?? 0}
                      subtitle={
                        <>
                          <Typography.Paragraph
                            size="sm"
                            className="text-gray-800"
                            children={t("affiliates.referrals_trial_period")}
                          />
                          <Icon
                            size="md"
                            className="mb-6"
                            children={<LinkIcon />}
                          />
                        </>
                      }
                    />
                    <Title
                      className="w-full border-r pr-4"
                      reverse
                      title={affiliateSettings?.stats?.subscribed_referrals ?? 0}
                      subtitle={
                        <>
                          <Typography.Paragraph
                            size="sm"
                            className="text-gray-800"
                            children={t("affiliates.number_of_subscribers")}
                          />
                          <Icon
                            size="md"
                            className="mb-6"
                            children={<CheckCircleIcon />}
                          />
                        </>
                      }
                    />
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </Layout.Container>
    </Layout>
  );
}
