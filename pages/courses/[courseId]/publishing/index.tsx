import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { isEmpty } from "lodash";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import {
  Card,
  ChapterContainer,
  ChapterItem,
  HelpdeskLink,
  Layout,
  SuccessModal,
  Taps,
  useShareable
} from "@/components";
import ProductPreviewCard from "@/components/cards/ProductPreviewCard";
import { GTM_EVENTS, GTM_PRODUCT_TYPES, useAppDispatch, useGTM, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchChaptersQuery } from "@/store/slices/api/chaptersSlice";
import { useFetchCourseQuery, useUpdateCourseMutation } from "@/store/slices/api/coursesSlice";
import { Chapter as $Chapter, APIActionResponse, APIResponse, Course, CourseStatus } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { Alert, Form, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  status: CourseStatus;
  publish_at: string | null;
  hours: number | string;
  minutes: number | string;
  prefix: string;
  meta: {
    early_access: boolean;
  };
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const schema = yup.object().shape({
    status: yup.string().required(),
    hours: yup.mixed().required(),
    minutes: yup.mixed().required(),
    prefix: yup.mixed().required()
  });

  const form = useForm<IFormInputs>({
    defaultValues: {
      meta: {
        early_access: false
      }
    },
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isValid, isDirty }
  } = form;

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const share = useShareable();
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    query: { courseId }
  } = router;

  const { data: chapters = {} as APIResponse<$Chapter> } = useFetchChaptersQuery(courseId as string);
  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const [updateCourseMutation] = useUpdateCourseMutation();

  useEffect(() => {
    if (selectedDay) {
      setValue("publish_at", dayjs(selectedDay).format("YYYY-M-D"));
    }
  }, [selectedDay]);

  const statusPublishLater = () => {
    const publish_at = new Date(course.publish_at ?? new Date());
    const today = new Date();
    return publish_at.getTime() > today.getTime();
  };

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  useEffect(() => {
    if (!isEmpty(course)) {
      reset({
        meta: {
          early_access: course.meta.early_access
        },
        publish_at: course.publish_at,
        status: course.status,
        hours: course.publish_at ? dayjs(course.publish_at).format("h") : "00",
        minutes: course.publish_at ? dayjs(course.publish_at).format("mm") : "00",
        prefix: course.publish_at ? dayjs(course.publish_at).format("A") : "AM"
      });
      setSelectedDay(new Date(course.publish_at ?? new Date()));
    }
  }, [course]);

  const { sendGTMEvent } = useGTM();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const oldStatus = course.status;

    const updatedCourse = (await updateCourseMutation({
      id: course.id,
      publish_at: data.status === "scheduled" ? data.publish_at : null,
      status: data.status,
      meta: {
        early_access: data.status === "scheduled" ? true : false
      }
    })) as APIActionResponse<Course>;

    if (displayErrors(updatedCourse)) return;

    if (updatedCourse.data.data.status === CourseStatus.PUBLISHED) {
      setShowSuccessModal(true);

      if (oldStatus !== CourseStatus.PUBLISHED) {
        sendGTMEvent(GTM_EVENTS.PRODUCT_PUBLISHED, {
          product_type: GTM_PRODUCT_TYPES.COURSE,
          product_title: updatedCourse.data.data.title,
          product_id: updatedCourse.data.data.id
        });
      }
    } else {
      displaySuccess(updatedCourse);
      if (router.query.onboarding) {
        eventBus.emit("tour:nextStep");
      }
    }
  };

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}` });

    if (router.query.onboarding) {
      eventBus.on("tour:submitForm", () => {
        handleSubmit(onSubmit)();
      });
    }
  }, []);

  return (
    <Layout title={course?.title}>
      <Taps
        preview_url={course.url}
        type={course.type}
      />
      <Layout.Container>
        <Alert
          variant="default"
          bordered
          dismissible
          className="mb-6"
        >
          <Trans
            values={{ title: t("helpdesk_title") }}
            i18nKey="courses.publish_guide"
            components={{
              a: (
                <HelpdeskLink
                  slug={"nshr-aldorat-altdrybya-i9abwr"}
                  className="text-info hover:underline"
                />
              )
            }}
          />
        </Alert>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Layout.FormGrid
            sidebar={
              <Layout.FormGrid.Actions
                statuses={["draft", "published", "unlisted", "early-access"]}
                form={form}
                product={course}
                redirect={`/courses/${courseId}`}
                name="publish_at"
                schedulingModalTitle={t("courses.publishing.modal_title")}
                schedulingDateLabel={t("courses.publishing.course_start_date")}
                schedulingDateDescription={t("courses.publishing.course_start_date_description")}
                schedulingTimeLabel={t("courses.publishing.course_publish_time")}
              />
            }
          >
            {course.type == "online" && (
              <Card className="mb-6">
                <Card.Header>
                  <Typography.Paragraph
                    size="lg"
                    weight="medium"
                    children={t("courses.course_content")}
                  />
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-col space-y-4">
                    {chapters.data?.map((chapter) => (
                      <ChapterContainer
                        key={chapter.id}
                        data={chapter}
                        readOnly
                      >
                        {chapter.contents?.map((content) => (
                          <ChapterItem
                            key={content.id}
                            data={{
                              ...content,
                              parent: chapter
                            }}
                            readOnly
                          />
                        ))}
                      </ChapterContainer>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
            <ProductPreviewCard
              product={course}
              title={t("courses.course_preview_in_academy")}
              product_landing_page_label={t("courses.course_landing_page")}
            />
          </Layout.FormGrid>
        </Form>

        <SuccessModal
          open={showSuccessModal}
          onDismiss={() => {
            setShowSuccessModal(false);
          }}
          title={t("courses.publishing.success_modal_title")}
          description={t("courses.publishing.success_modal_description")}
          actionLink={course?.url ?? ""}
          actionLinkLabel={t("courses.go_to_course")}
          shareButtonLabel={t("courses.share")}
          shareButtonOnClick={() => {
            setShowSuccessModal(false);
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
        />
      </Layout.Container>
    </Layout>
  );
}
