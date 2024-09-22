import { useContext, useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { createPortal } from "react-dom";

import { Card } from "@/components";
import { AuthContext } from "@/contextes";
import { useResponseToastHandler } from "@/hooks";
import { useMarkStepAsReadMutation } from "@/store/slices/api/onboardingSlice";
import { APIActionResponse } from "@/types";
import { OnboardingData } from "@/types/models/onboarding";

import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

type Step = {
  id: number;
  title: string;
  subtitle: string;
  action_text: string;
  action_url: string;
  image: any;
  is_read: boolean;
};

const UncheckedIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <rect
        x="4"
        y="4"
        width="12"
        height="12"
        rx="6"
        stroke="#CAD3D1"
        strokeWidth="4"
      />
    </svg>
  );
};
const InProgressIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="7"
        stroke="#CAD3D1"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray="3 3"
      />
    </svg>
  );
};

const ItemCard = ({
  item,
  title,
  onChange
}: {
  item: OnboardingData;
  title: string;
  onChange: (item: OnboardingData) => void;
}) => {
  const readStep = item.steps.filter((step: any) => step.is_read === true).length;
  return (
    <div
      onClick={() => {
        onChange(item);
      }}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary-50 p-5"
    >
      {readStep == item.steps.length ? (
        <Icon className="text-success">
          <CheckCircleIcon />
        </Icon>
      ) : (
        <img src="/images/dotted-icon.svg" />
      )}
      <Typography.Paragraph
        size="md"
        className="text-primary"
        weight="medium"
        children={title}
      />
      <Icon className="mr-auto">
        <ArrowLeftIcon />
      </Icon>
    </div>
  );
};

