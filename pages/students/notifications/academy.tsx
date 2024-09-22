import React, { useCallback, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "@/components";
import StudentNotificationsTabs from "@/components/shared/StudentNotificationsTabs";
import { useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchNotificationsSettingsQuery,
  useUpdateNotificationsSettingsMutation
} from "@/store/slices/api/notificationsSlice";
import { APIActionResponse } from "@/types";

import { Form } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const { data } = useFetchNotificationsSettingsQuery();
  const [updateNotificationsSettings] = useUpdateNotificationsSettingsMutation();
  const { display } = useResponseToastHandler({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = useCallback(async (data: any) => {
    const notification = (await updateNotificationsSettings(data)) as APIActionResponse<any>;

    display(notification);
    setIsSubmitting(false);
  }, []);

  const onChangeHandler = useCallback(
    (e: any) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      onSubmit({
        [e.target.id]: e.target.checked
      });
    },
    [isSubmitting]
  );

  const toggleProps = useMemo(
    () => ({
      disabled: isSubmitting,
      onChange: onChangeHandler
    }),
    [isSubmitting]
  );

  return (
    <Layout title={t("email_notifications.title")}>
      <StudentNotificationsTabs />
      <Layout.Container>
        <Layout.FormGrid sidebar={<Layout.FormGrid.DefaultSidebar children={null} />}>
          <Form.Section
            title={t("email_notifications.academy.new_orders.title")}
            description={t("email_notifications.academy.new_orders.description")}
            className="mb-6"
            hasDivider
          >
            <div className="flex flex-col space-y-6">
              <Form.Toggle
                id="academy[member_created]"
                name="academy[member_created]"
                label={t("email_notifications.academy.new_orders.new_enrollment")}
                description={t("email_notifications.academy.new_orders.new_enrollment_description")}
                checked={data?.data?.settings?.academy?.member_created}
                {...toggleProps}
              />
              <Form.Toggle
                id="academy[order_created]"
                name="academy[order_created]"
                label={t("email_notifications.academy.new_orders.new_order")}
                description={t("email_notifications.academy.new_orders.new_order_description")}
                checked={data?.data?.settings?.academy?.order_created}
                {...toggleProps}
              />
            </div>
          </Form.Section>
          <Form.Section
            title={t("email_notifications.academy.students_actions.title")}
            description={t("email_notifications.academy.students_actions.description")}
          >
            <div className="flex flex-col space-y-6">
              <Form.Toggle
                id="academy[course_completed]"
                name="academy[course_completed]"
                label={t("email_notifications.academy.students_actions.course_finished")}
                description={t("email_notifications.academy.students_actions.course_finished_description")}
                checked={data?.data?.settings?.academy?.course_completed}
                {...toggleProps}
              />
              <Form.Toggle
                id="academy[assessment_submitted]"
                name="academy[assessment_submitted]"
                label={t("email_notifications.academy.students_actions.assignment_submitted")}
                description={t("email_notifications.academy.students_actions.assignment_submitted_description")}
                checked={data?.data?.settings?.academy?.assessment_submitted}
                {...toggleProps}
              />
              <Form.Toggle
                id="academy[comment_created]"
                name="academy[comment_created]"
                label={t("email_notifications.academy.students_actions.new_comment")}
                description={t("email_notifications.academy.students_actions.new_comment_description")}
                checked={data?.data?.settings?.academy?.comment_created}
                {...toggleProps}
              />
              <Form.Toggle
                id="academy[review_created]"
                name="academy[review_created]"
                label={t("email_notifications.academy.students_actions.new_review")}
                description={t("email_notifications.academy.students_actions.new_review_description")}
                checked={data?.data?.settings?.academy?.review_created}
                {...toggleProps}
              />
            </div>
          </Form.Section>
        </Layout.FormGrid>
      </Layout.Container>
    </Layout>
  );
}
