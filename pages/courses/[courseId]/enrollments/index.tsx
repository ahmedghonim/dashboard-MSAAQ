import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import EnrollmentCols, { EnrollmentColumnsProps } from "@/columns/enrollments";
import { Layout } from "@/components";
import { confirm } from "@/components/Alerts/Confirm";
import { Datatable } from "@/components/datatable";
import CertificateModal, { ICertificateFormInputs } from "@/components/modals/CertificateModal";
import { useAppDispatch, useDataExport, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import { useCreateCertificateMutation, useDeleteCertificateMutation } from "@/store/slices/api/certificatesSlice";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { useFetchEnrollmentsQuery } from "@/store/slices/api/enrollmentsSlice";
import { APIActionResponse, Certificate, Course, Enrollment } from "@/types";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import { Breadcrumbs, Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});
export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [enrollment, setEnrollment] = useState<Enrollment>({} as Enrollment);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const {
    query: { courseId }
  } = router;

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);
  const [deleteCertificate] = useDeleteCertificateMutation();
  const [createCertificateMutation] = useCreateCertificateMutation();

  useEffect(() => {
    dispatch({ type: "app/setBackLink", payload: `/courses` });
  }, []);

  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  const [exportEnrollments] = useDataExport();
  const handleExport = async (tableInstance: any) => {
    exportEnrollments({
      endpoint: "/enrollments/export",
      payload: {
        filters: {
          course_id: courseId
        }
      },
      name: "enrollments",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };

  const cancelCertificateHandler = async (enrollment: Enrollment) => {
    if (
      await confirm({
        variant: "warning",
        okLabel: t("confirm"),
        cancelLabel: t("cancel"),
        children: (
          <Typography.Paragraph
            size="md"
            weight="normal"
            children={t("certificates.cancel_certificate_content")}
          />
        ),
        title: t("certificates.cancel_certificate_title")
      })
    ) {
      const deleted = (await deleteCertificate({
        certificateID: enrollment.certificate.id
      })) as APIActionResponse<any>;

      if (displayErrors(deleted)) return;
      else {
        displaySuccess(deleted);
      }
    }
  };

  const createCertificateHandler = async (data: ICertificateFormInputs) => {
    const { type, certificate, serial } = data;
    const createdCertificate = (await createCertificateMutation({
      courseId: courseId as string,
      memberId: enrollment.member.id,
      data: {
        type,
        ...(type === "custom" && { certificate: certificate.file, serial })
      }
    })) as APIActionResponse<Certificate>;
    if (displayErrors(createdCertificate)) return;
    else {
      displaySuccess(createdCertificate);
      setShowCertificateModal(false);
    }
  };

  return (
    <Layout title={course?.title}>
      <Layout.Container>
        <Breadcrumbs className="mb-4">
          <Link href="/">
            <Typography.Paragraph as="span">{t("sidebar.main")}</Typography.Paragraph>
          </Link>
          <Link href="/courses">
            <Typography.Paragraph as="span">{t("courses.title")}</Typography.Paragraph>
          </Link>
          <Link href={`/courses/${courseId}/chapters`}>
            <Typography.Paragraph as="span">{course?.title}</Typography.Paragraph>
          </Link>
          <Typography.Paragraph
            className="text-gray-800"
            as="span"
          >
            {t("enrollments.enrolled_student")}
          </Typography.Paragraph>
        </Breadcrumbs>
        <Datatable
          fetcher={useFetchEnrollmentsQuery}
          params={{
            filters: {
              course_id: courseId as string
            }
          }}
          columns={{
            columns: EnrollmentCols,
            props: {
              showRowActions: true,
              giveCertificateHandler: (enrollment) => {
                setEnrollment(enrollment);
                setShowCertificateModal(true);
              },
              cancelCertificateHandler: cancelCertificateHandler
            } as EnrollmentColumnsProps
          }}
          hasSearch={true}
          toolbar={(instance) => (
            <>
              <Button
                variant="default"
                icon={
                  <Icon>
                    <ArrowDownTrayIcon />
                  </Icon>
                }
                children={t("export")}
                onClick={async () => {
                  await handleExport(instance);
                }}
              />
            </>
          )}
        />
      </Layout.Container>
      <CertificateModal
        createAction={createCertificateHandler}
        enrollment={enrollment}
        onDismiss={() => {
          setShowCertificateModal(false);
        }}
        open={showCertificateModal}
      />
    </Layout>
  );
}
