import { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { ChapterContainer, ChapterItem, CreateNewModal, Layout, Taps } from "@/components";
import { confirm as confirmDelete } from "@/components/Alerts/Confirm";
import { SortableContainers } from "@/components/sortable/SortableContainers";
import { useAppDispatch, useResponseToastHandler } from "@/hooks";
import i18nextConfig from "@/next-i18next.config";
import {
  useCreateChapterMutation,
  useDeleteChapterMutation,
  useFetchChaptersQuery,
  useSortChaptersMutation,
  useUpdateChapterMutation
} from "@/store/slices/api/chaptersSlice";
import { useDeleteContentMutation, useReplicateContentMutation } from "@/store/slices/api/contentsSlice";
import { useFetchCourseQuery } from "@/store/slices/api/coursesSlice";
import { APIActionResponse, APIResponse, Chapter, Content, Course } from "@/types";
import { eventBus } from "@/utils/EventBus";

import { MagnifyingGlassIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Button, Form, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayErrors, displaySuccess } = useResponseToastHandler({});
  const {
    query: { courseId }
  } = router;

  const {
    data: chapters = {} as APIResponse<Chapter>,
    isLoading: isChaptersLoading,
    isFetching: isChaptersFetching
  } = useFetchChaptersQuery(courseId as string, {
    refetchOnMountOrArgChange: true
  });

  const { data: course = {} as Course } = useFetchCourseQuery(courseId as string);

  const [createChapterMutation] = useCreateChapterMutation();
  const [sortChaptersMutation] = useSortChaptersMutation();
  const [updateChapterMutation] = useUpdateChapterMutation();

  const [replicateContentMutation] = useReplicateContentMutation();
  const [deleteChapterMutation] = useDeleteChapterMutation();
  const [deleteContentMutation] = useDeleteContentMutation();
  const [chaptersItems, setChaptersItems] = useState<Chapter[]>([]);

  const [openEditOrCreateChapterModal, setOpenEditOrCreateChapterModal] = useState<boolean>(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSortedAlert, setShowSortedAlert] = useState<boolean>(false);

  useEffect(() => {
    eventBus.on("open_modal", () => {
      setOpenEditOrCreateChapterModal(true);
    });

    dispatch({ type: "app/setBackLink", payload: `/courses/${courseId}` });
    return () => {
      eventBus.off("open_modal");
      dispatch({ type: "app/setLastEditedChapterId", payload: undefined });
    };
  }, []);
  useEffect(() => {
    dispatch({ type: "app/setTitle", payload: course?.title ?? "" });
  }, [course]);

  useEffect(() => {
    if (chapters?.data) {
      setChaptersItems(chapters.data);
    }
  }, [chapters]);

  useEffect(() => {
    if (chapters?.data) {
      if (searchQuery) {
        setChaptersItems(
          chapters.data.filter((chapter) => chapter.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      } else {
        setChaptersItems(chapters.data);
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    if (showSortedAlert) {
      setTimeout(() => {
        setShowSortedAlert(false);
      }, 3000);
    }
  }, [showSortedAlert]);

  const createChapter = async (title: string) => {
    const createdChapter = (await createChapterMutation({
      id: courseId as any,
      title,
      sort: chaptersItems.length
    })) as APIActionResponse<Chapter>;

    if (displayErrors(createdChapter)) return;

    dispatch({ type: "app/setLastEditedChapterId", payload: createdChapter.data.data.id });
    setChaptersItems((prev) => [...prev, createdChapter.data.data]);
    setOpenEditOrCreateChapterModal(false);

    setTimeout(() => {
      eventBus.emit("add_chapters");
    }, 500);
  };

  const editChapter = async (title: string) => {
    if (!editingChapter) return;
    const editedChapter = (await updateChapterMutation({
      courseId: courseId as any,
      chapterId: editingChapter.id as any,
      title: title as any
    })) as APIActionResponse<Chapter>;

    if (displayErrors(editedChapter)) return;

    setChaptersItems((prev) =>
      prev.map((item) => {
        if (item.id === editedChapter.data.data.id) {
          return { ...item, title: editedChapter.data.data.title };
        }
        return item;
      })
    );
    setEditingChapter(null);
    setOpenEditOrCreateChapterModal(false);
  };

  const onChapterEdit = (chapter: Chapter, showModal: boolean = true) => {
    setEditingChapter(chapter);
    if (!showModal) {
      setChaptersItems((prev) =>
        prev.map((item) => {
          if (item.id === chapter.id) {
            return { ...item, hidden: chapter.hidden };
          }
          return item;
        })
      );
    }
    setOpenEditOrCreateChapterModal(showModal);
  };
  const onChapterRemove = async (chapter: Chapter) => {
    if (
      await confirmDelete({
        children: t("courses.chapters.delete_chapter_confirmation", { title: chapter.title }),
        title: t("courses.chapters.delete_chapter"),
        okLabel: t("confirm_delete"),
        cancelLabel: t("cancel"),
        variant: "danger"
      })
    ) {
      const deletedChapter = (await deleteChapterMutation({
        courseId: courseId as any,
        chapterId: chapter.id as any
      })) as APIActionResponse<any>;

      if (displayErrors(deletedChapter)) return;
      else {
        displaySuccess(deletedChapter);
        setChaptersItems(chaptersItems.filter((item) => item.id !== chapter.id));
      }
    }
  };
  const onContentRemove = async (content: Content & { parent: Chapter }) => {
    if (
      await confirmDelete({
        children: t("contents.delete_content_description", { title: content.title }),
        title: t("contents.delete_content"),
        okLabel: t("confirm_delete"),
        cancelLabel: t("cancel"),
        variant: "danger"
      })
    ) {
      const deletedContent = (await deleteContentMutation({
        courseId: courseId as any,
        chapterId: content.parent.id as any,
        contentId: content.id as any
      })) as APIActionResponse<any>;

      if (displayErrors(deletedContent)) return;
      else {
        displaySuccess(deletedContent);
        setChaptersItems((prevChapters) => {
          // Find the chapter and remove the content from it
          const chapterIndex = prevChapters.findIndex((item) => item.id === content.parent.id);
          const chapter = prevChapters[chapterIndex];
          const newChapter = {
            ...chapter,
            contents: chapter.contents.filter((item) => item.id !== content.id)
          };
          // Update the state with the new chapter
          return [...prevChapters.slice(0, chapterIndex), newChapter, ...prevChapters.slice(chapterIndex + 1)];
        });
      }
    }
  };
  const onContentDuplicate = async (content: Content & { parent: Chapter }) => {
    await duplicateContent(content, content.parent);
  };

  const duplicateContent = async (content: Content, chapter: Chapter) => {
    const duplicatedContent = (await replicateContentMutation({
      courseId: courseId as any,
      chapterId: chapter.id as any,
      contentId: content.id as any
    })) as APIActionResponse<Content>;
    if (displayErrors(duplicatedContent)) return;
    else {
      displaySuccess(duplicatedContent);

      // Find the index of the chapter in the chapters array
      const chapterIndex = chaptersItems.findIndex((item) => item.id === chapter.id);
      // Update the chapter with the duplicated content added to it
      const newChapter = {
        ...chapter,
        contents: [
          ...chapter.contents,
          { ...content, id: duplicatedContent.data.data.id, title: duplicatedContent.data.data.title }
        ]
      };
      // Update the state with the new chapter
      setChaptersItems((prevChapters) => [
        ...prevChapters.slice(0, chapterIndex),
        newChapter,
        ...prevChapters.slice(chapterIndex + 1)
      ]);
    }
  };

  const handleSort = async (chapters: any) => {
    const sorted = Object.keys(chapters).map((key: any, index) => ({
      id: (key as string).split("-")[1],
      sort: index + 1,
      contents: chapters[key].map((item: string, index2: number) => ({
        id: (item as string).split("-")[1],
        sort: index2 + 1
      }))
    }));
    await sortChaptersMutation({ id: courseId as any, chapters: sorted });

    setShowSortedAlert(true);
  };

  return (
    <Layout title={course?.title}>
      <Taps
        preview_url={course.url}
        type={course.type}
      />
      <Layout.Container>
        <div className="mb-6 flex flex-row justify-between">
          <div className="w-2/4">
            <Form.Input
              placeholder={t("courses.chapters.search_input_placeholder")}
              onChange={(e) => setSearchQuery(e.target.value)}
              prepend={
                <Icon className="ltr:ml-3 rtl:mr-3">
                  <MagnifyingGlassIcon />
                </Icon>
              }
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {!isChaptersLoading && !isChaptersFetching && (
            <SortableContainers
              onSortChange={async (data) => {
                await handleSort(data);
              }}
              items={chaptersItems}
              handle={true}
              nestedItemsAccessor={"contents"}
              renderContainer={ChapterContainer}
              renderContainerProps={{
                onRemove: onChapterRemove,
                onEdit: onChapterEdit
              }}
              renderItem={ChapterItem}
              renderItemProps={{
                onRemove: onContentRemove,
                onDuplicate: onContentDuplicate
              }}
            />
          )}
        </div>
        <div className="relative z-10 mt-6 flex w-full justify-center">
          <Button
            variant="primary"
            data-tour="add-chapter"
            icon={
              <Icon>
                <PlusCircleIcon />
              </Icon>
            }
            onClick={() => {
              setEditingChapter(null);
              setOpenEditOrCreateChapterModal(true);
            }}
            children={t("courses.chapters.add_new_chapter_to_the_course")}
          />
        </div>
      </Layout.Container>

      <div
        className="pointer-events-none flex w-48 flex-row items-center rounded-full bg-gray-900 px-4 py-2 text-white transition-all duration-300"
        style={{
          position: "fixed",
          opacity: showSortedAlert ? 1 : 0,
          bottom: showSortedAlert ? "100px" : "-100px",
          left: "calc(50% - 105px)",
          transform: "translate(-50%, -50%)"
        }}
      >
        <Icon className="ltr:mr-2 rtl:ml-2">
          <CheckCircleIcon />
        </Icon>
        <Typography.Paragraph
          size="lg"
          weight="medium"
          children={t("all_changes_ware_saved")}
        />
      </div>

      <CreateNewModal
        title={editingChapter?.id ? t("courses.edit_chapter_title") : t("courses.add_new_chapter")}
        type="chapter"
        inputLabel={t("courses.chapter_title")}
        inputPlaceholder={t("courses.chapter_title_input_placeholder")}
        submitButtonText={editingChapter?.id ? t("save_changes") : t("add_new")}
        inputDefaultValue={editingChapter?.id ? editingChapter.title : ""}
        createAction={async (title) => {
          if (editingChapter?.id) {
            await editChapter(title);
          } else {
            await createChapter(title);
          }
        }}
        open={openEditOrCreateChapterModal}
        onDismiss={() => {
          setOpenEditOrCreateChapterModal(false);
        }}
      />
    </Layout>
  );
}
