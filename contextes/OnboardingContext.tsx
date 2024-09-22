import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { Card } from "@/components";
import BuildProductStep from "@/components/onboarding-steps/buildProductStep";
import CreateCoachingSession from "@/components/onboarding-steps/createCoachingSession";
import CreateProduct from "@/components/onboarding-steps/createProduct";
import QuestionsStep from "@/components/onboarding-steps/questionsStep";
import RegisterTenantStep from "@/components/onboarding-steps/registerTenantStep";
import { StepsValues } from "@/types/models/onboarding-questions";
import { classNames } from "@/utils";

import { AuthContext } from "./AuthContext";

const OnboardingContext = createContext(undefined);

type Step = {
  title: string;
  subtitle: string;
  description: string;
  status: "current" | "inactive";
  value: number;
  disabled: boolean;
  completed: boolean;
};

const CurrentIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM7.2 12C7.2 14.651 9.34903 16.8 12 16.8C14.651 16.8 16.8 14.651 16.8 12C16.8 9.34903 14.651 7.2 12 7.2C9.34903 7.2 7.2 9.34903 7.2 12Z"
        fill="#36A471"
      />
    </svg>
  );
};

const NotActiveIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z"
        fill="#F0F0F0"
      />
    </svg>
  );
};

const DoneIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM2.4 12C2.4 17.3019 6.69807 21.6 12 21.6C17.3019 21.6 21.6 17.3019 21.6 12C21.6 6.69807 17.3019 2.4 12 2.4C6.69807 2.4 2.4 6.69807 2.4 12Z"
        fill="#36A471"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12ZM15.6103 10.1859C15.8511 9.84887 15.773 9.38046 15.4359 9.1397C15.0989 8.89894 14.6305 8.97701 14.3897 9.31407L11.1543 13.8436L9.53033 12.2197C9.23744 11.9268 8.76256 11.9268 8.46967 12.2197C8.17678 12.5126 8.17678 12.9874 8.46967 13.2803L10.7197 15.5303C10.8756 15.6862 11.0921 15.7656 11.3119 15.7474C11.5316 15.7293 11.7322 15.6153 11.8603 15.4359L15.6103 10.1859Z"
        fill="#36A471"
      />
    </svg>
  );
};

