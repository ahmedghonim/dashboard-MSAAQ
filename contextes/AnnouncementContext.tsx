import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import { deleteCookie } from "cookies-next";
import { Step, Steps } from "intro.js-react";
import { IntroJs } from "intro.js/src/intro";
import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";

import AnnouncementsModal from "@/components/modals/AnnouncementsModal";
import { useResponseToastHandler } from "@/hooks";
import { useFetchAnnouncementsQuery, useUpdateAnnouncementsMutation } from "@/store/slices/api/announcementSlice";
import { APIActionResponse } from "@/types";
import { Announcement } from "@/types/models/announcement";
import { eventBus } from "@/utils/EventBus";

import { Typography } from "@msaaqcom/abjad";

import { AuthContext } from "./AuthContext";

const AnnouncementContext = createContext(undefined);
type StepsRefType = {
  introJs: IntroJs;
  updateStepElement: (stepIndex: number) => void;
};

const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { authenticated } = useContext(AuthContext);

  if (!authenticated) {
    return <AnnouncementContext.Provider value={undefined}>{children}</AnnouncementContext.Provider>;
  }
  const [chapterAdded, setChapterAdded] = useState<boolean>(false);

  const stepRef = useRef<StepsRefType>();

  const [show, setShow] = useState<boolean>(false);
  const {
    data: fetchedAnnouncements = {} as {
      data: Announcement[];
    }
  } = useFetchAnnouncementsQuery({
    per_page: 30
  });
  const [updateAnnouncement] = useUpdateAnnouncementsMutation();

  const { displayErrors } = useResponseToastHandler({});
  const [activeTourAnnouncement, setActiveTourAnnouncement] = useState<Announcement | undefined>(undefined);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [stepIndexWhenPreventChange, setStepIndexWhenPreventChange] = useState<number>(-1);

  const [stepsEnabled, setStepsEnabled] = useState<boolean>(false);
  const [initialStep, setInitialStep] = useState<number>(0);

  const markAsRead = async (announcement_id: string) => {
    const response = (await updateAnnouncement({ announcement_id })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      return;
    }
    setActiveTourAnnouncement(undefined);
    setChapterAdded(false);
  };

  const handleUpdate = (announcementId: string) => {
    setAnnouncements(announcements.filter((announcement) => announcement.id !== announcementId));
  };

  useEffect(() => {
    if (fetchedAnnouncements?.data?.length > 0) {
      setActiveTourAnnouncement(
        fetchedAnnouncements.data.find(
          (announcement: Announcement) =>
            announcement.type === "tour" &&
            (router.asPath.endsWith(announcement.trigger_value) ||
              router.pathname.endsWith(announcement.trigger_value) ||
              router.pathname.startsWith(announcement.trigger_value) ||
              announcement.trigger_type == "all_pages")
        )
      );
      setAnnouncements(
        fetchedAnnouncements.data.filter((announcement: Announcement) => announcement.type === "in_app")
      );
    }
  }, [fetchedAnnouncements, router.pathname, router.asPath]);

  useEffect(() => {
    if (announcements.length > 0 && router.pathname == "/") {
      setShow(true);
    }
  }, [announcements]);

  useEffect(() => {
    if (activeTourAnnouncement) {
      deleteCookie("is_onboarding");
      setSteps(
        activeTourAnnouncement.steps.map((step) => ({
          element: (document.querySelector(step.item_selector) as HTMLElement) ?? step.item_selector,
          title: activeTourAnnouncement.badge,
          intro: (
            <div>
              <div className="intro-body">
                <Typography.Paragraph
                  size="lg"
                  weight="medium"
                  className="mb-6 text-lg"
                  children={step.title}
                />
                <Typography.Paragraph
                  size="sm"
                  children={step.subtitle}
                />
              </div>
              {/* {step.action_url && (
                <Button
                  as={Link}
                  href={step.action_url}
                  variant="primary"
                  className="action-button"
                  children={step.action_text}
                />
              )} */}
            </div>
          )
        }))
      );
      setStepsEnabled(true);
    }
  }, [activeTourAnnouncement]);

  useEffect(() => {
    if (!activeTourAnnouncement) {
      return;
    }

    if (activeTourAnnouncement.steps[stepIndexWhenPreventChange]) {
      if (activeTourAnnouncement.steps[stepIndexWhenPreventChange].waiting_events_before_change) {
        const handleBeforeChangeActionEvent = () => {
          if (stepRef.current) {
            stepRef.current.introJs.refresh();

            setStepsEnabled(true);

            setInitialStep(stepIndexWhenPreventChange + 1);
            setStepIndex((prev) => prev + 1);
            setChapterAdded(true);
            eventBus.off(activeTourAnnouncement.steps[stepIndexWhenPreventChange].waiting_events_before_change);
          }
        };

        eventBus.on(
          activeTourAnnouncement.steps[stepIndexWhenPreventChange].waiting_events_before_change,
          handleBeforeChangeActionEvent
        );

        return () => {
          eventBus.off(activeTourAnnouncement.steps[stepIndexWhenPreventChange].before_change_action);
        };
      }
    }
  }, [stepIndexWhenPreventChange]);

  if (!authenticated) {
    return <AnnouncementContext.Provider value={undefined}>{children}</AnnouncementContext.Provider>;
  }

  function replaceUrlSegmentWithActionUrl(actionUrl: string) {
    const currentUrl = `${window.location.origin}${router.asPath}`;
    const url = new URL(currentUrl);

    const actionUrlObj = new URL(actionUrl, url.origin);

    const currentPathSegments = url.pathname.split("/");
    const actionPathSegments = actionUrlObj.pathname.split("/");

    currentPathSegments.splice(-1, 1, ...actionPathSegments.slice(1));

    url.pathname = currentPathSegments.join("/");

    actionUrlObj.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    router.replace(url.toString());
  }
  return (
    <AnnouncementContext.Provider value={undefined}>
      {children}
      <Steps
        ref={(steps) => {
          if (steps) {
            stepRef.current = steps;
          }
        }}
        enabled={stepsEnabled}
        steps={steps}
        initialStep={initialStep}
        options={{
          showBullets: false,
          showButtons: true,
          hidePrev: true,
          tooltipClass: `custom-introjs-tooltip relative ${router.query.onboarding}`,
          nextLabel: t(`tour.next`) + ` ${stepIndex + 1}/${steps.length}`,
          prevLabel: t("tour.prev"),
          doneLabel: isEmpty(activeTourAnnouncement?.steps[stepIndex]?.action_url)
            ? t("tour.done")
            : `${t("tour.next")} ${steps.length > 1 ? ` ${stepIndex + 1}/${steps.length}` : ""}`,
          buttonClass: "ms-btn ms-btn-default ms-btn-md"
        }}
        onExit={() => {
          setStepsEnabled(false);
          setInitialStep(0);
        }}
        onPreventChange={(preventStepIndex) => {
          if (!activeTourAnnouncement) {
            return;
          }

          if (activeTourAnnouncement.steps[preventStepIndex]) {
            if (activeTourAnnouncement.steps[preventStepIndex].before_change_action) {
              if (stepRef.current) {
                setStepIndexWhenPreventChange(preventStepIndex);
                setStepsEnabled(false);
                eventBus.emit(
                  activeTourAnnouncement.steps[preventStepIndex].before_change_action,
                  activeTourAnnouncement.steps[preventStepIndex].before_change_action_payload
                );
              }
            }
          }
        }}
        onBeforeChange={(newStepIndex) => {
          if (
            activeTourAnnouncement &&
            !chapterAdded &&
            activeTourAnnouncement.steps[newStepIndex - 1] &&
            activeTourAnnouncement.steps[newStepIndex - 1].before_change_action
          ) {
            return false;
          }
        }}
        onChange={(index) => {
          setStepIndex(index);
        }}
        onComplete={async () => {
          setStepsEnabled(false);
          if (activeTourAnnouncement) {
            let currentStep = activeTourAnnouncement.steps[stepIndex];
            await markAsRead(activeTourAnnouncement.id).then(() => {
              if (activeTourAnnouncement.trigger_value == "?onboarding=course-edit") {
                replaceUrlSegmentWithActionUrl(currentStep.action_url);
              }
              if (currentStep.action_url) {
                eventBus.emit("tour:submitForm");
                eventBus.on("tour:nextStep", () => {
                  replaceUrlSegmentWithActionUrl(currentStep.action_url);
                });
                setActiveTourAnnouncement(undefined);
                setStepIndex(0);
              }
            });
          }
        }}
      />
      <AnnouncementsModal
        announcements={announcements}
        onMarkAsRead={(announcement_id) => markAsRead(announcement_id)}
        onUpdate={(val) => {
          handleUpdate(val);
        }}
        onDismiss={() => {
          setShow(false);
        }}
        open={show}
      />
    </AnnouncementContext.Provider>
  );
};

export { AnnouncementContext, AnnouncementProvider };
