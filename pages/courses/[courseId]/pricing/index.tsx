import React, { useEffect } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { omit } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler } from "react-hook-form";

import { Layout, Taps } from "@/components";
import PricingForm from "@/components/shared/PricingForm";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useFetchCourseQuery, useUpdateCourseMutation } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, Course } from "@/types";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

interface IFormInputs {
  pricing_type: string;
  price: number;
  sales_price: number;
}

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { displaySuccess, displayErrors } = useResponseToastHandler({});
  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const [updateCourseMutation] = useUpdateCourseMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const $data = omit(data, ["pricing_type"]);

    const updatedCourse = (await updateCourseMutation({ id: courseId as any, ...$data })) as APIActionResponse<Course>;
    if (displayErrors(updatedCourse)) {
      return;
    }

    displaySuccess(updatedCourse);

    await router.push(`/courses/${courseId}/students-management`);
  };

  return (
    <Layout title={course?.title}>
      <Taps
        preview_url={course.url}
        type={course.type}
      />
      <Layout.Container>
        <PricingForm
          redirectToPathOnCancel={`/courses/${courseId}`}
          onSubmit={onSubmit}
          defaultValues={course}
          sectionDescription={t("courses.pricing.description")}
          sectionTitle={t("courses.pricing.title")}
          labels={{
            freeLabel: t("courses.pricing.make_this_course_free"),
            freeDescription: t("courses.pricing.make_this_course_free_description"),
            paidLabel: t("courses.pricing.one_time_payment"),
            paidDescription: t("courses.pricing.one_time_payment_description")
          }}
          showMemberships
        />
      </Layout.Container>
    </Layout>
  );
}
