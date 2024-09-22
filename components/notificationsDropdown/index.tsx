import { ReactNode, useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { isToday } from "date-fns";
import { useTranslation } from "next-i18next";

import { Card } from "@/components/cards";
import { useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { useLazyFetchNotificationsQuery, useUpdateNotificationsMutation } from "@/store/slices/api/notificationsSlice";
import { APIActionResponse, Notification, NotificationsData } from "@/types";
import { classNames } from "@/utils";

import {
  ArrowDownCircleIcon,
  ArrowDownTrayIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CreditCardIcon,
  GiftIcon,
  GiftTopIcon,
  BellIcon as OutlineBellIcon
} from "@heroicons/react/24/outline";
import { BellIcon as SolidBellIcon, StarIcon } from "@heroicons/react/24/solid";

import { Avatar, Button, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export const LoadingCard = () => {
  return (
    <div className="animate-pulse ">
      <div className="flex flex-col gap-3">
        <div className="h-24 w-full rounded-xl bg-gray-300"></div>
        <div className="h-24 w-full rounded-xl bg-gray-300"></div>
        <div className="h-24 w-full rounded-xl bg-gray-300"></div>
      </div>
    </div>
  );
};

const NotificationCard = ({
  children,
  onClick,
  classNames
}: {
  children: ReactNode;
  onClick: () => void;
  classNames: string;
}) => {
  return (
    <Card
      onClick={() => onClick()}
      className={classNames}
    >
      <Card.Body>{children}</Card.Body>
    </Card>
  );
};
const BaseNotification = ({
  notification,
  actions,
  children,
  icon
}: {
  notification: Notification;
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <div className="flex gap-4">
      {icon}
      <div className="flex flex-col items-start">
        <Typography.Paragraph
          className="mb-2 text-primary-950"
          weight="medium"
          size="lg"
          children={notification.title}
        />
        <Typography.Paragraph
          className="mb-2 text-primary"
          size="lg"
          children={notification.body}
        />
        {children}
        <Typography.Paragraph
          className="mb-4 text-gray-700"
          size="sm"
          children={dayjs(notification.created_at).format("DD MMMM YYYY")}
        />
        {actions}
      </div>
    </div>
  );
};
interface NotificationProps {
  notifications: Notification[];
  title: string;
  setUpdatedNotifications: any;
}
const Notifications = ({ notifications, title, setUpdatedNotifications }: NotificationProps) => {
  const [updateNotifications] = useUpdateNotificationsMutation();
  const { displayErrors } = useResponseToastHandler({});

  const markRead = async (notification: Notification) => {
    if (notification.read_at == null) {
      const response = (await updateNotifications({
        notification_id: notification.id
      })) as APIActionResponse<any>;

      if (response.error) {
        displayErrors(response);
        return;
      }

      const updatedList = notifications.map((item) => {
        if (item.id === notification.id) {
          return {
            ...item,
            read_at: new Date().toISOString()
          };
        }
        return item;
      });

      setUpdatedNotifications(updatedList);
    }
  };

  const { t } = useTranslation();
  return (
    <>
      <div className="my-3 flex w-full items-center gap-4 before:h-px before:flex-1 before:bg-gray-400  before:content-[''] after:h-px after:flex-1 after:bg-gray-400  after:content-['']">
        <Typography.Paragraph
          size="sm"
          weight="medium"
          className="mx-2 flex-shrink text-primary"
          children={title}
        />
      </div>
      {notifications.map((notification, index) => {
        switch (notification.type) {
          case "academy.review.review_created_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="relative">
                      {notification?.read_at == null && (
                        <span className="absolute -top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                      )}
                      <Avatar
                        name={notification.payload.member_name}
                        imageUrl={notification.payload.member_avatar}
                        size="lg"
                      />
                    </div>
                  }
                  children={
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Icon
                          size="lg"
                          className={index < notification.payload.rating ? "text-yellow-500" : "text-gray-400"}
                          key={index}
                        >
                          <StarIcon />
                        </Icon>
                      ))}
                    </div>
                  }
                />
              </NotificationCard>
            );

          case "new_product_purchase_notification":
          case "download.new_product_purchase_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <>
                      {notification.payload.image ? (
                        <img
                          src={notification.payload.image}
                          className="my-auto h-full w-24 rounded-lg"
                          alt={notification.title}
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                          <Icon className="relative">
                            {notification?.read_at == null && (
                              <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                            )}
                            <OutlineBellIcon className="text-primary" />
                          </Icon>
                        </div>
                      )}
                    </>
                  }
                />
              </NotificationCard>
            );
          case "new_order_notification":
          case "order.new_order_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/orders/${notification.payload.order_id}`}
                      children={t("notifications.view_order")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.bank_transfer.you_have_bank_transfer_waiting_for_confirmation_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <CreditCardIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/orders/bank-transfers/${notification.payload.bank_transfer_id}`}
                      children={t("notifications.view_order")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "enrollment.new_enrollment_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/students/${notification.payload.member_id}`}
                      children={t("notifications.view_student")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.user.team_member_added_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/settings/team`}
                      children={t("notifications.view_user_details")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "enrollment.course_completed_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="relative">
                      {notification?.read_at == null && (
                        <span className="absolute -top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                      )}
                      <Avatar
                        name={notification.payload.member_name}
                        imageUrl={notification.payload.member_avatar}
                        size="lg"
                      />
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/students/${notification.payload.member_id}`}
                      children={t("notifications.view_student")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.comment.comment_created_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <ChatBubbleOvalLeftEllipsisIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                />
              </NotificationCard>
            );
          case "academy.course.course_replicated_notification":
          case "academy.product.product_replicated_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <>
                      {notification.payload.image ? (
                        <img
                          src={notification.payload.image}
                          className="h-24 w-24 rounded-lg"
                          alt={notification.title}
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                          <Icon className="relative">
                            {notification?.read_at == null && (
                              <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                            )}
                            <OutlineBellIcon className="text-primary" />
                          </Icon>
                        </div>
                      )}
                    </>
                  }
                />
              </NotificationCard>
            );
          case "academy.course.CourseReplicateFailedNotification":
          case "academy.product.ProductReplicateFailedNotification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <>
                      {notification.payload.image ? (
                        <img
                          src={notification.payload.image}
                          className="h-24 w-24 rounded-lg"
                          alt={notification.title}
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                          <Icon className="relative">
                            {notification?.read_at == null && (
                              <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                            )}
                            <OutlineBellIcon className="text-primary" />
                          </Icon>
                        </div>
                      )}
                    </>
                  }
                />
              </NotificationCard>
            );
          case "academy.resource_exported_success_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      icon={
                        <Icon>
                          <ArrowDownTrayIcon />
                        </Icon>
                      }
                      href={notification.payload.url}
                      children={t("notifications.download_file")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.assignment.assignment_submitted_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/students/assignments/${notification.payload.assignment_member_id}`}
                      children={t("notifications.view_assignment")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "msaaq_pay.payouts.payout_created_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/msaaq-pay/payouts/${notification.payload.transaction_id}`}
                      children={t("notifications.view_request_details")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "entity.entity_review_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={"/settings/verify/status"}
                      children={t("notifications.view_verification")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.appointment.appointment_created_host_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/students/${notification.payload.appointment_id}`}
                      children={t("notifications.view_client")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.appointment.appointment_reminder_host_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/coaching-sessions/${notification.payload.product_id}`}
                      children={t("notifications.view_session")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "academy.appointment.host_not_installed_google_calendar_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <OutlineBellIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"primary"}
                      as={Link}
                      href={`/apps`}
                      icon={
                        <Icon>
                          <ArrowDownCircleIcon />
                        </Icon>
                      }
                      children={t("notifications.download_google_calendar")}
                    />
                  }
                />
              </NotificationCard>
            );
          case "free_emails_granted_notification":
            return (
              <NotificationCard
                onClick={() => {
                  markRead(notification);
                }}
                key={`${notification.id}-${index}`}
                classNames={classNames(notification.read_at == null ? "cursor-pointer" : "", "mb-3 bg-gray-50")}
              >
                <BaseNotification
                  notification={notification}
                  icon={
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Icon className="relative">
                        {notification?.read_at == null && (
                          <span className="absolute -top-3 left-4 flex h-3 w-3 items-center justify-center rounded-full bg-danger text-[10px] text-white" />
                        )}
                        <GiftTopIcon className="text-primary" />
                      </Icon>
                    </div>
                  }
                  actions={
                    <Button
                      variant={"default"}
                      as={Link}
                      href={`/marketing/campaigns`}
                      icon={
                        <Icon>
                          <GiftIcon />
                        </Icon>
                      }
                      children={t("notifications.get_100_message")}
                    />
                  }
                />
              </NotificationCard>
            );
          default:
            return null;
        }
      })}
    </>
  );
};

