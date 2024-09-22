import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { AddonController, Card, Layout } from "@/components";
import CustomizeEmailTemplateModal from "@/components/modals/CustomizeEmailTemplateModal";
import StudentNotificationsTabs from "@/components/shared/StudentNotificationsTabs";
import { useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchNotificationsSettingsQuery,
  useUpdateNotificationsSettingsMutation
} from "@/store/slices/api/notificationsSlice";
import { APIActionResponse, EmailTemplate, EmailTemplateInputs, ProductType } from "@/types";

import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Tooltip, Typography } from "@msaaqcom/abjad";
import { ButtonProps } from "@msaaqcom/abjad/dist/components/button/Button";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface MessageData {
  id: number;
  title: string;
  message: string | null;
}

interface ProductsSectionProps {
  data?: MessageData[];
  customizeDefaultEmailTemplateClickHandler: (type: string) => void;
  customizeEmailTemplateClickHandler: (message: MessageData) => void;
  onEmailTypeChangeHandler: (value: any) => void;
  onResetHandler: (type: string) => void;
  useDefaultTemplate: boolean;
  onShowAllClickHandler: () => void;
  showAllLabel: string;
  length: number;
  type: string;
  resetType: string;
  mailable: string;
  disabled: boolean;
  setCurrentTemplate: (type: string) => void;
  currentTemplate: string | undefined;
}