const StepItem = ({ step, index, onStepChange }: { step: Step; index: number; onStepChange: (step: Step) => void }) => {
  return (
    <div>
      <div
        className={classNames(
          "hidden h-[120px] w-full gap-3 laptop:flex",
          step.disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={() => {
          if (!step.disabled) onStepChange(step);
        }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div>{step.completed ? <DoneIcon /> : step.status == "current" ? <CurrentIcon /> : <NotActiveIcon />}</div>

          <div
            className={classNames(
              "h-full w-[2px] ",
              step.status == "current" || step.completed
                ? "onboarding-completed"
                : step.value == StepsValues.Build
                ? "bg-transparent"
                : "bg-gray-200"
            )}
          ></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xl font-semibold">{step.title}</div>
          <div className="text-sm text-gray-800">{step.description}</div>
        </div>
      </div>
      <div className="flex laptop:hidden">
        <div
          onClick={() => {
            if (!step.disabled) onStepChange(step);
          }}
          className={classNames(
            "h-1 w-full rounded-sm",
            step.completed ? "bg-success" : step.status == "current" ? "onboarding-completed-horizontal" : "bg-gray-200"
          )}
        ></div>
      </div>
    </div>
  );
};

const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { authenticated, current_academy } = useContext(AuthContext);
  const [triggerStepChange, setTriggerStepChange] = useState<boolean>(false);
  const [showQuestionaryOnly, setShowQuestionaryOnly] = useState<boolean>(false);

  if (!authenticated) {
    return <OnboardingContext.Provider value={undefined}>{children}</OnboardingContext.Provider>;
  }

  const [steps, setSteps] = useState<Array<Step>>([
    {
      value: StepsValues.Prepare,
      title: t("onboard.prepare_title"),
      description: t("onboard.prepare_description"),
      status: "current",
      subtitle: t("onboard.prepare_subtitle"),
      disabled: false,
      completed: false
    },
    {
      value: StepsValues.About,
      title: t("onboard.about_title"),
      description: t("onboard.about_description"),
      status: "inactive",
      subtitle: t("onboard.about_subtitle"),
      disabled: true,
      completed: false
    },
    {
      value: StepsValues.Build,
      title: t("onboard.build_title"),
      description: t("onboard.build_description"),
      status: "inactive",
      subtitle: t("onboard.build_subtitle"),
      disabled: true,
      completed: false
    }
  ]);

  const currentStep = useMemo(() => {
    return steps.find((step) => step.status == "current");
  }, [steps, current_academy]);

  const handleStepChange = async (step: Step, skipped?: any) => {
    if (!skipped) {
      setTriggerStepChange(!triggerStepChange);
    }
    const newSteps: Step[] = steps.map((s) => {
      if (skipped && s.value === skipped) {
        return {
          ...s,
          completed: true,
          disabled: false,
          status: "inactive"
        };
      } else if (s.title === step.title) {
        return {
          ...s,
          status: "current"
        };
      } else {
        return {
          ...s,
          status: "inactive"
        };
      }
    });

    setSteps(newSteps);
  };

  const [createProductOrCoachingSession, setCreateProductOrCoachingSession] = useState<string | null>(null);

  const showOnboarding = useMemo(() => {
    if (router.asPath.startsWith("/verify/email/")) {
      return false;
    }

    if (authenticated && !current_academy) {
      return true;
    }

    if (authenticated && current_academy) {
      return current_academy.onboarding_status == "in_progress";
    }

    return false;
  }, [authenticated, current_academy, router.asPath]);

  useEffect(() => {
    if (current_academy && current_academy.onboarding_status == "in_progress") {
      const newSteps = [...steps];
      newSteps[0] = { ...newSteps[0], disabled: false, completed: true };

      if (newSteps[0].completed) {
        newSteps[1] = { ...newSteps[1], disabled: false, completed: current_academy.onboarding_answers.length > 0 };
      }

      if (newSteps[1].completed) {
        newSteps[2] = { ...newSteps[2], disabled: false };
      }

      setSteps(newSteps);
    } else {
      if (
        current_academy &&
        current_academy.onboarding_status == "old" &&
        current_academy?.onboarding_answers?.length == 0
      ) {
        setShowQuestionaryOnly(true);
      } else {
        setShowQuestionaryOnly(false);
      }
    }
  }, [current_academy, triggerStepChange]);

  return (
    <OnboardingContext.Provider value={undefined}>
      {showOnboarding ? (
        <>
          {createProductOrCoachingSession == null ? (
            <>
              <Head>
                <title>{currentStep?.title}</title>
              </Head>

              <div className="flex min-h-screen flex-col bg-primary-50 laptop:flex-row">
                <div className="relative flex w-full flex-col items-start justify-center bg-white px-6 py-5 md:px-12 laptop:w-[480px]">
                  <img
                    className="mb-4 laptop:absolute laptop:top-8"
                    draggable={false}
                    src={"https://cdn.msaaq.com/assets/images/logo/logo.svg"}
                    width={96}
                    height={42}
                    alt="مساق"
                  />
                  <div className="mb-6 font-medium text-gray-800">{currentStep?.subtitle}</div>
                  <div className="mb-4 grid w-full grid-cols-3 gap-4 laptop:mb-0 laptop:flex laptop:flex-col laptop:gap-6">
                    {steps.map((step, index) => (
                      <StepItem
                        onStepChange={(step) => {
                          handleStepChange(step);
                        }}
                        step={step}
                        key={index}
                        index={index}
                      />
                    ))}
                  </div>
                  <div className="flex w-full items-center gap-2 rounded-xl bg-gray-100 p-4 laptop:absolute laptop:bottom-8 laptop:w-[unset]">
                    <img src={"/images/idea-01.svg"} />
                    <span className="text-sm text-gray-800">{t("onboard.info")}</span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-center bg-transparent md:mt-4 md:px-12 laptop:w-[calc(100%_-_480px)] laptop:bg-primary-50 laptop:px-6 laptop:py-5 ">
                  <Card className="mx-auto w-full ">
                    <Card.Body className="rounded-lg bg-gray-100 p-0 lg:bg-transparent laptop:!p-6">
                      {currentStep && currentStep.value == StepsValues.Prepare && (
                        <RegisterTenantStep
                          onStepChange={(value: number) => {
                            const step = steps.find((s) => s.value === value);
                            if (step) {
                              handleStepChange(step);
                            }
                          }}
                        />
                      )}
                      {currentStep && currentStep.value == StepsValues.About && (
                        <QuestionsStep
                          onStepChange={(value: number, skip) => {
                            const step = steps.find((s) => s.value === value);
                            if (step) {
                              if (skip) {
                                handleStepChange(step, StepsValues.About);
                              } else {
                                handleStepChange(step);
                              }
                            }
                          }}
                        />
                      )}
                      {currentStep && currentStep.value == StepsValues.Build && (
                        <BuildProductStep
                          onProductOrCoaching={(value: string) => {
                            setCreateProductOrCoachingSession(value);
                          }}
                        />
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </>
          ) : createProductOrCoachingSession == "product" ? (
            <CreateProduct />
          ) : (
            <CreateCoachingSession />
          )}
        </>
      ) : showQuestionaryOnly ? (
        <>
          <Head>
            <title>{t("onboard.about_title")}</title>
          </Head>
          <div className="flex min-h-screen flex-col bg-white p-5 laptop:flex-row">
            <div className="flex w-full items-center justify-center bg-transparent md:mt-4 md:px-12 laptop:px-6 laptop:py-5">
              <QuestionsStep
                onlyQuestionary={showQuestionaryOnly}
                onStepChange={() => {
                  setShowQuestionaryOnly(false);
                }}
              />
            </div>
          </div>
        </>
      ) : (
        children
      )}
    </OnboardingContext.Provider>
  );
};

export { OnboardingContext, OnboardingProvider };
