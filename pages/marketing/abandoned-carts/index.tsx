import { useContext, useMemo } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CartsCols from "@/columns/carts";
import { AddonController, Card, Datatable, EmptyStateTable, Layout } from "@/components";
import { AuthContext } from "@/contextes";
import { useDataExport, useFormatPrice, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useDeleteReminderMutation,
  useFetchCartsQuery,
  useFetchRemindersQuery,
  useFetchStatsQuery,
  useUpdateReminderMutation
} from "@/store/slices/api/abandonedCartsSlice";
import { APIActionResponse, Reminder, ReminderStatus } from "@/types";
import { CouponType } from "@/types/models/coupon";
import { classNames } from "@/utils";

import {
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  PencilSquareIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Button, Dropdown, Form, Grid, Icon, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function AbandonedCarts({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();

  const { formatPriceWithoutCurrency, currentCurrencyLocalizeSymbol, formatPrice } = useFormatPrice();
  const [exportCoupons] = useDataExport();
  const { display } = useResponseToastHandler({});
  const { current_academy } = useContext(AuthContext);

  const totalAvailableRemindersLimit = current_academy.addons.find(
    (addon) => addon.slug === "carts.abandoned.reminders"
  )?.limit;

  const { data: statsData } = useFetchStatsQuery();
  const { data: reminders } = useFetchRemindersQuery();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
  const [deleteReminder, { isLoading: isDeleting }] = useDeleteReminderMutation();
  const canAddMoreReminders = useMemo(() => {
    if (!reminders) return false;
    return reminders.data.length < (totalAvailableRemindersLimit ?? 0);
  }, [reminders, totalAvailableRemindersLimit]);

  const handleExport = async (tableInstance: any) => {
    exportCoupons({
      endpoint: "/carts/export",
      name: "abandoned_carts",
      ids: tableInstance.selectedFlatRows.map((row: any) => row.original.id)
    });
  };
  const onChangeHandler = async ({ id, status }: Pick<Reminder, "id" | "status">) => {
    const response = (await updateReminder({
      id,
      status
    })) as APIActionResponse<Reminder>;

    display(response);
  };

  return (
    <Layout title={t("marketing.abandoned_carts.title")}>
      <Layout.Container>
        <AddonController addon="carts.abandoned">
          <Grid
            className="mb-6"
            columns={{
              sm: 1,
              md: 2,
              lg: 4
            }}
            gap={{
              md: "1rem",
              lg: "1rem",
              xl: "1rem"
            }}
          >
            <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
              <div className="mb-6">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  children={t("marketing.abandoned_carts.title")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Typography.Heading
                  as="h3"
                  size="sm"
                  weight="bold"
                >
                  {statsData && statsData?.abandoned_carts > 0 ? statsData?.abandoned_carts : "-"}
                  <Typography.Paragraph
                    as="span"
                    size="md"
                    weight="medium"
                    className="mr-2.5 text-gray-700"
                    children={t("marketing.abandoned_carts.carts")}
                  />
                </Typography.Heading>
              </div>
            </Grid.Cell>
            <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
              <div className="mb-6">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  children={t("marketing.abandoned_carts.potential_revenue")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Typography.Heading
                  as="h3"
                  size="sm"
                  weight="bold"
                >
                  {statsData && statsData?.potential_revenues > 0
                    ? formatPriceWithoutCurrency(statsData?.potential_revenues as number)
                    : "-"}

                  <Typography.Paragraph
                    as="span"
                    size="md"
                    weight="medium"
                    className="mr-2.5 text-gray-700"
                    children={currentCurrencyLocalizeSymbol}
                  />
                </Typography.Heading>
              </div>
            </Grid.Cell>
            <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
              <div className="mb-6">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  children={t("marketing.abandoned_carts.recovered_carts")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Typography.Heading
                  as="h3"
                  size="sm"
                  weight="bold"
                >
                  {statsData && statsData?.recovered_carts > 0 ? statsData?.recovered_carts : "-"}

                  <Typography.Paragraph
                    as="span"
                    size="md"
                    weight="medium"
                    className="mr-2.5 text-gray-700"
                    children={t("marketing.abandoned_carts.carts")}
                  />
                </Typography.Heading>
              </div>
            </Grid.Cell>
            <Grid.Cell className="box-border rounded-md border border-gray-300 bg-white p-6">
              <div className="mb-6">
                <Typography.Paragraph
                  as="span"
                  size="md"
                  children={t("marketing.abandoned_carts.recovered_revenue")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Typography.Heading
                  as="h3"
                  size="sm"
                  weight="bold"
                >
                  {statsData && statsData?.recovered_revenues > 0
                    ? formatPriceWithoutCurrency(statsData?.recovered_revenues as number)
                    : "-"}

                  <Typography.Paragraph
                    as="span"
                    size="md"
                    weight="medium"
                    className="mr-2.5 text-gray-700"
                    children={currentCurrencyLocalizeSymbol}
                  />
                </Typography.Heading>
              </div>
            </Grid.Cell>
          </Grid>
          <AddonController addon="carts.abandoned.reminders">
            <Card className="mb-6">
              <Card.Header
                className={classNames(
                  (!reminders || (reminders && reminders.data.length == 0)) && "!border-0",
                  "flex flex-row items-center justify-between md:flex-row "
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray p-2">
                    <Icon
                      size="sm"
                      children={<BellIcon />}
                    />
                  </div>
                  <Typography.Paragraph
                    as="span"
                    size="lg"
                    weight="medium"
                  >
                    <Trans
                      i18nKey={
                        reminders && reminders.data.length > 0
                          ? "marketing.abandoned_carts.reminders_other"
                          : "marketing.abandoned_carts.reminders_zero"
                      }
                      values={{
                        count: (reminders && reminders.data.length) ?? 0,
                        total: totalAvailableRemindersLimit ?? "-"
                      }}
                      components={{
                        span: <span className="text-gray-700" />
                      }}
                    />
                  </Typography.Paragraph>
                </div>

                {canAddMoreReminders ? (
                  <Button
                    as={Link}
                    href="/marketing/abandoned-carts/reminders/create"
                    variant="primary"
                    size="md"
                    icon={
                      <Icon
                        size="md"
                        children={<PlusIcon />}
                      />
                    }
                  >
                    {t("marketing.abandoned_carts.create_new_reminder")}
                  </Button>
                ) : (
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Button
                        disabled
                        size="md"
                        icon={
                          <div className="rounded-full bg-white p-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="none"
                              className="h-4 w-4"
                            >
                              <path
                                d="M13.1669 11.2265L12.9287 12.2595C12.88 12.4702 12.6924 12.6193 12.4761 12.6193H3.19059C2.97424 12.6193 2.78667 12.4702 2.73792 12.2595L2.49975 11.2265H13.1669ZM14.3216 6.22391L13.3814 10.2979H2.28526L1.3451 6.22391C1.30378 6.04423 1.37249 5.85667 1.5206 5.74663C1.66916 5.6366 1.86834 5.62499 2.02805 5.71646L4.90144 7.35859L7.44659 3.54087C7.52969 3.41644 7.66712 3.33937 7.81615 3.3338C7.96657 3.3273 8.10818 3.39509 8.19964 3.51301L11.1845 7.3507L13.6112 5.73317C13.7695 5.62824 13.9761 5.62917 14.1326 5.73735C14.2895 5.84552 14.3638 6.03866 14.3216 6.22391Z"
                                fill="url(#paint0_linear_23789_16473)"
                              />
                              <defs>
                                <linearGradient
                                  id="paint0_linear_23789_16473"
                                  x1="16.852"
                                  y1="-1.5827"
                                  x2="-4.80792"
                                  y2="-0.040733"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#7EDC88" />
                                  <stop
                                    offset="1"
                                    stopColor="#1770F5"
                                  />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        }
                      >
                        {t("marketing.abandoned_carts.create_new_reminder")}
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t("marketing.abandoned_carts.create_new_reminder_tooltip")}</Tooltip.Content>
                  </Tooltip>
                )}
              </Card.Header>
              <Card.Body className="divide-y divide-gray-300 !p-0">
                {reminders &&
                  reminders.data.map((reminder, index) => (
                    <div
                      key={index}
                      className={classNames(
                        "relative flex flex-row items-center justify-between gap-4 p-4 before:absolute before:bottom-4 before:top-4 before:w-1 before:rounded-sm before:bg-primary ltr:before:left-4 rtl:before:right-4",
                        reminder.status === ReminderStatus.INACTIVE && "opacity-40"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-4 ltr:ml-4 rtl:mr-4">
                        <Typography.Paragraph
                          size="lg"
                          className="font-semibold"
                        >
                          {t("marketing.abandoned_carts.reminder_abandonment_duration", {
                            days: reminder.abandonment_duration
                          })}
                        </Typography.Paragraph>
                        {reminder.discount > 0 && (
                          <>
                            <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                              <Icon
                                size="sm"
                                className="text-gray-900"
                              >
                                <ClockIcon />
                              </Icon>
                              <Typography.Paragraph size="sm">
                                <Trans
                                  i18nKey="marketing.abandoned_carts.reminder_discount_duration"
                                  values={{ hours: reminder.discount_duration }}
                                  components={{
                                    span: <span className="text-gray-800" />
                                  }}
                                />
                              </Typography.Paragraph>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                              <Icon
                                size="sm"
                                className="text-gray-900"
                              >
                                <CreditCardIcon />
                              </Icon>
                              <Typography.Paragraph size="sm">
                                <Trans
                                  i18nKey="marketing.abandoned_carts.reminder_discount"
                                  values={{
                                    discount:
                                      reminder.discount_type === CouponType.PERCENTAGE
                                        ? `${reminder.discount}%`
                                        : formatPrice(reminder.discount)
                                  }}
                                  components={{
                                    span: <span className="text-gray-800" />
                                  }}
                                />
                              </Typography.Paragraph>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                          <Icon
                            size="sm"
                            className="text-gray-900"
                          >
                            <ShoppingCartIcon />
                          </Icon>
                          <Typography.Paragraph size="sm">
                            <Trans
                              i18nKey="marketing.abandoned_carts.reminder_cart_min_total"
                              values={{ total: formatPrice(reminder.cart_min_total) }}
                              components={{
                                span: <span className="text-gray-800" />
                              }}
                            />
                          </Typography.Paragraph>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Form.Toggle
                          id={`toggle-reminder-${reminder.id}`}
                          name={`toggle-reminder-${reminder.id}`}
                          checked={reminder.status === ReminderStatus.ACTIVE}
                          disabled={isUpdating}
                          onChange={(e) =>
                            onChangeHandler({
                              id: reminder.id,
                              status: e.target.checked ? ReminderStatus.ACTIVE : ReminderStatus.INACTIVE
                            })
                          }
                        />
                        <Dropdown>
                          <Dropdown.Trigger>
                            <Button
                              variant="default"
                              size="sm"
                              icon={
                                <Icon
                                  size="md"
                                  children={<EllipsisHorizontalIcon />}
                                />
                              }
                            />
                          </Dropdown.Trigger>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              as={Link}
                              href={`/marketing/abandoned-carts/reminders/${reminder.id}/edit`}
                              children={t("marketing.abandoned_carts.edit_reminder")}
                              iconAlign="end"
                              icon={
                                <Icon
                                  size="sm"
                                  children={<PencilSquareIcon />}
                                />
                              }
                            />
                            <Dropdown.Divider />
                            <Dropdown.Item
                              children={t("marketing.abandoned_carts.delete_reminder")}
                              className="text-danger"
                              iconAlign="end"
                              icon={
                                <Icon
                                  size="sm"
                                  children={<TrashIcon />}
                                />
                              }
                              disabled={isDeleting}
                              onClick={() => deleteReminder(reminder.id)}
                            />
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  ))}
              </Card.Body>
            </Card>
          </AddonController>
          <Datatable
            fetcher={useFetchCartsQuery}
            params={{
              filters: {
                type: "abandoned"
              }
            }}
            columns={{
              columns: CartsCols
            }}
            emptyState={
              <EmptyStateTable
                title={t("marketing.abandoned_carts.empty_state.title")}
                content={t("marketing.abandoned_carts.empty_state.description")}
                icon={<StarIcon />}
                children={
                  canAddMoreReminders ? (
                    <Button
                      as={Link}
                      href="/marketing/abandoned-carts/reminders/create"
                      variant="primary"
                      size="md"
                      icon={
                        <Icon
                          size="md"
                          children={<PlusIcon />}
                        />
                      }
                    >
                      {t("marketing.abandoned_carts.create_new_reminder")}
                    </Button>
                  ) : (
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          disabled
                          size="md"
                          icon={
                            <div className="rounded-full bg-white p-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M13.1669 11.2265L12.9287 12.2595C12.88 12.4702 12.6924 12.6193 12.4761 12.6193H3.19059C2.97424 12.6193 2.78667 12.4702 2.73792 12.2595L2.49975 11.2265H13.1669ZM14.3216 6.22391L13.3814 10.2979H2.28526L1.3451 6.22391C1.30378 6.04423 1.37249 5.85667 1.5206 5.74663C1.66916 5.6366 1.86834 5.62499 2.02805 5.71646L4.90144 7.35859L7.44659 3.54087C7.52969 3.41644 7.66712 3.33937 7.81615 3.3338C7.96657 3.3273 8.10818 3.39509 8.19964 3.51301L11.1845 7.3507L13.6112 5.73317C13.7695 5.62824 13.9761 5.62917 14.1326 5.73735C14.2895 5.84552 14.3638 6.03866 14.3216 6.22391Z"
                                  fill="url(#paint0_linear_23789_16473)"
                                />
                                <defs>
                                  <linearGradient
                                    id="paint0_linear_23789_16473"
                                    x1="16.852"
                                    y1="-1.5827"
                                    x2="-4.80792"
                                    y2="-0.040733"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stopColor="#7EDC88" />
                                    <stop
                                      offset="1"
                                      stopColor="#1770F5"
                                    />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                          }
                        >
                          {t("marketing.abandoned_carts.create_new_reminder")}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{t("marketing.abandoned_carts.create_new_reminder_tooltip")}</Tooltip.Content>
                    </Tooltip>
                  )
                }
              />
            }
            toolbar={(instance) => (
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
              >
                <Typography.Paragraph
                  size="md"
                  weight="medium"
                  children={t("export")}
                />
              </Button>
            )}
          />
        </AddonController>
      </Layout.Container>
    </Layout>
  );
}
