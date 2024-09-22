import React from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { CellProps } from "@/columns";
import { Card, Datatable, Time } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import EmptyData from "@/components/datatable/EmptyData";
import StudentProduct from "@/components/shared/students/StudentProduct";
import StudentsBaseLayout from "@/components/shared/students/StudentsBaseLayout";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useFetchEnrollmentsQuery } from "@/store/slices/api/enrollmentsSlice";
import { useFetchMemberQuery } from "@/store/slices/api/membersSlice";
import { APIActionResponse, APIResponse, Course, Enrollment, Member } from "@/types";

import {
  ArrowTrendingUpIcon,
  BookmarkSquareIcon,
  CalendarIcon,
  CheckCircleIcon,
  InboxStackIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

import { Form, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Courses() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const {
    query: { memberId }
  } = router;

  const { data: member = {} as Member } = useFetchMemberQuery(memberId as string);

  const removeProductAccessHandler = async (course: Course) => {
    if (
      !(await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("undo"),
        title: t("students_flow.remove_access_to_course"),
        enableConfirmCheckbox: false,
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("students_flow.remove_access_to_course_description")}
          />
        )
      }))
    ) {
      return;
    }

    const response = (await axios.post(`/members/${member.id}/remove-access`, {
      products: [{ id: course.id, type: "course" }]
    })) as APIActionResponse<any>;

    if (displayErrors(response)) return;

    displaySuccess(response);

    await dispatch(
      apiSlice.util.invalidateTags([
        "enrollments.index",
        {
          type: "members.index",
          id: member.id
        }
      ])
    );
  };
  return (
    <StudentsBaseLayout>
      <Form.Section>
        <div className="flex flex-col">
          <Typography.Paragraph
            weight="medium"
            size="md"
            children={t("courses.name")}
            className="mb-2"
          />
          <div className="enrollments-table">
            <Datatable
              selectable={false}
              fetcher={useFetchEnrollmentsQuery}
              className="w-full"
              params={{
                filters: {
                  member_id: memberId as string
                },
                only_with: ["course"],
                sortDirection: "desc"
              }}
              columns={{
                columns: () => [
                  {
                    id: "card",
                    Cell: ({ row: { original: enrollment } }: CellProps<Enrollment>) => (
                      <div className="flex !w-full flex-col space-y-6">
                        <Card key={enrollment.id}>
                          <Card.Body className="divide-y divide-gray-300 [&>:first-child]:pb-6">
                            <StudentProduct
                              removeProductAccessHandler={() =>
                                removeProductAccessHandler({
                                  ...enrollment.course,
                                  id: enrollment.id
                                })
                              }
                              product={enrollment.course}
                              enrollment_at={enrollment.created_at}
                            >
                              <div className="grid grid-cols-4 divide-x divide-x-reverse divide-gray-300 pt-6 [&>:not(:first-child)]:px-4">
                                <div>
                                  <Icon children={<CalendarIcon />} />
                                  <div className="mt-6 flex flex-col">
                                    <Typography.Paragraph
                                      size="sm"
                                      weight="normal"
                                      children={t("students_flow.enrolled_at")}
                                    />
                                    <Typography.Paragraph
                                      weight="medium"
                                      children={
                                        <Time
                                          date={enrollment.created_at}
                                          format={"D MMMM YYYY"}
                                        />
                                      }
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Icon children={<ArrowTrendingUpIcon />} />
                                  <div className="mt-6 flex flex-col">
                                    <Typography.Paragraph
                                      size="sm"
                                      weight="normal"
                                      children={t("students_flow.progress_percentage")}
                                    />
                                    <Typography.Paragraph
                                      weight="medium"
                                      children={`${enrollment.percentage_completed ?? 0}%`}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Icon children={<CheckCircleIcon />} />
                                  <div className="mt-6 flex flex-col">
                                    <Typography.Paragraph
                                      size="sm"
                                      weight="normal"
                                      children={t("students_flow.course_completed_at")}
                                    />
                                    {enrollment.completed_at ? (
                                      <Time
                                        date={enrollment.completed_at}
                                        format={"D MMMM YYYY"}
                                      />
                                    ) : (
                                      "-"
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Icon children={<BookmarkSquareIcon />} />
                                  <div className="mt-6 flex flex-col">
                                    <Typography.Paragraph
                                      size="sm"
                                      weight="normal"
                                      children={t("students_flow.certificate")}
                                    />
                                    <Typography.Paragraph
                                      weight="medium"
                                      className="flex items-center"
                                    >
                                      {enrollment.certificate ? (
                                        <>
                                          <Icon
                                            className="ml-2  text-success"
                                            children={<CheckCircleIconSolid />}
                                          />
                                          {t("students_flow.has_certificate")}
                                        </>
                                      ) : (
                                        <>
                                          <Icon
                                            className="ml-2 text-danger"
                                            children={<XCircleIcon />}
                                          />
                                          {t("students_flow.no_certificate")}
                                        </>
                                      )}
                                    </Typography.Paragraph>
                                  </div>
                                </div>
                              </div>
                            </StudentProduct>
                          </Card.Body>
                        </Card>
                      </div>
                    )
                  }
                ]
              }}
              emptyState={
                <EmptyData
                  title={t("students_flow.empty_state.courses")}
                  icon={<InboxStackIcon />}
                />
              }
              toolbar={() => {}}
              hasFilter={false}
              hasSearch={false}
            />
          </div>
        </div>
      </Form.Section>
    </StudentsBaseLayout>
  );
}
