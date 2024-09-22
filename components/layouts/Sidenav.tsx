import React, { Suspense, useContext, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { getCookie } from "cookies-next";
import { isNumber } from "lodash";
import { Trans, useTranslation } from "next-i18next";

import { Sidebar } from "@/components";
import CreateNewProductModal from "@/components/modals/CreateNewProductModal";
import AppLogo from "@/components/shared/AppLogo";
import { AuthContext, SubscriptionContext } from "@/contextes";
import { isCustomizedDomain, useAppSelector, useIsRouteActive } from "@/hooks";
import { useFetchChecklistQuery } from "@/store/slices/api/onboardingSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { classNames } from "@/utils";

import { SwatchIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

import { Badge, Icon, Typography } from "@msaaqcom/abjad";

import MQPlusContact from "../MQPlusContact";

const Squares2X2IconOutline = React.lazy(() => import("@heroicons/react/24/outline/Squares2X2Icon"));
const Squares2X2IconSolid = React.lazy(() => import("@heroicons/react/24/solid/Squares2X2Icon"));
const AcademicCapIconOutline = React.lazy(() => import("@heroicons/react/24/outline/AcademicCapIcon"));
const AcademicCapIconSolid = React.lazy(() => import("@heroicons/react/24/solid/AcademicCapIcon"));
const CurrencyDollarIconOutline = React.lazy(() => import("@heroicons/react/24/outline/CurrencyDollarIcon"));
const CurrencyDollarIconSolid = React.lazy(() => import("@heroicons/react/24/solid/CurrencyDollarIcon"));
const MegaphoneIconOutline = React.lazy(() => import("@heroicons/react/24/outline/MegaphoneIcon"));
const MegaphoneIconSolid = React.lazy(() => import("@heroicons/react/24/solid/MegaphoneIcon"));
const UsersIconOutline = React.lazy(() => import("@heroicons/react/24/outline/UsersIcon"));
const UsersIconSolid = React.lazy(() => import("@heroicons/react/24/solid/UsersIcon"));
const PuzzlePieceIconOutline = React.lazy(() => import("@heroicons/react/24/outline/PuzzlePieceIcon"));
const PuzzlePieceIconSolid = React.lazy(() => import("@heroicons/react/24/solid/PuzzlePieceIcon"));
const Cog6ToothIconOutline = React.lazy(() => import("@heroicons/react/24/outline/Cog6ToothIcon"));
const Cog6ToothIconSolid = React.lazy(() => import("@heroicons/react/24/solid/Cog6ToothIcon"));
const MsaaqPayIconSolid = React.lazy(() => import("@/components/Icons/solid/MsaaqPayIcon"));
const MsaaqPayIconOutline = React.lazy(() => import("@/components/Icons/outline/MsaaqPayIcon"));
const AnalyticsIconOutline = React.lazy(() => import("@heroicons/react/24/outline/ChartBarSquareIcon"));
const AnalyticsIconSolid = React.lazy(() => import("@heroicons/react/24/solid/ChartBarSquareIcon"));

interface MenuItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  active: boolean;
  count?: number;
  badge?: string;
  target?: "_self" | "_blank";
  children?: MenuItem[];
  action?: any;
}

const ProgressBar = ({ value = 0, maxValue = 8, color = "warning" }) => {
  let $color = color;
  const percentage = (value / maxValue) * 100;

  if (percentage <= 40) {
    $color = "warning";
  }
  if (percentage > 40) {
    $color = "info";
  }
  if (percentage == 100) {
    $color = "success";
  }

  return (
    <div className="h-1.5 w-full rounded-full bg-gray-300">
      <div
        className={`bg-${$color} h-1.5 max-w-full rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const OnboardingProgress = () => {
  const { t } = useTranslation();
  const { current_academy } = useContext(AuthContext);
  const [completeChecklist, setCompleteChecklist] = useState<boolean>(false);

  useEffect(() => {
    if (current_academy?.onboarding_tasks_status == "completed") {
      setCompleteChecklist(true);
    }
  }, [current_academy]);

  const router = useRouter();
  const { locale } = router;

  const { data: checklists, isLoading } = useFetchChecklistQuery(
    {
      locale
    },
    {
      skip: current_academy?.onboarding_tasks_status == "completed"
    }
  );
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  useEffect(() => {
    if (!isLoading && checklists && checklists.length > 0) {
      let completedCount = 0;
      let totalCount = 0;

      checklists.forEach((checklist) => {
        checklist.blocks.forEach((block) => {
          block.tasks.forEach((task) => {
            totalCount++;
            if (task.is_completed) {
              completedCount++;
            }
          });
        });
      });

      const checkIfAllChecklistIsCompleted = checklists.every((checklist) => {
        return checklist.blocks.every((block) => {
          return block.tasks.every((task) => task.is_completed);
        });
      });

      if (checkIfAllChecklistIsCompleted) {
        setCompleteChecklist(true);
      }

      setCompletedTasks(completedCount);
      setTotalTasks(totalCount);
    }
  }, [isLoading, checklists]);

  return (
    <>
      {checklists && checklists.length > 0 && !completeChecklist ? (
        <>
          <Link
            href={"/checklist"}
            className="mt-6"
          >
            <div className="flex flex-col gap-2">
              <div
                className={classNames(
                  "text-sm font-medium",
                  current_academy.is_plus ? "text-gray-300" : "text-primary-200"
                )}
              >
                {t("checklist.get_started")}
              </div>
              <ProgressBar
                value={completedTasks}
                maxValue={totalTasks}
              />
              <div
                className={classNames(
                  "text-xs font-normal",
                  current_academy.is_plus ? "text-gray-300" : "text-primary-200"
                )}
              >
                <Trans
                  i18nKey={"checklist.progress"}
                  values={{
                    current: completedTasks,
                    total: totalTasks
                  }}
                  components={{
                    span: <span className="text-xs font-medium" />
                  }}
                />
              </div>
            </div>
          </Link>
          <div
            className={classNames("my-2 h-[1px] ", current_academy.is_plus ? "bg-white/50" : "bg-primary-600")}
          ></div>
        </>
      ) : (
        <div className="pb-6" />
      )}
    </>
  );
};

const SidebarItem = ({ item, ...props }: { item: MenuItem }) => {
  const [isActive, setIsActive] = useState<boolean>(item.active);

  return (
    <Sidebar.Item {...props}>
      <Sidebar.Link
        icon={<Suspense>{item.icon}</Suspense>}
        as={Link}
        href={item.href}
        active={isActive}
        target={item.target || "_self"}
        onClick={(e) => {
          item.action && item.action();
          if (item.children?.length) {
            e.preventDefault();

            setIsActive(!isActive);
          }
        }}
      >
        <Trans i18nKey={`sidebar.${item.name}`} />

        {item?.badge && (
          <Badge
            size="xs"
            variant="success"
            rounded={true}
            className="mr-auto"
            children={<Trans i18nKey={item.badge} />}
          />
        )}
      </Sidebar.Link>

      {item.children && item.children.length > 0 && isActive && (
        <Sidebar.Item light={true}>
          {item.children.map((child, x) => (
            <>
              <Sidebar.Link
                key={x}
                as={Link}
                href={child.href}
                active={child.active}
              >
                <Trans i18nKey={`sidebar.${child.name}`} />
                {isNumber(child.count) && child.count > 0 && (
                  <Badge
                    className="mr-2 !bg-gray-900 text-white"
                    size="xs"
                    rounded
                    children={child.count}
                  />
                )}
                {child?.badge && (
                  <Badge
                    size="xs"
                    variant="success"
                    rounded={true}
                    className="mr-auto flex-shrink-0"
                    children={<Trans i18nKey={child.badge} />}
                  />
                )}
              </Sidebar.Link>
            </>
          ))}
        </Sidebar.Item>
      )}
    </Sidebar.Item>
  );
};

const Sidenav = () => {
  const { t } = useTranslation();
  const { isActive } = useIsRouteActive();
  const { hasPermission, current_academy } = useContext(AuthContext);
  const [show, setShow] = useState<boolean>(false);
  const { msaaqpay, entityStatus } = useAppSelector<AppSliceStateType>((state) => state.app);

  const menu = [
    {
      name: "main",
      icon: isActive("/") ? <Squares2X2IconSolid /> : <Squares2X2IconOutline />,
      href: "/",
      active: isActive("/")
    },
    hasPermission("courses.*", "products.*", "blog.*", "blog.*", "products-coaching-sessions.*") && {
      name: "manage_content.title",
      icon: isActive([
        "/courses",
        "/products",
        "/coaching-sessions",
        "/taxonomies/categories",
        "/taxonomies/levels",
        "/bundles",
        "/video-library",
        "/blog",
        "/quizzes/bank"
      ]) ? (
        <AcademicCapIconSolid />
      ) : (
        <AcademicCapIconOutline />
      ),
      href: "/courses",
      active: isActive([
        "/courses",
        "/products",
        "/coaching-sessions",
        "/taxonomies/categories",
        "/taxonomies/levels",
        "/bundles",
        "/video-library",
        "/blog",
        "/quizzes/bank"
      ]),
      children: [
        hasPermission("courses.*") && {
          name: "manage_content.courses",
          href: "/courses",
          active: isActive(["/courses"])
        },
        hasPermission("products.*") && {
          name: "manage_content.digital_products",
          href: "/products",
          active: isActive(["/products"])
        },
        hasPermission("products-coaching-sessions.*")
          ? {
              name: "manage_content.coaching_sessions",
              href: "/coaching-sessions",
              active: isActive(["/coaching-sessions"]),
              count: current_academy?.appointments_count
            }
          : null,
        hasPermission("products.*") && {
          name: "manage_content.bundles",
          href: "/bundles",
          active: isActive(["/bundles"])
        },
        hasPermission("categories.*") && {
          name: "manage_content.taxonomies",
          href: "/taxonomies/categories",
          active: isActive(["/taxonomies/categories", "/taxonomies/levels"])
        },
        hasPermission("courses.*") && {
          name: "manage_content.quizzes_bank",
          href: "/quizzes/bank",
          active: isActive(["/quizzes/bank"])
        },
        hasPermission("courses.*") && {
          name: "manage_content.video_library",
          href: "/video-library",
          active: isActive(["/video-library"])
        },
        hasPermission("blog.*") && {
          name: "manage_content.blog",
          href: "/blog",
          active: isActive(["/blog"])
        }
      ].filter(Boolean)
    },
    hasPermission("orders.*") && {
      name: "orders.title",
      icon: isActive(["/orders"]) ? <CurrencyDollarIconSolid /> : <CurrencyDollarIconOutline />,
      href: "/orders",
      active: isActive(["/orders"])
    },
    hasPermission("builder.*") && {
      name: "customization.title",
      icon: <SwatchIcon />,
      href: "#",
      action: () =>
        window.open(
          `${process.env.NEXT_PUBLIC_BUILDER_URL}?current_academy=${current_academy.id}&access_token=${getCookie(
            "mq_access_token"
          )}&dashboard_url=${window.location.origin}`,
          "_blank"
        ),
      active: false
    },
    hasPermission("msaaqpay.*") && {
      name: "msaaq_pay.title",
      icon: isActive(["/msaaq-pay"]) ? <MsaaqPayIconSolid /> : <MsaaqPayIconOutline />,
      href: "/msaaq-pay",
      active: isActive(["/msaaq-pay"]),
      children: [
        hasPermission("msaaqpay.dashboard") && {
          name: "msaaq_pay.main",
          href: "/msaaq-pay",
          active: isActive("/msaaq-pay")
        },
        hasPermission("msaaqpay.transactions") &&
          msaaqpay && {
            name: "msaaq_pay.transactions",
            href: "/msaaq-pay/transactions",
            active: isActive(["/msaaq-pay/transactions"])
          },
        hasPermission("msaaqpay.dashboard") &&
          msaaqpay && {
            name: "msaaq_pay.payouts",
            href: "/msaaq-pay/payouts",
            active: isActive(["/msaaq-pay/payouts"])
          },
        hasPermission("msaaqpay.manage") &&
          msaaqpay?.installed && {
            name: "msaaq_pay.settings",
            href: "/msaaq-pay/settings",
            active: isActive(["/msaaq-pay/settings"])
          }
      ].filter(Boolean)
    },
    hasPermission("coupons.*", "affiliate.*", "abandoned-carts.*") && {
      name: "marketing.title",
      icon: isActive(["/marketing"]) ? <MegaphoneIconSolid /> : <MegaphoneIconOutline />,
      href: "/marketing/coupons",
      badge: "new",
      active: isActive([
        "/marketing",
        "/marketing/coupons",
        "/marketing/coupons/{id}/stats",
        "/marketing/affiliates",
        "abandoned-carts",
        "/marketing/campaigns"
      ]),
      children: [
        hasPermission("coupons.*") && {
          name: "marketing.coupons",
          href: "/marketing/coupons",
          active: isActive(["/marketing/coupons"])
        },
        hasPermission("affiliate.*") && {
          name: "marketing.affiliates",
          href: "/marketing/affiliates/payouts",
          active: isActive(["/marketing/affiliates"])
        },
        /*hasPermission("abandoned-carts.*") && {
          name: "marketing.abandoned_carts",
          href: "/marketing/abandoned-carts",
          active: isActive(["/marketing/abandoned-carts"])
        }*/
        {
          name: "marketing.abandoned_carts",
          href: "/marketing/abandoned-carts",
          active: isActive(["/marketing/abandoned-carts"]),
          badge: "new"
        },
        {
          name: "marketing.campaigns",
          href: "/marketing/campaigns",
          active: isActive(["/marketing/campaigns"]),
          badge: "new"
        }
      ].filter(Boolean)
    },
    hasPermission("members.*") && {
      name: "students.title",
      icon: isActive(["/students"]) ? <UsersIconSolid /> : <UsersIconOutline />,
      href: "/students",
      active: isActive(["/students"]),
      children: [
        {
          name: "students.students",
          href: "/students",
          active: isActive("/students")
        },
        hasPermission("members.certificates.*") && {
          name: "students.certificates",
          href: "/students/certificates",
          active: isActive("/students/certificates")
        },
        hasPermission("members.*") && {
          name: "comments.title",
          href: "/students/comments",
          active: isActive("/students/comments")
        },
        hasPermission("members.assignments.*") && {
          name: "students.assignments",
          href: "/students/assignments",
          active: isActive("/students/assignments")
        },
        hasPermission("members.quizzes.*") && {
          name: "students.quizzes",
          href: "/students/quizzes",
          active: isActive("/students/quizzes")
        },
        hasPermission("members.quizzes.*") && {
          name: "students.surveys",
          href: "/students/surveys",
          active: isActive("/students/surveys")
        },
        hasPermission("members.notifications") && {
          name: "students.notifications",
          href: "/students/notifications",
          active: isActive(["/students/notifications"])
        }
      ].filter(Boolean)
    },
    hasPermission("analytics.*") && {
      name: "analytics.title",
      icon: isActive(["/analytics"]) ? <AnalyticsIconSolid /> : <AnalyticsIconOutline />,
      href: "/analytics/products",
      active: isActive(["/analytics"])
    },
    hasPermission("marketing-apps.*") && {
      name: "apps.title",
      icon: isActive(["/apps"]) ? <PuzzlePieceIconSolid /> : <PuzzlePieceIconOutline />,
      href: "/apps",
      active: isActive(["/apps"])
    },
    hasPermission("settings.*") && {
      name: "settings.title",
      icon: isActive(["/settings"]) ? <Cog6ToothIconSolid /> : <Cog6ToothIconOutline />,
      href: "/settings",
      active: isActive(["/settings"]),
      children: [
        hasPermission("settings.general") && {
          name: "settings.settings.title",
          href: "/settings",
          active:
            isActive(["/settings"]) &&
            !isActive([
              "/settings/payment-gateways",
              "/settings/team",
              "/settings/billing",
              "/settings/verify",
              "/settings/domain"
            ])
        },
        hasPermission("settings.domain") && {
          name: "settings.domain.title",
          href: "/settings/domain",
          active: isActive(["/settings/domain"])
        },
        hasPermission("settings.payment") && {
          name: "settings.payment_gateways",
          href: "/settings/payment-gateways",
          active: isActive("/settings/payment-gateways")
        },
        hasPermission("users.*") && {
          name: "settings.team",
          href: "/settings/team",
          active: isActive("/settings/team")
        },
        hasPermission("settings.subscription") && {
          name: "settings.billing.title",
          href: "/settings/billing/subscription",
          active: isActive(["/settings/billing"])
        },
        hasPermission("settings.verification") && {
          name: "settings.verify",
          href: entityStatus ? "/settings/verify/status" : "/settings/verify",
          active: isActive(["/settings/verify"])
        }
      ].filter(Boolean)
    }
  ].filter(Boolean);

  const { canUseOffer } = useContext(SubscriptionContext);

  return (
    <>
      <Sidebar
        brand={
          <Sidebar.Brand>
            <Link href="/">
              <AppLogo
                defaultLogo={
                  isCustomizedDomain()
                    ? current_academy.logo
                    : current_academy.is_plus
                    ? "/images/mqplus.svg"
                    : "/images/msaaq-logo-light.svg"
                }
                width={62}
                height={26}
              />
            </Link>
          </Sidebar.Brand>
        }
        prepend={
          <>
            <Sidebar.Button
              onClick={() => {
                setShow(true);
              }}
            >
              <Typography.Paragraph
                size="md"
                weight="bold"
                children={t("add_new")}
              />
              <Icon
                size="md"
                className="mr-auto"
                children={<PlusCircleIcon />}
              />
            </Sidebar.Button>
            <OnboardingProgress />
          </>
        }
        append={
          <>
            {canUseOffer && (
              <Link
                href={"/settings/billing/subscription/plans?interval=yearly"}
                className="mb-4"
              >
                <img
                  src={"https://cdn.msaaq.com/assets/images/banner/ksa-93.png"}
                  alt={"عرض اليوم الوطني"}
                />
              </Link>
            )}

            {current_academy.is_plus && !isCustomizedDomain() && <MQPlusContact />}
          </>
        }
      >
        {menu.map((item, i) => (
          <SidebarItem
            // @ts-ignore
            item={item}
            key={i}
          />
        ))}
      </Sidebar>

      <CreateNewProductModal
        open={show}
        onDismiss={() => {
          setShow(false);
        }}
      />
    </>
  );
};

export default Sidenav;
