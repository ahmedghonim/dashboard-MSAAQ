import React from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import MemberOrdersCols from "@/columns/memberOrders";
import { Card, Datatable, EmptyStateTable } from "@/components";
import StudentsBaseLayout from "@/components/shared/students/StudentsBaseLayout";
import { useFormatPrice } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchMemberQuery } from "@/store/slices/api/membersSlice";
import { useFetchOrdersQuery } from "@/store/slices/api/ordersSlice";
import { Member } from "@/types";

import { InboxStackIcon } from "@heroicons/react/24/outline";

import { Form, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Orders() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPriceWithoutCurrency, currentCurrency } = useFormatPrice();

  const {
    query: { memberId }
  } = router;

  const { data: member = {} as Member } = useFetchMemberQuery(memberId as string);

  return (
    <StudentsBaseLayout>
      <Form.Section>
        <div className="mb-6 flex flex-col space-y-2">
          <Typography.Paragraph
            size="md"
            weight="medium"
            as="span"
          >
            رصيد الطالب في المحفظة
          </Typography.Paragraph>
          <Card>
            <Card.Body>
              <Typography.Subtitle
                as="span"
                size="lg"
                weight="bold"
              >
                {formatPriceWithoutCurrency(member?.balance)}
              </Typography.Subtitle>
              <Typography.Subtitle
                as="span"
                size="md"
                weight="medium"
                className="text-gray-700"
              >
                {currentCurrency}
              </Typography.Subtitle>
            </Card.Body>
          </Card>
        </div>
        <Datatable
          selectable={false}
          columns={{
            columns: MemberOrdersCols
          }}
          fetcher={useFetchOrdersQuery}
          hasSearch={true}
          params={{
            filters: {
              member_id: memberId
            }
          }}
          emptyState={
            <EmptyStateTable
              title={t("لا توجد طلبات لدى الطالب حتى الآن. ابذل مجهودًا أكبر في ترويج منتجاتك له.")}
              icon={<InboxStackIcon />}
            />
          }
        />
      </Form.Section>
    </StudentsBaseLayout>
  );
}
