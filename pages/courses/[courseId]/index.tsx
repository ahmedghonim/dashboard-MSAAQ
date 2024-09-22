import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import EnrollmentCols from "@/columns/enrollments";
import MeetingsCols from "@/columns/meetings";
import { Layout, useShareable } from "@/components";
import ProductDetailsCard from "@/components/cards/ProductDetailsCard";
import ProductStatsCard from "@/components/cards/ProductStatsCard";
import { Datatable } from "@/components/datatable";
import EmptyStateTable from "@/components/datatable/EmptyData";
import { Select } from "@/components/select";
import ProductReviewsSection from "@/components/shared/products/ProductReviewsSection";
import { useAppDispatch, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchChaptersQuery } from "@/store/slices/api/chaptersSlice";
import { useFetchCourseQuery, useFetchCourseStatsQuery } from "@/store/slices/api/coursesSlice";
import { useFetchEnrollmentsQuery } from "@/store/slices/api/enrollmentsSlice";
import { APIResponse, Chapter, Content, Course, CourseStats, CourseStatus, Meeting } from "@/types";

import {
  ChatBubbleBottomCenterTextIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  UserIcon
} from "@heroicons/react/24/outline";

import { Alert, Breadcrumbs, Button, Grid, Table, Typography } from "@msaaqcom/abjad";

