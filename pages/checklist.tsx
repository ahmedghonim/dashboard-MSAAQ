import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import "swiper/css";

import { Layout } from "@/components";
import { UpgradeIcon } from "@/components/Icons/solid";
import Player from "@/components/Player";
import { AuthContext } from "@/contextes";
import { useCopyToClipboard, useResponseToastHandler } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import { useFetchChecklistQuery, useUpdateTaskMutation } from "@/store/slices/api/onboardingSlice";
import { useUpdateAcademySettingsMutation } from "@/store/slices/api/settingsSlice";
import { APIActionResponse, Plans } from "@/types";
import { CheckListBlock, CheckListTask, CheckListVideo, Checklist } from "@/types/models/onboarding";
import { classNames } from "@/utils";

import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { BoltIcon, PlayIcon } from "@heroicons/react/24/solid";

import { Alert, Badge, Button, Icon, Modal } from "@msaaqcom/abjad";
import { FileFavouriteIcon, PlayListFavourite02Icon } from "@msaaqcom/hugeicons/rounded/bulk";
import { Idea01Icon, Share08Icon, UserSwitchIcon } from "@msaaqcom/hugeicons/rounded/twotone";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

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

const VideoComponent = ({ video }: { video: CheckListVideo }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoObject, setVideoObject] = useState<CheckListVideo | undefined>(undefined);

  const getVideoId = (url: string) => {
    let videoId = url.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return videoId;
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-4 lg:flex-row">
      <div
        className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-lg lg:h-24 lg:w-[170px]"
        onClick={() => {
          setShowVideoModal(true);
          setVideoObject(video);
        }}
      >
        <div className="absolute h-full w-full bg-black/35"></div>
        <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-black/55 transition-all group-hover:scale-110">
          <Icon
            className="h-4 w-4 text-white"
            children={<PlayIcon />}
          />
        </div>
        <img
          src={`https://img.youtube.com/vi/${getVideoId(
            !video?.url ? "https://www.youtube.com/watch?v=AnnkKsYCMnM" : video.url
          )}/hqdefault.jpg`}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="mb-2 !text-base font-semibold text-gray-950">{video?.title}</h3>
        <span className="mb-4 font-normal text-gray-800">{video?.description}</span>
        <Button
          variant="default"
          className="w-fit"
          onClick={() => {
            setShowVideoModal(true);
            setVideoObject(video);
          }}
        >
          {video?.button_text}
        </Button>
      </div>

      <Modal
        size="xl"
        open={showVideoModal}
        onDismiss={() => {
          setShowVideoModal(false);
          setVideoObject(undefined);
        }}
      >
        <Modal.Header>
          <Modal.HeaderTitle>{videoObject?.title}</Modal.HeaderTitle>
        </Modal.Header>
        <Modal.Body>
          <Modal.Content>
            <Player src={!videoObject?.url ? "https://www.youtube.com/watch?v=AnnkKsYCMnM" : videoObject?.url} />
          </Modal.Content>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const PlansComponent = () => {
  const { t } = useTranslation();

  return (
    <Alert
      className="w-full rounded-xl"
      dismissible
      icon={<Icon children={<UpgradeIcon />} />}
      variant="gradient"
      title={t("checklist.discover_plans")}
      children={<span className="text-sm text-gray-800">{t("checklist.discover_plans_subtitle")}</span>}
      actions={
        <Button
          variant={"gradient"}
          rounded
          as={Link}
          href={"/settings/billing/subscription"}
        >
          {t("checklist.discover_plans_button")}
        </Button>
      }
    />
  );
};

const TaskButton = ({ task }: { task: CheckListTask }) => {
  const [copy, values] = useCopyToClipboard();
  const { current_academy } = useContext(AuthContext);
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [isSubmitting, setIsSubmitting] = useState<number>(-1);
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const updateTask = useCallback(async ({ taskId }: { taskId: number }) => {
    if (isSubmitting == taskId) return;

    const response = (await updateTaskMutation({
      task_id: taskId
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      setIsSubmitting(-1);
      return;
    }
    displaySuccess(response);
    setIsSubmitting(-1);
  }, []);

  return (
    <>
      {task.action.type == "navigation" ? (
        <Button
          children={task.action.label}
          as={Link}
          href={
            task.action.url && task.action.url.includes("builder")
              ? process.env.NEXT_PUBLIC_BUILDER_URL
              : task.action.url
          }
          target="_blank"
          variant="default"
        />
      ) : task.action.type === "copy" ? (
        <Button
          children={task.action.label}
          as="button"
          disabled={isSubmitting === task.id}
          onClick={async () => {
            copy(current_academy.domain);
            setIsSubmitting(task.id);
            await updateTask({
              taskId: task.id
            });
          }}
          variant="default"
          icon={<Icon children={<Share08Icon />} />}
        />
      ) : null}
      {task.event_id == null && task.action.type !== "copy" && (
        <Button
          children={task.action.label}
          variant="default"
          isLoading={isSubmitting === task.id}
          onClick={async () => {
            setIsSubmitting(task.id);
            await updateTask({
              taskId: task.id
            });
          }}
          icon={<Icon children={<CheckBadgeIcon />} />}
        />
      )}
    </>
  );
};

const TaskList = ({ task }: { task: CheckListTask }) => {
  return (
    <ol className="flex flex-col gap-2">
      {task.steps.map((step, index) => (
        <li
          key={index}
          className="flex gap-2 rounded-lg bg-white p-4"
        >
          <div className="flex flex-col">
            <div className="flex gap-2">
              <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-[9px] font-medium text-white">
                {index + 1}
              </span>
              {step.content}
            </div>
            {step.hint && (
              <div className="mt-3 flex items-center gap-4">
                <Icon
                  className="flex-shrink-0"
                  children={<Idea01Icon />}
                />
                <span className="text-sm text-gray-800">{step.hint}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

const TaskComponent = ({
  task,
  display_type = "list",
  onTabSelect,
  completedTask
}: {
  task: CheckListTask;
  display_type: "stack" | "list";
  completedTask?: CheckListTask;
  onTabSelect?: (string: string) => void;
}) => {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState<"create_course" | "create_coaching_session" | "create_product">(
    "create_course"
  );

  const showSuccess = useMemo(() => {
    return task.is_completed && task.completion_message;
  }, [task]);

  if (completedTask) {
    return (
      <div className="flex flex-col gap-6 rounded-xl bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex-shrink-0">
          <img
            src="/images/check-success.gif"
            className="h-20 w-20 object-cover"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-success">{completedTask.title}</div>
          <div className="text-xl font-bold text-gray-950">{completedTask.completion_message}</div>
        </div>
      </div>
    );
  }
  if (showSuccess) {
    return (
      <div className="flex flex-col gap-6 rounded-xl bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex-shrink-0">
          <img
            src="/images/check-success.gif"
            className="h-20 w-20 object-cover"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-success">{task.title}</div>
          <div className="text-xl font-bold text-gray-950">{task.completion_message}</div>
        </div>
      </div>
    );
  }

  return display_type == "list" ? (
    <div className="flex gap-4">
      <div className="hidden w-6 flex-col items-center justify-center gap-3 lg:flex">
        <div className="w-full">{task.is_completed ? <DoneIcon /> : <CurrentIcon />}</div>
        <div className={classNames("onboarding-completed h-full w-[2px]")}></div>
      </div>
      <div className="w-full rounded-2xl bg-gray-100 p-6 lg:w-[calc(100%_-_24px)]">
        {task.video && !isEmpty(task.video.url) && (
          <div className="mb-6">
            <VideoComponent video={task.video} />
          </div>
        )}

        <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <span className="text-xl font-semibold">{task.title}</span>
            <div className="flex items-center gap-2">
              <Icon
                className="h-4 w-4 text-primary"
                children={<ClockIcon />}
              />
              <span className="text-sm text-primary">{dayjs.duration(task.estimated_time, "minutes").humanize()}</span>
            </div>
          </div>

          <TaskButton task={task} />
        </div>
        <p className="text-base text-gray-800">{task.description}</p>
        <div className="mt-4">
          <div className="mb-4 font-semibold text-gray-900">{task.subtitle}</div>
          <div className="mb-3 font-semibold text-gray-900">{task.steps_header}</div>
          {task && task.steps.length > 0 && <TaskList task={task} />}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex gap-4">
      <div className="hidden w-6 flex-col items-center justify-center gap-3 lg:flex">
        <div className="w-full">{task.is_completed ? <DoneIcon /> : <CurrentIcon />}</div>

        <div className={classNames("onboarding-completed h-full w-[2px]")}></div>
      </div>
      <div className="w-full lg:w-[calc(100%_-_24px)]">
        <div className="mb-4 font-semibold text-gray-950">{t("checklist.pick_your_first_product")}</div>
        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <button
            onClick={() => {
              setCurrentTab("create_course");
              onTabSelect?.("create_course");
            }}
            className={classNames(
              "flex items-center gap-4 rounded-xl border p-6 transition-all",
              currentTab == "create_course" ? "border-primary bg-primary-50" : "border-transparent bg-gray-100"
            )}
          >
            <span>
              <Icon children={<PlayListFavourite02Icon className="text-primary" />} />
            </span>
            <span className="font-medium">{t("checklist.course")}</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab("create_product");
              onTabSelect?.("create_product");
            }}
            className={classNames(
              "flex items-center gap-4 rounded-xl border p-6 transition-all",
              currentTab == "create_product" ? "border-primary bg-primary-50" : "border-transparent bg-gray-100"
            )}
          >
            <span>
              <Icon children={<FileFavouriteIcon className="text-primary" />} />
            </span>
            <span className="font-medium">{t("checklist.product")}</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab("create_coaching_session");
              onTabSelect?.("create_coaching_session");
            }}
            className={classNames(
              "flex items-center gap-4 rounded-xl border p-6 transition-all",
              currentTab == "create_coaching_session"
                ? "border-primary bg-primary-50"
                : "border-transparent bg-gray-100"
            )}
          >
            <span>
              <Icon children={<UserSwitchIcon className="text-primary" />} />
            </span>
            <span className="font-medium">{t("checklist.coaching")}</span>
          </button>
        </div>
        <div className="rounded-2xl bg-gray-100 p-6">
          <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <span className="text-xl font-semibold">{task.title}</span>
              <div className="flex items-center gap-2">
                <Icon
                  className="h-4 w-4 text-primary"
                  children={<ClockIcon />}
                />
                <span className="text-sm text-primary">
                  {dayjs.duration(task.estimated_time, "minutes").humanize()}
                </span>
              </div>
            </div>

            <TaskButton task={task} />
          </div>
          <p className="text-base text-gray-800">{task.description}</p>
          <div className="mt-4">
            <div className="mb-4 font-semibold text-gray-900">{task.subtitle}</div>
            <div className="mb-3 font-semibold text-gray-900">{task.steps_header}</div>
            {task && task.steps.length > 0 && <TaskList task={task} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const BlockComponent = ({ block }: { block: CheckListBlock }) => {
  const [filter, setFilter] = useState<string>("create_course");
  const [completedTask, setCompletedTask] = useState<CheckListTask | undefined>(undefined);

  useEffect(() => {
    if (block.display_type == "stack") {
      const checkIfStackedTasksCompleted = block.tasks.filter((task) => task.is_completed);
      setCompletedTask(checkIfStackedTasksCompleted[0]);
    }
  }, [block]);
  return (
    <div className="rounded-[32px] bg-white p-5 lg:p-10">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-black p-4">
          <Icon
            className="h-6 w-6 text-white"
            children={<BoltIcon />}
          />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-950">{block.title}</h2>
          <span className="text-gray-800">{block.description}</span>
        </div>
      </div>
      {block.display_type == "list" ? (
        <div className="mt-6 flex flex-col gap-6">
          {block.tasks.map((task, index) => (
            <TaskComponent
              display_type="list"
              task={task}
              key={index}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {block.tasks
            .filter((task) => task.event_id == filter)
            .map((task, index) => (
              <TaskComponent
                onTabSelect={(tab) => setFilter(tab)}
                display_type="stack"
                completedTask={completedTask}
                task={task}
                key={index}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const Skeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex gap-4">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
      </div>
      <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>

      <div className="flex gap-4">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
      </div>
      <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
      <div className="flex gap-4">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
      </div>
      <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>

      <div className="flex gap-4">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
      </div>
      <div className="h-20 w-full animate-pulse rounded-2xl bg-gray-300"></div>
    </div>
  );
};

const SuccessComponent = ({ onClickSuccess, status }: { onClickSuccess: () => void; status: string }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center rounded-xl bg-white p-6">
      <div className="mb-4">
        <img
          src="/images/check-success.gif"
          className="h-20 w-20 object-cover"
        />
      </div>
      <div className=" mb-3 max-w-[636px] text-center text-xl font-bold text-gray-950">
        {t("checklist.completed_title")}
      </div>
      <div className=" mb-4 max-w-[636px] text-center text-gray-800">{t("checklist.completed_subtitle")}</div>
      <div className="flex gap-4">
        <Button
          className="px-8 py-3"
          variant={"primary"}
          as={Link}
          target="_blank"
          href={"https://meetings-eu1.hubspot.com/marwah"}
        >
          {t("checklist.get_free_session")}
        </Button>
        {["in_progress", "skipped"].includes(status) && (
          <Button
            className="px-8 py-3"
            variant={"default"}
            onClick={() => {
              onClickSuccess();
            }}
          >
            {t("checklist.finish_checklist")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default function CheckList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { current_academy, refetchAuth } = useContext(AuthContext);
  const { locale } = router;
  const { data: checkList, isLoading } = useFetchChecklistQuery({
    locale
  });
  const [currentPhase, setCurrentPhase] = useState<Checklist | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [updateAcademySettingsMutation] = useUpdateAcademySettingsMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipFirstStep, setSkipFirstStep] = useState(false);
  const [checkListCompleted, setCheckListCompleted] = useState(false);

  const { displayErrors } = useResponseToastHandler({});
  const updateChecklist = useCallback(async ({ status }: { status: "skipped" | "completed" }) => {
    if (isSubmitting) return;

    const response = (await updateAcademySettingsMutation({
      onboarding_tasks_status: status
    })) as APIActionResponse<any>;

    if (displayErrors(response)) {
      return;
    }

    setIsSubmitting(false);
    refetchAuth();
    router.push("/");
  }, []);

  useEffect(() => {
    if (checkList && !isLoading) {
      if (!skipFirstStep) {
        const checkIfListedTasksCompleted = checkList[0].blocks
          .filter((block: CheckListBlock) => block.display_type == "list")
          .every((block: CheckListBlock) => block.tasks.every((task) => task.is_completed));

        const checkIfStackedTasksCompleted = checkList[0].blocks
          .filter((block: CheckListBlock) => block.display_type == "stack")
          .some((block: CheckListBlock) => {
            return block.tasks.some((task: CheckListTask) => task.is_completed);
          });

        const checkIfAllChecklistIsCompleted = checkList.every((checklist) => {
          return checklist.blocks.every((block) => {
            return block.tasks.every((task) => task.is_completed);
          });
        });

        if (checkIfAllChecklistIsCompleted) {
          setCheckListCompleted(true);
        } else {
          if (checkIfListedTasksCompleted && checkIfStackedTasksCompleted) {
            setCurrentPhase(checkList[1]);
            setCurrentPhaseIndex(1);
          } else {
            setCurrentPhase(checkList[0]);
            setCurrentPhaseIndex(0);
          }
        }
      } else {
        setCurrentPhase(checkList[1]);
        setCurrentPhaseIndex(1);
      }
    }
  }, [isLoading, checkList, currentPhaseIndex, skipFirstStep]);

  return (
    <Layout title={t("checklist.explore_msaaq")}>
      <Layout.Container className="mt-3">
        <div className="mx-auto flex w-full flex-col lg:w-[836px] ">
          {!isLoading && !checkListCompleted && checkList && checkList.length > 0 ? (
            <>
              <div className="mb-8 flex flex-col items-center justify-center">
                <Badge
                  variant="primary"
                  soft
                  className="mb-2 px-6 py-3 text-xs font-semibold"
                  rounded
                  children={currentPhase?.label}
                />
                <h1 className="mb-2 text-2xl font-bold text-gray-950">{currentPhase?.title}</h1>
                <span className="font-normal text-gray-800">{currentPhase?.description}</span>
              </div>
              <div className="mb-8 flex gap-4">
                {currentPhase?.video && !isEmpty(currentPhase.video.url) && (
                  <VideoComponent video={currentPhase?.video} />
                )}
                {current_academy && current_academy?.subscription?.plan?.slug !== Plans.PRO && <PlansComponent />}
              </div>
              <div className="flex w-full flex-col gap-8">
                {currentPhase?.blocks.map((block, index) => (
                  <BlockComponent
                    block={block}
                    key={index}
                  />
                ))}
              </div>
              <div className="mt-14">
                <div className="mb-2 flex items-center justify-center gap-3">
                  <div className="h-[1px] w-full bg-gray-400"></div>
                  <div className="w-fit flex-shrink-0 text-center text-xs font-medium">
                    {currentPhaseIndex == 0 ? t("checklist.skip_to_second_step") : t("checklist.skip_subtitle")}
                  </div>
                  <div className="h-[1px] w-full bg-gray-400"></div>
                </div>
                <div className="flex w-full items-center justify-center">
                  {currentPhaseIndex == 0 ? (
                    <Button
                      variant={"default"}
                      children={t("checklist.skip_first_step")}
                      onClick={() => {
                        setSkipFirstStep(true);
                      }}
                    />
                  ) : (
                    current_academy.onboarding_tasks_status == "in_progress" && (
                      <Button
                        variant={"default"}
                        children={t("checklist.skip_checklist")}
                        isLoading={isSubmitting}
                        onClick={async () => {
                          setIsSubmitting(true);
                          updateChecklist({
                            status: "skipped"
                          });
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </>
          ) : !isLoading && checkListCompleted ? (
            <SuccessComponent
              status={current_academy.onboarding_tasks_status}
              onClickSuccess={async () => {
                await updateChecklist({
                  status: "completed"
                });
              }}
            />
          ) : (
            <Skeleton />
          )}
        </div>
      </Layout.Container>
    </Layout>
  );
}
