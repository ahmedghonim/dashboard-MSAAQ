import { useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Card, Datatable, Layout, Price } from "@/components";
import FilterGroup from "@/components/filter-group";
import SessionsTabs from "@/components/shared/products/CoachingSessionIndexTabs";
import { durationParser } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchAppointmentsQuery } from "@/store/slices/api/appointmentsSlice";
import { Appointment } from "@/types/models/appointment";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  CreditCardIcon,
  InboxArrowDownIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { LinkIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

const CoachingCard = ({ item }: { item: Appointment }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
              <Icon className="h-4 w-4">
                <CalendarIcon className="text-primary" />
              </Icon>
            </span>
            <Typography.Paragraph children={dayjs(item.start_at).format("dddd، DD MMM، YYYY")} />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
              <Icon className="h-4 w-4">
                <ClockIcon className="text-primary" />
              </Icon>
            </span>
            <Typography.Paragraph
              children={
                <span className="flex items-center gap-2">
                  <span>{dayjs(item.start_at).format("HH:mm")}</span>
                  <Icon className="h-4 w-4">
                    <ChevronLeftIcon />
                  </Icon>
                  <span>{dayjs(item.end_at).format("HH:mm")}</span>
                </span>
              }
            />
          </div>
          {item.product.price > 0 ? (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
                <Icon className="h-4 w-4">
                  <CreditCardIcon className="text-primary" />
                </Icon>
              </span>
              <Price price={item.product.price} />
            </div>
          ) : (
            <Badge
              className="mr-auto"
              variant="success"
              soft
              rounded
              children={t("coaching_sessions.session_free")}
            />
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Typography.Paragraph
          className="mb-3"
          children={
            <span className="flex gap-3">
              <span className="text-primary">
                {t("coaching_sessions.session_duration", {
                  duration: durationParser(Number(item.product.options.duration), "minute")
                })}
              </span>
              <span>•</span>
              <span className="text-primary">{item.user.name}</span>
            </span>
          }
          size="md"
          weight="medium"
        />
        <Typography.Paragraph
          children={item.product.title}
          size="lg"
          weight="medium"
          className="mb-3 truncate"
        />
        <Typography.Paragraph
          children={t("coaching_sessions.appointment_details")}
          size="md"
          weight="medium"
          className="mb-4 text-gray-700"
        />
        <div className="flex ">
          <div className="flex w-full items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
              <Icon className="h-4 w-4">
                <UserIcon className="text-primary" />
              </Icon>
            </span>
            <Typography.Paragraph children={item.member.name} />
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50">
              <Icon className="h-4 w-4">
                <InboxArrowDownIcon className="text-primary" />
              </Icon>
            </span>
            <Typography.Paragraph children={item.member.email} />
          </div>
        </div>
      </Card.Body>
      <div className="border-t p-4">
        <Button
          as={Link}
          target="_blank"
          href={item.join_url}
          icon={
            <Icon size="md">
              <LinkIcon />
            </Icon>
          }
          children={t("coaching_sessions.show_session")}
        />
      </div>
    </Card>
  );
};
export default function Index() {
  const { t } = useTranslation();
  const categories: string[] = ["all", "upcoming", "past"];
  const [filter, setFilter] = useState<string>("upcoming");

  const onFilter = (value: string) => {
    setFilter(value);
  };

  return (
    <Layout>
      <Head>
        <title>{t("coaching_sessions.title")}</title>
      </Head>

      <SessionsTabs />
      <Layout.Container>
        <div className="mb-4">
          <FilterGroup
            current_value={filter}
            filters={categories.map((category) => ({
              key: category,
              title: t(`coaching_sessions.filters.${category}`),
              actions: {
                onClick: () => {
                  onFilter(category);
                }
              }
            }))}
          />
        </div>
        <AddonController addon="products-sessions">
          <div className="grid-table appointments-table">
            <Datatable
              selectable={false}
              fetcher={useFetchAppointmentsQuery}
              className="w-full"
              params={{
                ...(filter !== "all" && {
                  filters: filter === "past" ? { past: "" } : { upcoming: "" }
                }),
                per_page: 12
              }}
              columns={{
                columns: () => [
                  {
                    id: "card",
                    Cell: ({ row: { original } }: any) => <CoachingCard item={original} />
                  }
                ]
              }}
            />
          </div>
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