const NotificationsDropdown = () => {
  const { t } = useTranslation();
  const [todayNotifications, setTodayNotifications] = useState<Notification[]>([]);
  const [oldNotifications, setOldNotifications] = useState<Notification[]>([]);
  const [currentActiveTab, setCurrentActiveTab] = useState<"all" | "unread">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});

  const [params, setParams] = useState<{
    page: number;
    per_page: number;
    is_read?: number;
  }>({
    page: 1,
    per_page: 10
  });

  const [updateNotifications] = useUpdateNotificationsMutation();

  const [
    fetchNotifications,
    {
      data: notifications = {} as {
        data: NotificationsData;
      },
      isFetching
    }
  ] = useLazyFetchNotificationsQuery();

  const refetch = async () => {
    const newNotifications = await fetchNotifications(params);

    setTodayNotifications((prevTodayNotifications) => {
      const filteredTodayNotifications =
        newNotifications?.data?.data.notifications.filter((notification: Notification) =>
          isToday(new Date(notification.created_at))
        ) || [];

      return Array.from(new Set([...prevTodayNotifications, ...filteredTodayNotifications]));
    });

    setOldNotifications((prevOldNotifications) => {
      const filteredOldNotifications =
        newNotifications?.data?.data.notifications.filter(
          (notification: Notification) => !isToday(new Date(notification.created_at))
        ) || [];

      return Array.from(new Set([...prevOldNotifications, ...filteredOldNotifications]));
    });

    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [params]);

  const markAllAsRead = useCallback(async (data?: any) => {
    if (isSubmitting) return;
    const response = (await updateNotifications(data)) as APIActionResponse<any>;

    if (response.error) {
      displayErrors(response);
      return;
    }
    displaySuccess(response);
    setTodayNotifications((prevTodayNotifications) => {
      return prevTodayNotifications.map((notification) => ({
        ...notification,
        read_at: new Date().toISOString()
      }));
    });

    setOldNotifications((prevOldNotifications) => {
      return prevOldNotifications.map((notification) => ({
        ...notification,
        read_at: new Date().toISOString()
      }));
    });
    setIsSubmitting(false);
  }, []);

  const onTabChange = useCallback(
    (activeTab: "all" | "unread") => {
      if (activeTab === currentActiveTab) return;
      setParams((prevParams) => ({
        ...prevParams,
        is_read: activeTab === "unread" ? 0 : undefined,
        page: 1
      }));

      setLoading(true);
      setOldNotifications([]);
      setTodayNotifications([]);
      setCurrentActiveTab(activeTab);
    },
    [currentActiveTab]
  );

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          variant={"default"}
          outline
          icon={
            <Icon className="relative">
              {notifications?.data?.unread_count > 0 && (
                <div className="absolute -top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                  {notifications?.data?.unread_count >= 10 ? "+9" : notifications?.data?.unread_count}
                </div>
              )}
              <OutlineBellIcon />
            </Icon>
          }
          className="ltr:mr-2 rtl:ml-2"
          ghost
        />
      </Dropdown.Trigger>

      <Dropdown.Menu
        className="py-4"
        style={{
          minWidth: "300px",
          maxWidth: "512px"
        }}
      >
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <Typography.Paragraph
              size="lg"
              weight="medium"
              children={t("notifications.title")}
            />
            <Button
              variant="link"
              className="p-0 text-xs text-primary"
              disabled={isSubmitting || notifications?.data?.unread_count == 0}
              onClick={() => {
                setIsSubmitting(true);
                markAllAsRead();
              }}
              children={t("notifications.mark_all_as_read")}
            />
          </div>
          <div className="relative">
            <div className="mb-3 flex items-center  after:absolute after:bottom-0 after:h-[2px]  after:w-full after:bg-gray-400 after:content-['']">
              <Button
                size="md"
                variant={"default"}
                onClick={() => {
                  onTabChange("all");
                }}
                className={classNames(
                  currentActiveTab == "all"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-transparent text-gray-800",
                  "relative z-[10] !mb-0 !rounded-none border-0 border-b-2 border-transparent"
                )}
                children={t(`notifications.all`)}
              />
              <Button
                size="md"
                variant={"default"}
                onClick={() => {
                  onTabChange("unread");
                }}
                className={classNames(
                  currentActiveTab == "unread"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-transparent text-gray-800",
                  "relative z-[10] !mb-0 !rounded-none border-0 border-b-2 border-transparent"
                )}
                children={t(`notifications.unseen`)}
              />
            </div>
          </div>

          <div className="flex max-h-[30rem] flex-col overflow-y-scroll">
            {!loading ? (
              <>
                {notifications?.data?.notifications.length > 0 ? (
                  <>
                    {todayNotifications?.length > 0 && (
                      <>
                        <Notifications
                          title={t("notifications.new")}
                          setUpdatedNotifications={setTodayNotifications}
                          notifications={todayNotifications}
                        />
                      </>
                    )}

                    {oldNotifications?.length > 0 && (
                      <>
                        <Notifications
                          title={t("notifications.old")}
                          setUpdatedNotifications={setOldNotifications}
                          notifications={oldNotifications}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-6 pb-4 pt-8">
                    <Image
                      src="/images/no-notifications.svg"
                      width={260}
                      height={100}
                      alt={"empty"}
                    />

                    <div className="mt-6 flex w-full items-center gap-4 before:h-px before:flex-1 before:bg-gray-400  before:content-[''] after:h-px after:flex-1 after:bg-gray-400  after:content-['']">
                      <Typography.Paragraph
                        size="sm"
                        weight="medium"
                        className="mx-2 flex-shrink"
                        children={
                          currentActiveTab === "unread"
                            ? t("notifications.no_unread_notifications_yet")
                            : t("notifications.no_notifications_yet")
                        }
                      />
                    </div>
                  </div>
                )}
                {notifications?.data?.notifications.length > 0 && (
                  <Button
                    disabled={
                      isFetching ||
                      todayNotifications.length + oldNotifications.length == notifications?.data?.total ||
                      (currentActiveTab === "unread" &&
                        todayNotifications.length + oldNotifications.length == notifications?.data?.unread_count)
                    }
                    isLoading={isFetching}
                    variant={"default"}
                    onClick={async () => {
                      setParams((prevParams) => ({
                        ...prevParams,
                        page: prevParams.page + 1
                      }));
                    }}
                    rounded
                    className="mx-auto"
                  >
                    {t("notifications.load_more")}
                  </Button>
                )}
              </>
            ) : (
              <LoadingCard />
            )}
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default NotificationsDropdown;
