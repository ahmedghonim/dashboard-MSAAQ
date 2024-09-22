import { createElement } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { ErrorBoundary } from "@sentry/nextjs";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Time } from "@/components";
import StudentsBaseLayout from "@/components/shared/students/StudentsBaseLayout";
import { useFormatPrice } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchFormQuery } from "@/store/slices/api/formsSlice";
import { useFetchMemberQuery } from "@/store/slices/api/membersSlice";
import { Member } from "@/types";

import {
  AcademicCapIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  FingerPrintIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  PuzzlePieceIcon,
  StarIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";

import { Badge, Icon, Title, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatPrice } = useFormatPrice();
  const { data: fetchForm, isLoading } = useFetchFormQuery("complete_profile");

  const {
    query: { memberId }
  } = router;

  const { data: member = {} as Member, isLoading: isLoadingMember } = useFetchMemberQuery(memberId as string);
  const completeProfileFields = Object.keys(member?.meta?.complete_profile || {});

  const convertPhoneCode = (phoneCode: any) => {
    return `+${phoneCode.phone_code} ${phoneCode.phone}`;
  };

  const cards = Array.from({ length: Math.ceil(completeProfileFields.length / 3) }, (_, index) => {
    const startIndex = index * 3;
    const endIndex = startIndex + 3;
    const fieldsSubset = completeProfileFields.slice(startIndex, endIndex);
    const formField = (fieldName: string) => {
      return fetchForm?.data?.fields.find((formField) => formField.name == fieldName);
    };

    return (
      <Card
        key={index}
        className="mb-2"
      >
        <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
          {fieldsSubset.map((key) => (
            <div key={key}>
              <Icon children={<DocumentTextIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={formField(key)?.label ?? key}
                />
                {typeof member.meta.complete_profile[key] === "object" ? (
                  <Typography.Paragraph
                    weight="medium"
                    className="text-end"
                    dir={formField(key)?.type == "phone" ? "ltr" : "rtl"}
                  >
                    {member.meta.complete_profile[key] ? convertPhoneCode(member.meta.complete_profile[key]) : "—"}
                  </Typography.Paragraph>
                ) : (
                  <Typography.Paragraph weight="medium">
                    {member.meta.complete_profile[key] ?? "—"}
                  </Typography.Paragraph>
                )}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    );
  });

  const SegmentsOfMember = member.segments?.map((segment) => {
    return (
      <div
        key={segment.id}
        className="flex gap-4 py-1.5"
      >
        <div className="rounded-full bg-black p-1">
          <Icon className="h-4 w-4 text-white">
            <ErrorBoundary fallback={<XCircleIcon className="h-6 w-6 text-white" />}>
              {createElement(require("@heroicons/react/24/solid")[segment.icon])}
            </ErrorBoundary>
          </Icon>
        </div>
        <Typography.Paragraph
          as="span"
          size="lg"
          weight="normal"
        >
          {segment.name}
        </Typography.Paragraph>
      </div>
    );
  });

  return (
    <StudentsBaseLayout>
      <div className="flex flex-col">
        <Card
          className="mb-4"
          label={t("students_flow.account_information")}
        >
          <Card.Body className="card-divide-x grid grid-cols-4">
            <div>
              <Icon children={<BanknotesIcon />} />
              <div className="mt-6 flex flex-col">
                <Title
                  reverse
                  title={member?.total_purchases ? formatPrice(member?.total_purchases ?? 0) : "—"}
                  subtitle={t("students_flow.total_purchases")}
                />
              </div>
            </div>
            <div>
              <Icon children={<VideoCameraIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("students_flow.purchased_products")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={
                    member?.products_count || member?.courses_count
                      ? t("courses_count_and_products_count", {
                          products_count: member?.products_count,
                          courses_count: member?.courses_count
                        })
                      : "—"
                  }
                />
              </div>
            </div>
            <div>
              <Icon children={<CalendarIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("students_flow.joined_at")}
                />
                <div className="flex items-center justify-between">
                  <Time
                    date={member.created_at}
                    format={"D MMMM YYYY"}
                  />

                  {member.is_verified && (
                    <Badge
                      soft
                      variant="success"
                      rounded
                      size="xs"
                    >
                      {t("students_flow.active")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Icon children={<EyeIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("students_flow.last_seen")}
                />
                {member.last_seen_at ? (
                  <Time
                    date={member.last_seen_at}
                    format={"D MMMM YYYY"}
                  />
                ) : (
                  "—"
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card
          className="mb-2"
          label={t("students_flow.personal_information")}
        >
          <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
            <div>
              <Icon children={<PhoneIcon />} />
              <div className="mt-6 flex flex-col items-start">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("phone")}
                />
                <Typography.Paragraph
                  weight="medium"
                  dir="ltr"
                  classID="text-start"
                  children={member.phone ? `+${member.phone_code} ${member.phone}` : "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<MapPinIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("country")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.country_code ? member.country_code : "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<IdentificationIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("national_id")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.national_id ?? "—"}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2">
          <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
            <div>
              <Icon children={<FingerPrintIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("gender")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.gender ? t(member.gender) : "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<CalendarDaysIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("dob")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.dob ?? "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<IdentificationIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("username")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.username ?? "—"}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2">
          <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
            <div>
              <Icon children={<BuildingOfficeIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("job_title")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.job_title ?? "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<StarIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("bio")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.bio ?? "—"}
                />
              </div>
            </div>
            <div>
              <Icon children={<AcademicCapIcon />} />
              <div className="mt-6 flex flex-col">
                <Typography.Paragraph
                  size="sm"
                  weight="normal"
                  children={t("education")}
                />
                <Typography.Paragraph
                  weight="medium"
                  children={member.education ? t(member.education) : "—"}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
        {!isLoadingMember ? (
          <Card className="mb-2">
            <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
              <div>
                <Icon children={<PuzzlePieceIcon />} />
                <div className="mt-6 flex flex-col">
                  <Typography.Paragraph
                    size="sm"
                    className="pb-1"
                    weight="normal"
                    children={t("students_flow.segments.member_in")}
                  />
                  {SegmentsOfMember.length > 0 ? (
                    SegmentsOfMember
                  ) : (
                    <Title
                      reverse
                      title={"—"}
                    />
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card className="mb-2">
            <Card.Body className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-300 [&>:not(:first-child)]:px-4">
              <div>
                <Icon children={<PuzzlePieceIcon />} />
                <div className="mt-6 flex flex-col">
                  <Typography.Paragraph
                    size="sm"
                    weight="normal"
                    className="pb-1"
                    children={t("students_flow.segments.member_in")}
                  />{" "}
                  <div className="flex w-full flex-col gap-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7  animate-pulse rounded-full bg-gray-300"></div>
                      <div className="h-5 w-20 animate-pulse rounded-2xl bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
        {!isLoading && member?.meta?.complete_profile && cards}
      </div>
    </StudentsBaseLayout>
  );
}