type CourseData = Array<Course> & {
  subRows?: CourseData[];
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency, formatPriceWithoutCurrency } = useFormatPrice();
  const {
    query: { courseId }
  } = router;

  const [isTableEmpty, setIsTableEmpty] = useState<boolean>(false);
  const [meetings, setMeetings] = useState<Content<Meeting>[] | undefined>(undefined);
  const [selectedChapter, setSelectedChapter] = useState<number | undefined>(undefined);

  const share = useShareable();
  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);
  const { data: chapters = {} as APIResponse<Chapter> } = useFetchChaptersQuery(courseId as string, {
    refetchOnMountOrArgChange: true
  });
  const { data: courseStats = {} as CourseStats, isLoading } = useFetchCourseStatsQuery(courseId as string);

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  useEffect(() => {
    if (!chapters.data?.length) {
      return;
    }

    setMeetings(
      chapters.data
        .filter((chapter) => (selectedChapter ? chapter.id == selectedChapter : true))
        .flatMap((chapter) => chapter.contents)
        .filter((content) => content.type === "meeting") as Content<Meeting>[]
    );
  }, [chapters.data, selectedChapter]);

  return (
    <Layout title={course?.title}>
      <Layout.Container>
        <div className="mb-2 flex items-center justify-between pb-4">
          <Breadcrumbs className="overflow-y-hidden overflow-x-scroll whitespace-nowrap">
            <Link href="/">
              <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
            </Link>
            <Link href="/courses">
              <Typography.Paragraph as="span">{t("courses.title")}</Typography.Paragraph>
            </Link>
            <Typography.Paragraph
              as="span"
              className="text-gray-800"
            >
              {course?.title}
            </Typography.Paragraph>
          </Breadcrumbs>

          <Button
            isLoading={isLoading}
            as={Link}
            href={{
              pathname: course.type == "online" ? "/courses/[courseId]/chapters" : "/courses/[courseId]/details",
              query: { courseId }
            }}
            variant="primary"
            children={t("courses.edit_course")}
          />
        </div>

        <Alert
          variant="default"
          dismissible
          className="mb-8"
          children={t("courses.alerts.welcome")}
        />

        <Grid
          columns={{
            lg: 3
          }}
        >
          <Grid.Cell
            columnSpan={{
              lg: 2
            }}
          >
            {[CourseStatus.PUBLISHED, CourseStatus.SCHEDULED].includes(course.status) &&
              dayjs(course.publish_at ?? course.updated_at).isToday() && (
                <Alert
                  variant="info"
                  dismissible
                  actions={
                    <div className="flex items-center">
                      <Button
                        as="a"
                        target="_blank"
                        href="https://msaaq.com/marketing-for-course-creators/"
                        variant={"info"}
                        size="sm"
                        className={"ltr:mr-2 rtl:ml-2"}
                        children={t("read_this_guide")}
                      />
                      <Typography.Paragraph
                        size="md"
                        weight="normal"
                        children={t("learn_how_you_can_market_edu_content")}
                      />
                    </div>
                  }
                  className="mb-6 !border-gray !bg-white"
                  title={t("courses.alerts.how_to_market.title")}
                  children={t("courses.alerts.how_to_market.content")}
                />
              )}

            <div className="mb-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  children={t("contents.meeting.plural_title")}
                />

                <div>
                  <Select
                    isClearable
                    className="min-w-[198px]"
                    placeholder={t("courses.chapters.select_to_filter_content")}
                    options={chapters.data?.map((item) => ({
                      label: item.title,
                      value: item.id
                    }))}
                    onChange={(selected) => {
                      setSelectedChapter(selected?.value ?? undefined);
                    }}
                  />
                </div>
              </div>

              <Table
                data={meetings ?? []}
                columns={MeetingsCols}
                selectable={false}
                hasPagination={false}
                messages={{
                  emptyState: (
                    <EmptyStateTable
                      title={t("empty_state.no_data_title")}
                      content={t("empty_state.no_data_description")}
                      icon={<CircleStackIcon />}
                    />
                  )
                }}
              />
            </div>

            <ProductReviewsSection
              filters={{
                course_id: courseId as string,
                has_replies: 0
              }}
              productId={courseId as string}
              basePath="courses"
            />

            <div className="mt-8 flex flex-col">
              <div className="flex flex-row items-center justify-between">
                <Typography.Paragraph
                  as="span"
                  weight="medium"
                  size="md"
                  className="mb-2"
                  children={t("enrollments.enrolled_student")}
                />

                {isTableEmpty && (
                  <Button
                    as={Link}
                    href={`/courses/${course.id}/enrollments`}
                    variant="link"
                    size="sm"
                    children={t("enrollments.view_all_students")}
                  />
                )}
              </div>
              <Datatable
                selectable={false}
                hasPagination={false}
                setIsTableEmpty={setIsTableEmpty}
                fetcher={useFetchEnrollmentsQuery}
                params={{
                  filters: {
                    course_id: courseId as string
                  }
                }}
                columns={{
                  columns: EnrollmentCols,
                  props: {
                    sortables: [],
                    showRowActions: false
                  }
                }}
                emptyState={
                  <EmptyStateTable
                    icon={<StarIcon />}
                    content={t("courses.empty.enrollments")}
                  >
                    <Button
                      variant="default"
                      outline
                      onClick={() => {
                        share([
                          {
                            label: t("courses.course_landing_page_url"),
                            url: course?.url
                          },
                          {
                            label: t("courses.course_direct_checkout_url"),
                            url: course?.checkout_url
                          }
                        ]);
                      }}
                      children={t("courses.do_share")}
                    />
                  </EmptyStateTable>
                }
              />
            </div>
          </Grid.Cell>
          <Grid.Cell
            columnSpan={{
              lg: 1
            }}
          >
            <ProductDetailsCard
              product={course}
              items={[
                {
                  icon: <UserIcon />,
                  title: course.instructors?.[0]?.name,
                  subtitle: t("courses.instructor")
                }
              ]}
            />
            <ProductStatsCard
              className="mt-4"
              stats={courseStats}
              statsItems={[
                {
                  icon: <CurrencyDollarIcon />,
                  title: t("earnings"),
                  data: {
                    key: formatCurrency(),
                    value: formatPriceWithoutCurrency(course.earnings)
                  }
                },
                {
                  icon: <UserGroupIcon />,
                  title: t("the_students"),
                  data: {
                    key: t("student"),
                    value: courseStats?.students?.enrolled
                  }
                },
                {
                  icon: <ChatBubbleBottomCenterTextIcon />,
                  title: t("comments"),
                  data: {
                    key: t("comment"),
                    value: courseStats?.comments
                  }
                },
                {
                  icon: <StarIcon />,
                  title: t("reviews"),
                  data: {
                    key: t("review"),
                    value: courseStats?.reviews
                  }
                }
              ]}
            />
          </Grid.Cell>
        </Grid>
      </Layout.Container>
    </Layout>
  );
}
