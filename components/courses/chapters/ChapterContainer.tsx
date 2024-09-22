import React, { FC, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { ContentButton, CreateNewModal } from "@/components";
import { DragIcon } from "@/components/Icons/solid";
import { useAppSelector, useResponseToastHandler } from "@/hooks";
import { useUpdateChapterMutation } from "@/store/slices/api/chaptersSlice";
import { useCreateContentMutation } from "@/store/slices/api/contentsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { APIActionResponse, Chapter, Quiz } from "@/types";
import { classNames } from "@/utils";

import {
  Bars3BottomRightIcon,
  CalendarIcon,
  ChevronDownIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  ListBulletIcon,
  MicrophoneIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { Badge, Button, Collapse, Dropdown, Icon, Typography } from "@msaaqcom/abjad";

export type ChapterContainerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  handle?: boolean;
  shadow?: boolean;
  data: Chapter;
  onEdit?(chapter: Chapter, showModal?: boolean): void;
  onRemove?(chapter: Chapter): void;
  readOnly?: boolean;

  itemsCount?: number;
};

const ChapterContainer: FC<ChapterContainerProps> = ({
  readOnly,
  children,
  handleProps,
  hover,
  onRemove,
  style,
  shadow,
  data,
  onEdit,
  itemsCount,
  ...props
}: ChapterContainerProps) => {
  const { lastEditedChapterId } = useAppSelector<AppSliceStateType>((state) => state.app);

  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { courseId }
  } = useRouter();

  const [show, setShow] = useState<boolean>(false);

  const [createContentMutation] = useCreateContentMutation();

  const handleQuizCreation = async (title: string) => {
    if (!title?.trim()) {
      return;
    }

    const quiz = (await createContentMutation({
      courseId: courseId as string,
      chapterId: chapter.id,
      data: {
        type: "quiz",
        title,
        premium: false,
        sort: chapter?.contents.length + 1,
        meta: {
          type: "quiz",
          randomised: false,
          show_results_at_end: false,
          allow_question_navigation: false,
          show_results: true,
          passing_score: 0,
          duration: 0
        }
      }
    })) as APIActionResponse<Quiz>;

    if (!displayErrors(quiz)) {
      setShow(false);

      await router.push(`/courses/${courseId}/chapters/${chapter.id}/contents/${quiz.data.data.id}/quiz/builder`);
    }
  };

  const contentsButtons = useMemo<{
    upperSection: {
      icon: React.ReactNode;
      pathname: string | null;
      text: string;
      soon?: boolean;
      newBadge?: boolean;
    }[];
    lowerSection: {
      icon: React.ReactNode;
      pathname: string | null;
      text: string;
      soon?: boolean;
      newBadge?: boolean;
      is_modal?: boolean;
    }[];
  }>(
    () => ({
      upperSection: [
        {
          icon: <VideoCameraIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/video/create",
          text: t("contents.names.video")
        },
        {
          icon: <DocumentTextIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/pdf/create",
          text: t("contents.names.pdf")
        },
        {
          icon: <MicrophoneIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/audio/create",
          text: t("contents.names.audio")
        },
        {
          icon: <CalendarIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/meeting/create",
          text: t("contents.names.zoom"),
          newBadge: true
        },
        {
          icon: <Bars3BottomRightIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/text/create",
          text: t("contents.names.text")
        }
      ],
      lowerSection: [
        {
          icon: <DocumentCheckIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/quiz/create",
          text: t("contents.names.quiz"),
          is_modal: true
        },
        {
          icon: <DocumentDuplicateIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/assignment/create",
          text: t("contents.names.assignment")
        },
        {
          icon: <ListBulletIcon />,
          pathname: "/courses/[courseId]/chapters/[chapterId]/contents/survey/create",
          text: t("contents.names.poll"),
          newBadge: true
        }
      ]
    }),
    [t]
  );

  const [chapter, setChapter] = useState<Chapter>(data);

  useEffect(() => {
    setChapter(data);
  }, [data]);

  const { displaySuccess, displayErrors } = useResponseToastHandler({});

  const [updateChapterMutation] = useUpdateChapterMutation();

  const handleUpdate = async (chapter: Chapter) => {
    const response = (await updateChapterMutation({
      courseId: courseId as any,
      chapterId: chapter.id as any,
      title: chapter.title as any,
      hidden: !chapter.hidden as any
    })) as APIActionResponse<Chapter>;
    if (displayErrors(response)) return;
    displaySuccess(response);
    setChapter(response.data.data);
    onEdit?.(response.data.data, false);
  };

  return (
    <>
      <Collapse
        defaultOpen={lastEditedChapterId == chapter.id}
        className={classNames(shadow ? "shadow" : "")}
      >
        {({ isOpen, toggle }) => (
          <div className="collapse-container relative">
            <Collapse.Button
              className="abjad-collapse items-center bg-primary-50"
              prepend={
                <>
                  {!readOnly && (
                    <Button
                      variant="default"
                      className="ml-4"
                      size="sm"
                      ghost
                      icon={
                        <Icon className="text-gray-900">
                          <DragIcon />
                        </Icon>
                      }
                      {...handleProps}
                    />
                  )}
                </>
              }
              append={
                <>
                  {chapter.hidden && (
                    <Badge
                      children={t("courses.hidden")}
                      className="ml-6 border border-gray"
                      variant="info"
                      rounded
                      soft
                      size="md"
                    />
                  )}

                  {!readOnly && (
                    <Dropdown>
                      <Dropdown.Trigger>
                        <Button
                          variant="default"
                          size="md"
                          ghost
                          className="chapter-settings-trigger"
                          icon={
                            <Icon size="md">
                              <EllipsisHorizontalIcon />
                            </Icon>
                          }
                        />
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          children={!chapter.hidden ? t("courses.hide_chapter") : t("courses.show_chapter")}
                          iconAlign="end"
                          icon={<Icon size="sm">{!chapter.hidden ? <EyeSlashIcon /> : <EyeIcon />}</Icon>}
                          onClick={() => {
                            handleUpdate(chapter);
                          }}
                        />
                        <Dropdown.Divider />
                        <Dropdown.Item
                          children={t("courses.edit_chapter_title")}
                          iconAlign="end"
                          icon={
                            <Icon size="sm">
                              <PencilSquareIcon />
                            </Icon>
                          }
                          onClick={() => {
                            onEdit?.(chapter);
                          }}
                        />
                        <Dropdown.Divider />
                        <Dropdown.Item
                          children={t("courses.delete_chapter")}
                          className="text-danger"
                          iconAlign="end"
                          icon={
                            <Icon
                              className="text-danger"
                              size="sm"
                            >
                              <TrashIcon />
                            </Icon>
                          }
                          onClick={() => {
                            onRemove?.(chapter);
                          }}
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                  <Button
                    variant="default"
                    className="mr-4"
                    size="md"
                    ghost
                    onClick={toggle}
                  >
                    <Icon>
                      <ChevronDownIcon
                        className={` transition-all duration-300 ease-out ${isOpen ? "rotate-180" : ""} `}
                      />
                    </Icon>
                  </Button>
                </>
              }
            >
              <div className="flex flex-col text-start">
                <Typography.Paragraph
                  as="span"
                  size="lg"
                  weight="bold"
                >
                  {chapter?.title}
                </Typography.Paragraph>
                <Typography.Paragraph
                  as="span"
                  size="md"
                  weight="normal"
                  className="text-gray-700"
                >
                  {t("courses.chapters.contents", { count: itemsCount ?? chapter?.contents.length })}
                </Typography.Paragraph>
              </div>
            </Collapse.Button>
            <Collapse.Content className="abjad-collapse-content bg-primary-50 p-4">
              <div className={classNames("flex flex-col space-y-4", children && "mb-6")}>{children}</div>
              {!readOnly && (
                <div
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 20px, #A9B9B6 20px), repeating-linear-gradient(90deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 20px, #A9B9B6 20px), repeating-linear-gradient(180deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 20px, #A9B9B6 20px), repeating-linear-gradient(270deg, #A9B9B6, #A9B9B6 10px, transparent 10px, transparent 20px, #A9B9B6 20px)",
                    backgroundSize: "1px 100%, 100% 1px, 1px 100% , 100% 1px",
                    backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
                    backgroundRepeat: "no-repeat"
                  }}
                  className={classNames("rounded-lg bg-white p-8" /*, chapter?.contents.length && "mt-6"*/)}
                >
                  <div className="flex flex-col">
                    <div className="mb-2 flex items-center p-2">
                      <div className="ml-2 rounded-full bg-primary p-1">
                        <Icon
                          size="md"
                          className="text-white"
                        >
                          <PlusIcon />
                        </Icon>
                      </div>
                      <Typography.Paragraph
                        size="md"
                        weight="medium"
                      >
                        {t("courses.chapters.add_new_contents_to_chapter")}
                      </Typography.Paragraph>
                    </div>
                    <div className="flex justify-between">
                      {contentsButtons.upperSection.map(({ soon, newBadge, icon, pathname, text }, index) => (
                        <ContentButton
                          key={index}
                          className={index !== contentsButtons.upperSection.length - 1 ? "ml-3" : ""}
                          soon={soon}
                          newBadge={newBadge}
                          icon={icon}
                          pathname={pathname}
                          sort={(itemsCount ?? chapter?.contents.length) + 1}
                          text={text}
                          courseId={courseId}
                          chapterId={chapter?.id}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-14 flex flex-col">
                    <div className="mb-2 flex items-center p-2">
                      <div className="ml-2 rounded-full bg-primary p-1">
                        <Icon
                          size="md"
                          className="text-white"
                        >
                          <PlusIcon />
                        </Icon>
                      </div>
                      <Typography.Paragraph
                        size="md"
                        weight="medium"
                      >
                        {t("courses.chapters.add_exams_and_assignments_to_chapter")}
                      </Typography.Paragraph>
                    </div>
                    <div className="flex justify-between">
                      {contentsButtons.lowerSection.map(({ soon, icon, pathname, text, is_modal, newBadge }, index) =>
                        !is_modal ? (
                          <ContentButton
                            key={index}
                            className={index !== contentsButtons.lowerSection.length - 1 ? "ml-3" : ""}
                            soon={soon}
                            newBadge={newBadge}
                            icon={icon}
                            pathname={pathname}
                            sort={(itemsCount ?? chapter?.contents.length) + 1}
                            text={text}
                            courseId={courseId}
                            chapterId={chapter?.id}
                          />
                        ) : (
                          <Button
                            key={index}
                            onClick={() => setShow(true)}
                            variant="default"
                            size="md"
                            outline
                            ghost
                            icon={<Icon size="sm">{icon}</Icon>}
                            className={"relative ml-3 w-full"}
                            children={text}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Collapse.Content>
          </div>
        )}
      </Collapse>
      <CreateNewModal
        title={t("quiz.new_quiz")}
        type="quiz"
        inputLabel={t("quiz.quiz_title")}
        inputPlaceholder={t("quiz.insert_quiz_title")}
        createAction={handleQuizCreation}
        submitButtonText={t("add_new")}
        open={show}
        onDismiss={() => {
          setShow(false);
        }}
      />
    </>
  );
};
export default ChapterContainer;