const NestedSteps = ({ item }: { item: OnboardingData }) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [updateStep] = useMarkStepAsReadMutation();
  const { displayErrors } = useResponseToastHandler({});

  const markAsRead = async (step: Step) => {
    if (!step.is_read) {
      const response = (await updateStep({ step_id: step.id })) as APIActionResponse<any>;
      if (displayErrors(response)) {
        return;
      }
    }
    if (currentStepIndex !== item.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  return (
    <div className="flex animate-fadeIn flex-col gap-1 overflow-hidden">
      {item.steps.map((step: Step, index: number) => {
        let isSelected = currentStepIndex === index;

        return (
          <div
            key={index}
            className="overflow-hidden"
          >
            <div
              onClick={() => setCurrentStepIndex(index)}
              className={"flex cursor-pointer items-center gap-2 text-sm"}
            >
              {step.is_read ? (
                <Icon className="h-5 w-5">
                  <CheckCircleIcon className="text-success" />
                </Icon>
              ) : isSelected ? (
                <UncheckedIcon />
              ) : (
                <InProgressIcon />
              )}
              <Typography.Paragraph
                size="md"
                className={!step.is_read || isSelected ? "!font-medium" : "font-normal text-gray-800"}
                children={step.title}
              />
            </div>
            {isSelected && (
              <div className="grid animate-fadeIn">
                <div
                  className={"my-5 flex flex-col items-start gap-4 overflow-hidden rounded-lg bg-gray-100 px-4 py-6"}
                >
                  <img
                    className="h-[56px]"
                    src={step.image.url}
                    alt={step.title}
                  />
                  <Typography.Paragraph
                    size="md"
                    children={step.subtitle}
                  />
                  <div className="flex gap-2">
                    {step.action_url ? (
                      <Button
                        size="sm"
                        as={Link}
                        href={step.action_url}
                        target={step.action_url.startsWith("/") ? "_self" : "_blank"}
                        children={step.action_text}
                        onClick={() => {
                          markAsRead(step);
                        }}
                      />
                    ) : (
                      <Button
                        size="sm"
                        children={step.action_text}
                        onClick={() => {
                          markAsRead(step);
                        }}
                      />
                    )}

                    <Button
                      size="sm"
                      variant={"link"}
                      className="!font-normal text-primary hover:text-primary"
                      children={t("onboarding.skip")}
                      onClick={() => {
                        markAsRead(step);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

function createPortalRoot() {
  const drawerRoot = document.createElement("div");

  drawerRoot.setAttribute("id", "onboarding-root");

  return drawerRoot;
}

const OnboardingCard = ({
  open,
  isFinished,
  onboardingList,
  onChange
}: {
  open: boolean;
  isFinished: boolean;
  onChange: (value: boolean) => void;
  onboardingList: OnboardingData[];
}) => {
  const { t } = useTranslation();
  const bodyRef = useRef(document.body);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const currentItem = useRef<OnboardingData | undefined>(undefined);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);

  useEffect(() => {
    if (isFinished) {
      setShowSuccess(true);
      setCurrentItemIndex(-1);
    }
  }, [isFinished]);

  const portalRootRef = useRef(document.getElementById("onboarding-root") || createPortalRoot());

  // Append portal root on mount
  useEffect(() => {
    bodyRef.current.appendChild(portalRootRef.current);
    const portal = portalRootRef.current;

    return () => {
      // Clean up the portal when component unmounts
      portal.remove();
    };
  }, []);

  const { user } = useContext(AuthContext);

  currentItem.current = onboardingList[currentItemIndex];

  let totalStepsCount = onboardingList.reduce((total, item) => total + item.steps.length, 0);
  let totalTrueCount = onboardingList.reduce(
    (total, item) => total + item.steps.filter((step) => step.is_read).length,
    0
  );
  let totalProgress = (totalTrueCount / totalStepsCount) * 100;

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={"fixed bottom-16 z-30 w-full animate-fadeIn px-4 lg:bottom-6 lg:right-56 lg:w-[378px] lg:px-0"}>
      <Card className="w-full">
        <Card.Body>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentItem.current && (
                <Button
                  onClick={() => {
                    setCurrentItemIndex(-1);
                  }}
                  className="bg-black/[0.02]"
                  variant={"default"}
                  icon={
                    <Icon>
                      <ArrowRightIcon />
                    </Icon>
                  }
                />
              )}
              <Typography.Paragraph
                size="lg"
                className="!font-semibold text-gray-950"
                children={currentItem.current ? currentItem.current.title : t("onboarding.header_title")}
              />
            </div>
            <Button
              ghost
              className="opacity-60"
              onClick={() => {
                setCurrentItemIndex(-1);
                onChange(false);
              }}
              variant={"default"}
              icon={
                <Icon>
                  <XMarkIcon />
                </Icon>
              }
            />
          </div>
          <div className="mb-4 flex gap-1">
            <div className="relative h-1 w-full rounded-3xl bg-gray-300">
              <div
                className="absolute h-1 rounded-3xl bg-success transition-all"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>
          <div>
            {showSuccess ? (
              <div className="flex flex-col">
                <Image
                  className="mx-auto mb-4"
                  src={"/images/check-success.gif"}
                  alt={"check-success"}
                  width={120}
                  height={120}
                />
                <div className="mb-6 flex flex-col items-center justify-center gap-1">
                  <Typography.Paragraph
                    weight="medium"
                    size="lg"
                    className="text-gray-950"
                    children={t("onboarding.success_message")}
                  />
                  <Typography.Paragraph
                    className="text-center text-gray-800"
                    size="md"
                    children={t("onboarding.success_message_subtitle")}
                  />
                </div>
                <div className="flex gap-6">
                  <Button
                    className="w-full"
                    size="md"
                    variant={"primary"}
                    children={t("onboarding.back_to_steps")}
                    onClick={() => {
                      setShowSuccess(false);
                    }}
                  />
                  <Button
                    size="md"
                    variant={"default"}
                    children={t("onboarding.finish")}
                    onClick={() => {
                      onChange(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {currentItem.current ? (
                  <div>
                    <NestedSteps item={currentItem.current} />
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="mb-5">
                      <Typography.Paragraph
                        size="lg"
                        weight="medium"
                        className="text-"
                        children={t("onboarding.welcome_message", { user_name: user?.name })}
                      />
                      <Typography.Paragraph
                        size="md"
                        children={t("onboarding.welcome_message_description", { count: onboardingList.length })}
                      />
                      <img
                        src="/images/onboarding-icon.svg"
                        alt="onboaring-icon"
                      />
                    </div>

                    <div className="flex animate-fadeIn flex-col gap-4">
                      {onboardingList.map((item, index) => {
                        return (
                          <ItemCard
                            title={item.title}
                            key={index}
                            onChange={() => {
                              setCurrentItemIndex(index);
                            }}
                            item={item}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>,
    portalRootRef.current
  );
};

export default OnboardingCard;
