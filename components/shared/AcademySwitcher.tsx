import { Fragment, useContext, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { AuthContext } from "@/contextes";
import { useAppSelector } from "@/hooks";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { classNames, firstName } from "@/utils";

import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  EyeIcon,
  GiftIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  ReceiptPercentIcon
} from "@heroicons/react/24/outline";
import { ArrowRightIcon, CheckBadgeIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

import { Avatar, Badge, Button, Dropdown, Header, Icon, Title, Typography } from "@msaaqcom/abjad";

const AcademySwitcher = ({ hasChevronDownIcon = true }: { hasChevronDownIcon?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useContext(AuthContext);
  const { switchAcademy, logout, user, current_academy, academies } = useContext(AuthContext);
  const { headerTitle, backLink, entityStatus } = useAppSelector<AppSliceStateType>((state) => state.app);
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <button role="button">
            <Title
              title={
                <>
                  <div className="hidden flex-col text-start sm:flex">
                    <Typography.Paragraph
                      children={t("user_dropdown.hello")}
                      as="span"
                      size="sm"
                    />
                    <Typography.Paragraph
                      children={firstName(user?.name)}
                      as="span"
                      size="lg"
                    />
                  </div>
                </>
              }
              prepend={
                <div className="relative">
                  <Avatar
                    className={classNames(current_academy.is_plus && "ring-[3px] text-black ring-warning")}
                    name={user?.name}
                    imageUrl={user?.avatar?.url}
                  />

                  <Avatar
                    className="absolute bottom-[-3px] text-black right-[-6px] h-[18px] w-[18px] border-2 border-secondary"
                    name={current_academy.title}
                    imageUrl={current_academy.favicon}
                  />
                </div>
              }
              append={
                hasChevronDownIcon && (
                  <Icon>
                    <ChevronDownIcon />
                  </Icon>
                )
              }
            />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Menu
          style={{
            minWidth: "248px"
          }}
        >
          {academies.map((academy) => (
            <Dropdown.Item
              key={academy.id}
              className="!justify-start bg-transparent hover:bg-primary-50"
              iconAlign="start"
              icon={
                <div>
                  <Avatar
                    name={academy.title}
                    imageUrl={academy.favicon}
                    size="md"
                    className="ml-2 border-2 border-secondary"
                    disabled={current_academy.id !== academy.id}
                  />
                </div>
              }
              onClick={() => switchAcademy(academy.id)}
            >
              <>
                <div className="flex w-full items-center justify-between">
                  <Typography.Paragraph
                    size="lg"
                    className={current_academy.id !== academy.id ? "text-gray-700" : ""}
                    children={academy.title}
                  />

                  {current_academy.id === academy.id && (
                    <Button
                      as="a"
                      size="sm"
                      href={`//${academy.domain}`}
                      target="_blank"
                      variant="default"
                      className="ltr:ml-auto rtl:mr-auto"
                      icon={
                        <Icon
                          size="sm"
                          children={<EyeIcon />}
                        />
                      }
                    />
                  )}
                </div>
              </>
            </Dropdown.Item>
          ))}

          <Dropdown.Item className="!bg-transparent">
            <>
              <Button
                variant="default"
                className="w-full"
                children={t("user_dropdown.create_new_academy")}
                onClick={() => {
                  setShow(true);
                }}
              />
            </>
          </Dropdown.Item>

          <Dropdown.Divider />
          {hasPermission("settings.verification") && (
            <Dropdown.Item
              className="!bg-transparent !p-0"
              as={Link}
              href={entityStatus ? "/settings/verify/status" : "/settings/verify"}
            >
              <>
                <div className="flex w-full flex-col bg-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    {entityStatus ? (
                      <div className="ml-4 flex items-center gap-1">
                        <Icon
                          className={classNames(entityStatus.action === "approved" && "text-success")}
                          children={
                            entityStatus.action === "approved" ? <CheckCircleIcon /> : <InformationCircleIcon />
                          }
                        />
                        <Typography.Paragraph
                          className="max-w-[200px]"
                          children={t(`academy_verification.dropdown_status.${entityStatus.action}`)}
                        />
                      </div>
                    ) : (
                      <div className="ml-4 flex items-center gap-1">
                        <Icon
                          className="text-info"
                          children={<CheckBadgeIcon />}
                        />
                        <Typography.Paragraph children={t("academy_verification.status.start_verification")} />
                      </div>
                    )}

                    <Icon
                      size="sm"
                      children={i18n?.dir() === "rtl" ? <ArrowLeftIcon /> : <ArrowRightIcon />}
                    />
                  </div>
                  <div className="mt-3 h-1 w-full rounded-full bg-gray-400">
                    <div
                      className={classNames(
                        "h-1 rounded-full",
                        !entityStatus && "bg-info",
                        entityStatus?.action === "approved" && "bg-success",
                        entityStatus?.action === "declined" && "bg-danger",
                        entityStatus?.action === "pending" && "bg-warning",
                        entityStatus?.action === "submitted" && "bg-warning"
                      )}
                      style={{
                        width: `${entityStatus?.progress || 5}%`
                      }}
                    />
                  </div>
                </div>
              </>
            </Dropdown.Item>
          )}

          <Dropdown.Item
            children={t("user_dropdown.profile")}
            as={Link}
            href="/profile"
            className="!justify-start"
            iconAlign="start"
            icon={
              <Avatar
                name={user?.name}
                imageUrl={user?.avatar?.url}
                size="sm"
                className="ml-2"
              />
            }
          />

          {hasPermission("settings.subscription") && (
            <Dropdown.Item
              as={Link}
              href="/settings/billing/subscription"
              children={t("user_dropdown.subscription")}
              className="!justify-start"
              iconAlign="start"
              icon={
                <Icon
                  size="md"
                  className="ml-2"
                  children={<ReceiptPercentIcon />}
                />
              }
            />
          )}
          <Dropdown.Item
            as={Link}
            children={
              <div className="flex">
                <span>{t("affiliates.affiliates")}</span>
                <Badge
                  className="absolute left-2 top-1/2 -translate-y-1/2 transform"
                  variant="success"
                  size="xs"
                  rounded
                  children={t("new")}
                />
              </div>
            }
            className="relative !justify-start"
            iconAlign="start"
            href="/affiliates"
            icon={
              <Icon
                size="md"
                className="ml-2"
                children={<GiftIcon />}
              />
            }
          />
          <Dropdown.Item
            as="a"
            children={
              <Fragment>
                <div className="flex w-full items-center justify-between">
                  <Typography.Paragraph as="span">{t("user_dropdown.helpdesk")}</Typography.Paragraph>
                  <Icon
                    size="sm"
                    children={<ArrowUpRightIcon />}
                  />
                </div>
              </Fragment>
            }
            className="!justify-start"
            iconAlign="start"
            target="_blank"
            href="https://help.msaaq.com/ar"
            icon={
              <Icon
                size="md"
                className="ml-2"
                children={<QuestionMarkCircleIcon />}
              />
            }
          />

          <Dropdown.Item
            as="a"
            href="https://msaaq.com/releases"
            target="_blank"
            className="!justify-start"
            iconAlign="start"
            icon={
              <Icon
                size="md"
                className="ml-2"
                children={<MegaphoneIcon />}
              />
            }
          >
            <Fragment>
              <div className="flex w-full items-center justify-between">
                <Typography.Paragraph as="span">{t("user_dropdown.changelog")}</Typography.Paragraph>
                <Icon
                  size="sm"
                  children={<ArrowUpRightIcon />}
                />
              </div>
            </Fragment>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            children={t("user_dropdown.logout")}
            className="text-danger"
            onClick={() => {
              logout();
            }}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
export default AcademySwitcher;