const ResetButton: FC<ButtonProps> = ({ onClick, disabled = false, isLoading }) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      // @ts-ignore
      placement="bottom-center"
    >
      <Tooltip.Trigger>
        <Button
          size="sm"
          variant={"primary"}
          onClick={onClick}
          isLoading={isLoading}
          disabled={disabled}
          icon={
            <Icon>
              <ArrowPathRoundedSquareIcon />
            </Icon>
          }
        />
      </Tooltip.Trigger>
      <Tooltip.Content children={t("email_notifications.reset_default_template")} />
    </Tooltip>
  );
};
const ProductsSection = ({
  data = [],
  customizeDefaultEmailTemplateClickHandler,
  customizeEmailTemplateClickHandler,
  onEmailTypeChangeHandler,
  onResetHandler,
  useDefaultTemplate,
  onShowAllClickHandler,
  disabled: isSubmitting,
  setCurrentTemplate,
  currentTemplate,
  showAllLabel,
  type,
  resetType,
  mailable,
  length
}: ProductsSectionProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(`use_default_template_${type}`);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);
  useEffect(() => {
    setValue(useDefaultTemplate ? `use_default_template_${type}` : `customize_welcome_email_template_${type}`);
  }, [type, useDefaultTemplate]);

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isUsingDefaultTemplate = event.target.value === `use_default_template_${type}`;
    onEmailTypeChangeHandler({
      target: {
        id: `member[use_${type}_default_template]`,
        checked: isUsingDefaultTemplate
      }
    });
    setValue(event.target.value);
  };

  const handleCustomizeDefaultEmailTemplateClick = () => {
    if (useDefaultTemplate) {
      customizeDefaultEmailTemplateClickHandler(`use_${type}_default_template`);
    }
  };

  const handleCustomizeEmailTemplateClick = (message: MessageData) => {
    customizeEmailTemplateClickHandler(message);
  };

  const handleShowAllClick = () => {
    onShowAllClickHandler();
    setShowLoadMoreButton(false);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-row items-center justify-between">
        <Form.Radio
          id={`use_default_template_${type}`}
          value={`use_default_template_${type}`}
          name={`${type}_template`}
          label={t("email_notifications.use_default_template")}
          tooltip={t("email_notifications.use_default_template_tooltip")}
          checked={!useDefaultTemplate ? false : true}
          onChange={handleRadioChange}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            children={t("email_notifications.customize_email_template")}
            disabled={!useDefaultTemplate}
            onClick={handleCustomizeDefaultEmailTemplateClick}
            className="flex-shrink-0"
          />
          <ResetButton
            disabled={(isSubmitting && currentTemplate == resetType) || !useDefaultTemplate}
            onClick={() => {
              setCurrentTemplate(resetType);
              onResetHandler(mailable);
            }}
          />
        </div>
      </div>
      <Form.Radio
        id={`customize_welcome_email_template_${type}`}
        value={`customize_welcome_email_template_${type}`}
        name={`${type}_template`}
        label={t(`email_notifications.student.${type}_customize_email_template`)}
        checked={!useDefaultTemplate ? true : false}
        onChange={handleRadioChange}
        disabled={data.length < 1}
      >
        {({ checked }) =>
          checked &&
          data.length > 0 && (
            <Card>
              <Card.Body className="space-y-4 divide-y [&>:not(:first-child)]:pt-4">
                {data?.slice(0, length).map((message) => (
                  <div
                    className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0"
                    key={message.id}
                  >
                    <Typography.Paragraph
                      as="h3"
                      weight="medium"
                      className="w-full break-words text-right sm:w-2/4"
                    >
                      {message.title}
                    </Typography.Paragraph>
                    <Button
                      size="sm"
                      variant="default"
                      children={t("email_notifications.customize_welcome_email_template")}
                      className="w-full sm:w-auto"
                      onClick={() => {
                        handleCustomizeEmailTemplateClick(message);
                      }}
                    />
                  </div>
                ))}
                {data?.length > 3 && showLoadMoreButton && (
                  <div className="flex justify-center">
                    <Button
                      ghost
                      children={showAllLabel}
                      onClick={handleShowAllClick}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          )
        }
      </Form.Radio>
    </div>
  );
};
export default function Index() {
  const { t } = useTranslation();
  const [showCustomizeEmailTemplateModal, setShowCustomizeEmailTemplateModal] = useState<boolean>(false);

  const { data } = useFetchNotificationsSettingsQuery();
  const [templates, setTemplates] = useState<Array<EmailTemplate> | null>(null);
  const [updateNotificationsSettings] = useUpdateNotificationsSettingsMutation();
  const { display } = useResponseToastHandler({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<string | undefined>(undefined);

  const [length, setLength] = useState({
    course: 3,
    digital: 3,
    bundle: 3,
    coaching_session: 3
  });

  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateInputs | null>(null);

  const onSubmit = useCallback(async (data: any) => {
    const notification = (await updateNotificationsSettings(data)) as APIActionResponse<any>;

    display(notification);
    setIsSubmitting(false);
    setCurrentTemplate(undefined);
  }, []);

  const resetTemplate = useCallback(
    async (type: string) => {
      const emailTemplate = templates?.find((template) => template.mailable.includes(type));
      const $data: any = { restore: emailTemplate?.mailable };

      setIsSubmitting(true);

      const notification = (await updateNotificationsSettings($data)) as APIActionResponse<any>;

      display(notification);
      setIsSubmitting(false);
      setCurrentTemplate(undefined);
    },
    [data, templates]
  );

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

  const onCustomizeDefaultEmailTemplateClick = useCallback(
    (
      mailable:
        | "WelcomeMemberEmailNotification"
        | "YouEnrolledInCourseNotification"
        | "YouPurchasedProductNotification"
        | "VerifyMemberEmailNotification"
        | "ChapterHasBeenDrippedNotification"
        | "YouPurchasedBundleNotification"
        | "YouFinishedTheCourseNotification",
      type: "course" | "product" | "general",
      content_type: EmailTemplateInputs["content_type"],
      default_template_for?: string
    ) => {
      const emailTemplate = data?.data.email_templates.find((template) => template.mailable.includes(mailable));

      if (emailTemplate) {
        setEmailTemplate({
          id: emailTemplate.id,
          type: type,
          vars: emailTemplate.vars,
          mail_subject: emailTemplate.subject,
          mail_message: emailTemplate.content,
          content_type: content_type,
          default_template_for
        });
        setShowCustomizeEmailTemplateModal(true);
      }
    },
    [data]
  );

  const onCustomizeEmailTemplateClick = useCallback(
    (
      mailable:
        | "YouEnrolledInCourseNotification"
        | "YouPurchasedProductNotification"
        | "YouPurchasedBundleNotification",
      type: "course" | "product",
      message: {
        id: number;
        title: string;
        message: string | null;
        subject?: string;
      },
      content_type: EmailTemplateInputs["content_type"]
    ) => {
      const emailTemplate = data?.data.email_templates.find((template) => template.mailable.includes(mailable));
      if (emailTemplate) {
        setEmailTemplate({
          id: message.id,
          type: type,
          vars: emailTemplate.vars,
          mail_subject: message.subject ?? emailTemplate.subject,
          mail_message: message.message ?? emailTemplate.content,
          content_type: content_type
        });
        setShowCustomizeEmailTemplateModal(true);
      }
    },
    [data]
  );

  useEffect(() => {
    if (data && data?.data?.email_templates) {
      const templates = data?.data?.email_templates;

      setTemplates(templates);
    }
  }, [templates, data]);

  return (
    <Layout title={t("email_notifications.title")}>
      <StudentNotificationsTabs />
      <Layout.Container>
        <AddonController addon="students.notifications">
          <Layout.FormGrid sidebar={<Layout.FormGrid.DefaultSidebar children={null} />}>
            <Form.Section
              title={t("email_notifications.student.settings.title")}
              description={t("email_notifications.student.settings.description")}
              className="mb-6"
              hasDivider
            >
              <div className="flex flex-col space-y-6">
                <div className="flex flex-row items-center justify-between">
                  <Form.Toggle
                    id="member[welcome_email]"
                    name="member[welcome_email]"
                    label={t("email_notifications.student.settings.welcome_message")}
                    tooltip={t("email_notifications.student.settings.welcome_message_tooltip")}
                    checked={data?.data?.settings?.member?.welcome_email}
                    {...toggleProps}
                  />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      children={t("email_notifications.customize_email_template")}
                      disabled={!data?.data?.settings?.member?.welcome_email}
                      onClick={() => {
                        onCustomizeDefaultEmailTemplateClick(
                          "WelcomeMemberEmailNotification",
                          "general",
                          "welcome_email"
                        );
                      }}
                      className="flex-shrink-0"
                    />
                    <ResetButton
                      disabled={
                        (isSubmitting && currentTemplate == "welcome_email") ||
                        !data?.data?.settings?.member?.welcome_email
                      }
                      onClick={async (e) => {
                        setCurrentTemplate("welcome_email");
                        await resetTemplate("WelcomeMemberEmailNotification");
                      }}
                    />
                  </div>
                </div>
                <Form.Toggle
                  id="member[comment_replied]"
                  name="member[comment_replied]"
                  label={t("email_notifications.student.settings.comments_replies")}
                  tooltip={t("email_notifications.student.settings.comments_replies_tooltip")}
                  checked={data?.data?.settings?.member?.comment_replied}
                  {...toggleProps}
                />
                <Form.Toggle
                  id="member[invoice_created]"
                  name="member[invoice_created]"
                  label={t("email_notifications.student.settings.send_invoices")}
                  tooltip={t("email_notifications.student.settings.send_invoices_tooltip")}
                  checked={data?.data?.settings?.member?.invoice_created}
                  {...toggleProps}
                />
              </div>
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.courses.title")}
              description={t("email_notifications.student.courses.description")}
              className="mb-6"
              hasDivider
            >
              <ProductsSection
                type="course"
                resetType="enrolled_at_course"
                disabled={isSubmitting}
                setCurrentTemplate={setCurrentTemplate}
                currentTemplate={currentTemplate}
                data={data?.data?.courses_enrollment_messages.map((message) => ({
                  id: message.id,
                  title: message.title,
                  message: message.enrollment_message,
                  subject: message.enrollment_message_subject
                }))}
                customizeDefaultEmailTemplateClickHandler={(type) => {
                  onCustomizeDefaultEmailTemplateClick(
                    "YouEnrolledInCourseNotification",
                    "general",
                    "enrolled_at_course",
                    type
                  );
                }}
                customizeEmailTemplateClickHandler={(message) => {
                  onCustomizeEmailTemplateClick(
                    "YouEnrolledInCourseNotification",
                    "course",
                    message,
                    "enrolled_at_course"
                  );
                }}
                onEmailTypeChangeHandler={onChangeHandler}
                onResetHandler={resetTemplate}
                mailable="YouEnrolledInCourseNotification"
                useDefaultTemplate={data?.data?.settings?.member.use_course_default_template ?? false}
                length={length.course}
                showAllLabel={t("show_all")}
                onShowAllClickHandler={() => {
                  setLength((prev) => {
                    return { ...prev, course: data?.data?.courses_enrollment_messages?.length ?? 3 };
                  });
                }}
              />
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.products.title")}
              description={t("email_notifications.student.products.description")}
              className="mb-6"
              hasDivider
            >
              <ProductsSection
                disabled={isSubmitting}
                setCurrentTemplate={setCurrentTemplate}
                currentTemplate={currentTemplate}
                type={ProductType.DIGITAL}
                resetType="product_purchased"
                data={data?.data?.products_purchase_messages
                  ?.filter((p) => p.type === ProductType.DIGITAL)
                  .map((message) => ({
                    id: message.id,
                    title: message.title,
                    message: message.purchase_message,
                    subject: message.purchase_message_subject
                  }))}
                customizeDefaultEmailTemplateClickHandler={(type) => {
                  onCustomizeDefaultEmailTemplateClick(
                    "YouPurchasedProductNotification",
                    "general",
                    "product_purchased",
                    type
                  );
                }}
                customizeEmailTemplateClickHandler={(message) => {
                  onCustomizeEmailTemplateClick(
                    "YouPurchasedProductNotification",
                    "product",
                    message,
                    "product_purchased"
                  );
                }}
                onEmailTypeChangeHandler={onChangeHandler}
                onResetHandler={resetTemplate}
                mailable="YouPurchasedProductNotification"
                useDefaultTemplate={data?.data?.settings?.member.use_digital_default_template ?? false}
                length={length.digital}
                showAllLabel={t("show_all")}
                onShowAllClickHandler={() => {
                  setLength((prev) => {
                    return { ...prev, digital: data?.data?.products_purchase_messages?.length ?? 3 };
                  });
                }}
              />
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.coaching-sessions.title")}
              description={t("email_notifications.student.coaching-sessions.description")}
              className="mb-6"
              hasDivider
            >
              <ProductsSection
                disabled={isSubmitting}
                setCurrentTemplate={setCurrentTemplate}
                currentTemplate={currentTemplate}
                type={ProductType.COACHING_SESSION}
                resetType="coaching_purchased"
                data={data?.data?.products_purchase_messages
                  ?.filter((p) => p.type === ProductType.COACHING_SESSION)
                  .map((message) => ({
                    id: message.id,
                    title: message.title,
                    message: message.purchase_message,
                    subject: message.purchase_message_subject
                  }))}
                customizeDefaultEmailTemplateClickHandler={(type) => {
                  onCustomizeDefaultEmailTemplateClick(
                    "YouPurchasedProductNotification",
                    "general",
                    "product_purchased",
                    type
                  );
                }}
                customizeEmailTemplateClickHandler={(message) => {
                  onCustomizeEmailTemplateClick(
                    "YouPurchasedProductNotification",
                    "product",
                    message,
                    "product_purchased"
                  );
                }}
                onEmailTypeChangeHandler={onChangeHandler}
                onResetHandler={resetTemplate}
                mailable="YouPurchasedProductNotification"
                useDefaultTemplate={data?.data?.settings?.member.use_coaching_session_default_template ?? false}
                length={length.coaching_session}
                showAllLabel={t("show_all")}
                onShowAllClickHandler={() => {
                  setLength((prev) => {
                    return { ...prev, coaching_session: data?.data?.products_purchase_messages?.length ?? 3 };
                  });
                }}
              />
            </Form.Section>

            <Form.Section
              title={t("email_notifications.student.bundles.title")}
              description={t("email_notifications.student.bundles.description")}
              className="mb-6"
              hasDivider
            >
              <AddonController addon="products-bundles">
                <ProductsSection
                  disabled={isSubmitting}
                  setCurrentTemplate={setCurrentTemplate}
                  currentTemplate={currentTemplate}
                  type={ProductType.BUNDLE}
                  resetType="bundle_purchased"
                  data={data?.data?.products_purchase_messages
                    ?.filter((p) => p.type === ProductType.BUNDLE)
                    .map((message) => ({
                      id: message.id,
                      title: message.title,
                      message: message.purchase_message,
                      subject: message.purchase_message_subject
                    }))}
                  customizeDefaultEmailTemplateClickHandler={(type) => {
                    onCustomizeDefaultEmailTemplateClick(
                      "YouPurchasedBundleNotification",
                      "general",
                      "bundle_purchased",
                      type
                    );
                  }}
                  customizeEmailTemplateClickHandler={(message) => {
                    onCustomizeEmailTemplateClick(
                      "YouPurchasedBundleNotification",
                      "product",
                      message,
                      "bundle_purchased"
                    );
                  }}
                  onEmailTypeChangeHandler={onChangeHandler}
                  onResetHandler={resetTemplate}
                  mailable="YouPurchasedBundleNotification"
                  useDefaultTemplate={data?.data?.settings?.member.use_bundle_default_template ?? false}
                  length={length.bundle}
                  showAllLabel={t("show_all")}
                  onShowAllClickHandler={() => {
                    setLength((prev) => {
                      return { ...prev, bundle: data?.data?.products_purchase_messages?.length ?? 3 };
                    });
                  }}
                />
              </AddonController>
            </Form.Section>

            <Form.Section
              title={t("email_notifications.student.course-complete.title")}
              description={t("email_notifications.student.course-complete.description")}
              className="mb-6"
              hasDivider
            >
              <div className="flex flex-row items-center justify-between">
                <Form.Toggle
                  id="member[course_completed]"
                  name="member[course_completed]"
                  label={t("email_notifications.student.course-complete.send_email")}
                  checked={data?.data?.settings?.member?.course_completed}
                  {...toggleProps}
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    children={t("email_notifications.customize_email_template")}
                    disabled={!data?.data?.settings?.member?.course_completed}
                    onClick={() => {
                      onCustomizeDefaultEmailTemplateClick(
                        "YouFinishedTheCourseNotification",
                        "general",
                        "course_completed"
                      );
                    }}
                    className="flex-shrink-0"
                  />
                  <ResetButton
                    disabled={
                      (isSubmitting && currentTemplate == "course_completed") ||
                      !data?.data?.settings?.member?.course_completed
                    }
                    onClick={async () => {
                      setCurrentTemplate("course_completed");
                      await resetTemplate("YouFinishedTheCourseNotification");
                    }}
                  />
                </div>
              </div>
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.drip-content.title")}
              description={t("email_notifications.student.drip-content.description")}
              className="mb-6"
              hasDivider
            >
              <AddonController
                addon="courses.drip-content"
                type="item"
              >
                <div className="flex flex-row items-center justify-between">
                  <Form.Toggle
                    id="member[content_dripped]"
                    name="member[content_dripped]"
                    label={t("email_notifications.student.drip-content.send_email")}
                    checked={data?.data?.settings?.member?.content_dripped}
                    {...toggleProps}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      children={t("email_notifications.customize_email_template")}
                      disabled={!data?.data?.settings?.member?.content_dripped}
                      onClick={() => {
                        onCustomizeDefaultEmailTemplateClick(
                          "ChapterHasBeenDrippedNotification",
                          "general",
                          "content_dripped"
                        );
                      }}
                      className="flex-shrink-0"
                    />
                    <ResetButton
                      disabled={
                        (isSubmitting && currentTemplate == "content_dripped") ||
                        !data?.data?.settings?.member?.content_dripped
                      }
                      onClick={async () => {
                        setCurrentTemplate("content_dripped");
                        await resetTemplate("ChapterHasBeenDrippedNotification");
                      }}
                    />
                  </div>
                </div>
              </AddonController>
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.zoom.title")}
              description={t("email_notifications.student.zoom.description")}
              className="mb-6"
              hasDivider
            >
              <AddonController addon="apps.zoom">
                <div className="flex flex-row items-center justify-between">
                  <Form.Toggle
                    id="member[zoom_meeting_started]"
                    name="member[zoom_meeting_started]"
                    label={t("email_notifications.student.zoom.send_email")}
                    checked={data?.data?.settings?.member?.zoom_meeting_started}
                    {...toggleProps}
                  />
                </div>
              </AddonController>
            </Form.Section>
            <Form.Section
              title={t("email_notifications.student.certificate.title")}
              description={t("email_notifications.student.certificate.description")}
            >
              <div className="flex flex-row items-center justify-between">
                <Form.Toggle
                  id="member[certificate_created]"
                  name="member[certificate_created]"
                  label={t("email_notifications.student.certificate.send_email")}
                  checked={data?.data?.settings?.member?.certificate_created}
                  {...toggleProps}
                />
              </div>
            </Form.Section>
          </Layout.FormGrid>
        </AddonController>
      </Layout.Container>
      <CustomizeEmailTemplateModal
        open={showCustomizeEmailTemplateModal}
        onDismiss={() => setShowCustomizeEmailTemplateModal(false)}
        emailTemplate={emailTemplate}
      />
    </Layout>
  );
}
