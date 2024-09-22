import { useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CourseColumns from "@/columns/courses";
import { CreateNewModal, Layout } from "@/components";
import { Datatable } from "@/components/datatable";
import CoursesIndexTab from "@/components/shared/products/CoursesIndexTab";
import { GTM_EVENTS, useDataExport, useResponseToastHandler } from "@/hooks";
import { useGTM } from "@/hooks/useGTM";
import i18nextConfig from "@/next-i18next.config";
import { useCreateCourseMutation, useFetchCoursesQuery } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, Course } from "@/types";

import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

type CourseData = Array<Course> & {
  subRows?: CourseData[];
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const [show, setShow] = useState<boolean>(false);
  const { sendGTMEvent } = useGTM();

  const { t } = useTranslation();
  const router = useRouter();

  const { displayErrors } = useResponseToastHandler({});

  const [exportCourses] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportCourses({
      endpoint: "/courses/export",
      name: "courses",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const [createCourse] = useCreateCourseMutation();

  const handleCourseCreation = async (title: string, type?: string) => {
    if (!title?.trim()) {
      return;
    }

    const course = (await createCourse({
      title: title,
      type: type
    })) as APIActionResponse<Course>;

    if (!displayErrors(course)) {
      setShow(false);

      sendGTMEvent(GTM_EVENTS.PRODUCT_CREATED, {
        product_type: "course",
        product_title: title,
        product_id: course?.data.data.id
      });
      if (type === "on_site") {
        await router.push(`/courses/${course?.data.data.id}/details`);
      } else {
        await router.push(`/courses/${course?.data.data.id}/chapters`);
      }
    }
  };

  return (
    <Layout title={t("courses.title")}>
      <CoursesIndexTab />
      <Layout.Container>
        <Datatable
          hasSearch
          columns={{
            columns: CourseColumns
          }}
          params={{
            filters: {
              type: "on_site"
            }
          }}
          fetcher={useFetchCoursesQuery}
          toolbar={(instance) => (
            <>
              <Button
                icon={
                  <Icon
                    size="sm"
                    children={<ArrowDownTrayIcon />}
                  />
                }
                onClick={() => handleExport(instance)}
                variant="default"
                size="md"
                className="ltr:mr-4 rtl:ml-4"
                children={t("export")}
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => setShow(true)}
                children={t("courses.new_course")}
                icon={
                  <Icon
                    size="sm"
                    children={<PlusIcon />}
                  />
                }
              />
            </>
          )}
        />

        <CreateNewModal
          title={t("courses.add_new_course")}
          type="course"
          inputLabel={t("courses.course_title")}
          inputPlaceholder={t("courses.course_title_input_placeholder")}
          createAction={handleCourseCreation}
          submitButtonText={t("add_new")}
          open={show}
          onDismiss={() => {
            setShow(false);
          }}
        />
      </Layout.Container>
    </Layout>
  );
}
