import React, { ReactNode, useContext, useState } from "react";

import { GetServerSideProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { Card, Datatable, EmptyStateTable, Layout, Time, VideoPicker } from "@/components";
import { VideoFormInputs } from "@/components/shared/video-picker/VideoPicker";
import { useToast } from "@/components/toast/useToast";
import { AppContext, AuthContext, FreshchatContext } from "@/contextes";
import { useConfirmableDelete, useResponseToastHandler, useTus } from "@/hooks";
import axios from "@/lib/axios";
import i18nextConfig from "@/next-i18next.config";
import TvNoSignal from "@/public/images/tv-no-signal.jpeg";
import {
  useCreateVideoMutation,
  useDeleteVideoMutation,
  useFetchVideosQuery,
  useUpdateVideoMutation
} from "@/store/slices/api/videosSlice";
import { APIActionResponse, Content, Video, VideoStatus } from "@/types";
import { classNames, getStatusColor, humanFileSize, objectToQueryString, parseDuration, randomUUID } from "@/utils";

import { PencilSquareIcon, PlusIcon, TrashIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon, EllipsisHorizontalIcon, PlayIcon } from "@heroicons/react/24/solid";

import { Alert, Badge, Button, Dropdown, Form, Icon, Modal, Player, SingleFile, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

export const VideoCard = ({
  video,
  deleteHandler,
  handleEdit,
  actions
}: {
  video: Video;
  deleteHandler: (video: Video) => void;
  handleEdit: (video: Video) => void;
  actions?: ReactNode;
}) => {
  const { t } = useTranslation();
  const { hasPermission } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Card className="h-full w-full">
        <Card.Body>
          <div className="relative mb-4 overflow-hidden rounded pb-[60%]">
            <img
              className="absolute top-0 h-full w-full object-cover"
              alt={video.title}
              src={video.thumbnail ?? TvNoSignal.src}
            />

            <div
              className={classNames(
                "absolute inset-0 flex items-center justify-center bg-black/30",
                "transition-opacity duration-300 ease-in-out",
                "cursor-pointer",
                video.status !== VideoStatus.READY ? "pointer-events-none" : null
              )}
              onClick={() => setIsOpen(true)}
            >
              <Button
                rounded
                variant="default"
                className="!bg-white transition-all hover:opacity-75"
                disabled={video.status !== VideoStatus.READY}
                onClick={() => setIsOpen(true)}
                icon={
                  <Icon
                    size="lg"
                    children={video.status === VideoStatus.READY ? <PlayIcon /> : <EllipsisHorizontalIcon />}
                  />
                }
              />
            </div>
          </div>

          <div className="mb-2 flex justify-between gap-2">
            <Typography.Paragraph
              children={video.title}
              weight="medium"
              className="w-2/4 overflow-hidden truncate"
            />

            {video.status !== VideoStatus.READY && (
              <Badge
                children={t(`statuses.${video.status}`)}
                variant={getStatusColor(video.status)}
                size="sm"
                rounded
                soft
              />
            )}
          </div>

          <Typography.Paragraph
            className="flex items-center gap-2 text-gray-700"
            weight="medium"
            size="sm"
            as="div"
          >
            <Badge
              children={parseDuration(video.duration)}
              variant="default"
              size="xs"
              rounded
              soft
            />

            {video.size && (
              <span
                children={humanFileSize(video.size)}
                dir="auto"
              />
            )}

            <Time date={video.created_at} />
          </Typography.Paragraph>
        </Card.Body>

        <Card.Actions>
          {actions ? (
            actions
          ) : (
            <>
              {hasPermission("videos.update") && (
                <Button
                  variant="default"
                  size="sm"
                  className="ml-2"
                  children={t("edit")}
                  onClick={() => handleEdit(video)}
                />
              )}

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
                  {hasPermission("videos.update") && (
                    <>
                      <Dropdown.Item
                        onClick={() => handleEdit(video)}
                        children={t("edit")}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<PencilSquareIcon />}
                          />
                        }
                      />
                      <Dropdown.Divider />
                    </>
                  )}

                  {video.download_url && (
                    <Dropdown.Item
                      as="a"
                      href={video.download_url}
                      disabled={video.status !== VideoStatus.READY}
                      download
                      target="_blank"
                      children={t("video_library.download")}
                      iconAlign="end"
                      icon={
                        <Icon
                          size="sm"
                          children={<ArrowDownTrayIcon />}
                        />
                      }
                    />
                  )}

                  {hasPermission("videos.delete") && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        children={t("video_library.delete")}
                        className="text-danger"
                        onClick={() => deleteHandler(video)}
                        iconAlign="end"
                        icon={
                          <Icon
                            size="sm"
                            children={<TrashIcon />}
                          />
                        }
                      />
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </Card.Actions>
      </Card>

      <Modal
        open={isOpen}
        size="lg"
        onDismiss={() => setIsOpen(false)}
        className="overflow-auto"
      >
        <Modal.Header>
          <Modal.HeaderTitle children={video.title} />
        </Modal.Header>

        <Player url={video.url} />
      </Modal>
    </>
  );
};

export default function Index({}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const [toast] = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const { hasPermission } = useContext(AuthContext);
  const { t } = useTranslation();
  const router = useRouter();

  const schema = yup
    .object({
      title: yup.string().required(),
      video: yup.array().when("source", {
        is: "upload",
        then: yup.array().min(1).max(1).required()
      }),
      source: yup.string().required(),
      video_url: yup.string().when("source", {
        is: "url",
        then: yup.string().required()
      }),
      duration: yup.number().when("source", {
        is: "url",
        then: yup.number().required()
      })
    })
    .required();

  const form = useForm<VideoFormInputs>({
    defaultValues: {
      source: "upload"
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { isValid, isSubmitting }
  } = form;

  const { displayErrors, display } = useResponseToastHandler({
    setError
  });

  const [createAction] = useCreateVideoMutation();
  const [updateAction] = useUpdateVideoMutation();

  const { setIsLoading, isLoading } = useContext(AppContext);

  const setVideo = (payload: object) => {
    const source = watch("source");
    let video: SingleFile[] | any = watch("video");
    video = video ? video[0] : undefined;

    if (source === "upload" && video) {
      setValue("video", [
        {
          ...video,
          ...payload
        }
      ]);
    }
  };

  const resetForm = () => {
    reset({
      source: "upload",
      video: undefined,
      video_url: undefined,
      duration: undefined,
      title: undefined
    });

    setEditing(null);
  };

  const { setUpload } = useTus({
    onSuccess: async () => {
      setIsLoading(false);

      setShowModal(false);

      resetForm();

      setVideo({
        isUploading: false,
        isUploaded: true,
        isValid: true
      });

      toast.success({
        title: t("video_library.uploaded_successfully.title"),
        message: t("video_library.uploaded_successfully.message")
      });

      await router.replace({
        query: objectToQueryString({
          page: 1,
          fetch: randomUUID() // force refresh
        })
      });
    },
    onProgress: ({ percentage }) => {
      setIsLoading(true);

      setVideo({
        isUploading: true,
        progress: parseFloat(percentage.toString())
      });
    },
    onError: () => {
      setIsLoading(false);

      setVideo({
        isUploading: false,
        isUploaded: false,
        isValid: false
      });

      toast.error({
        title: t("video_library.upload_failed.title"),
        message: t("video_library.upload_failed.message")
      });
    }
  });

  const handleEdit = (video: Video) => {
    setEditing(video);

    reset({
      title: video.title,
      source: video.source,
      video_url: video.url,
      duration: video.duration,
      video:
        video.source === "upload"
          ? [
              {
                id: video.id,
                name: video.title,
                size: parseInt(video.size ?? 0),
                mime: "video/mp4",
                url: video.url,
                isValid: true
              }
            ]
          : []
    });

    setShowModal(true);
  };

  const onSubmit: SubmitHandler<VideoFormInputs> = async (data) => {
    if (data.source === "upload" && !editing?.id && !data.video?.length) {
      return toast.error({
        message: "يجب رفع فيديو"
      });
    }

    const video = data.video?.length ? data.video[0] : null;
    const payload: object = {
      id: editing?.id,
      title: data.title,
      source: data.source,
      ...(data.source === "url" && {
        video_url: data.video_url,
        duration: data.duration
      })
    };

    const mutation: any = editing?.id ? updateAction : createAction;
    const response = (await mutation(payload)) as APIActionResponse<Video>;

    if (displayErrors(response)) {
      setIsLoading(false);

      return;
    }

    const { stream_info } = response.data.data ?? {};
    const { source } = data;

    if (video?.file && source === "upload" && stream_info) {
      const upload = setUpload(video.file as File, {
        endpoint: stream_info.stream_url,
        headers: stream_info.stream_headers
      });

      upload.startOrResumeUpload();

      setValue("video", [
        {
          ...video,
          isUploading: true
        }
      ]);
    } else {
      setShowModal(false);

      display(response);

      resetForm();

      await router.replace({
        query: objectToQueryString({
          page: 1,
          fetch: randomUUID()
        })
      });
    }
  };

  const [confirmableDelete] = useConfirmableDelete({
    mutation: useDeleteVideoMutation
  });

  const deleteHandler = async (video: Video) => {
    const usage = await axios.get(`/videos/${video.id}/usage`).then((response) => response.data);

    confirmableDelete({
      id: video.id,
      title: t("video_library.delete"),
      label: t("video_library.delete_confirm"),
      children: (
        <>
          <Typography.Paragraph
            weight="normal"
            children={
              usage.data.length
                ? t("video_library.delete_confirmation_text_with_usage", {
                    count: usage.data.length
                  })
                : t("video_library.delete_confirmation_text")
            }
          />

          {usage.data.length ? (
            <ul className="list-inside list-disc pt-4">
              {usage.data.map((item: Content) => (
                <li key={item.id}>
                  <Typography.Paragraph
                    as="span"
                    children={item.title}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )
    });
  };

  const { openChat } = useContext(FreshchatContext);

  return (
    <Layout title={t("sidebar.manage_content.video_library")}>
      <Layout.Container>
        <Alert
          className="mb-6"
          dismissible
          variant={"info"}
          title="احصل على ترجمة فورية لمحتواك التعليمي عبر الذكاء الاصطناعي!"
          children={
            "اطلب خدمة الترجمة الفورية (Transcribing) لفيديوهاتك إلى لغات متعددة تلقائيًا، بكل سهولة وجودة عالية."
          }
          actions={
            <Button
              variant={"info"}
              children={"تواصل معنا الآن"}
              onClick={() => openChat()}
            />
          }
        />

        <div className="grid-table">
          <Datatable
            selectable={false}
            fetcher={useFetchVideosQuery}
            className="w-full"
            columns={{
              columns: () => [
                {
                  id: "card",
                  Cell: ({ row: { original } }: any) => (
                    <VideoCard
                      video={original}
                      deleteHandler={deleteHandler}
                      handleEdit={handleEdit}
                    />
                  )
                }
              ]
            }}
            emptyState={
              <EmptyStateTable
                title={t("video_library.empty_state.title")}
                content={t("video_library.empty_state.description")}
                icon={<VideoCameraIcon />}
              >
                {hasPermission("videos.create") && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowModal(true)}
                    children={t("video_library.add_new")}
                    icon={
                      <Icon
                        size="sm"
                        children={<PlusIcon />}
                      />
                    }
                  />
                )}
              </EmptyStateTable>
            }
            filter={""}
            hasSearch={true}
            toolbar={() =>
              hasPermission("videos.create") ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowModal(true)}
                  children={t("video_library.add_new")}
                  icon={
                    <Icon
                      size="sm"
                      children={<PlusIcon />}
                    />
                  }
                />
              ) : null
            }
          />
        </div>

        <Modal
          size="lg"
          open={showModal}
          onDismiss={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <Modal.Header>
            <Modal.HeaderTitle children={t(editing?.id ? "video_library.edit_title" : "video_library.add_new")} />
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Modal.Content className="!pb-0">
                <VideoPicker
                  form={form}
                  canChooseFromLibrary={false}
                />
              </Modal.Content>
            </Modal.Body>
            <Modal.Footer>
              <Button
                size="lg"
                className="ml-2"
                type="submit"
                children={t(editing?.id ? "save_changes" : "video_library.submit")}
                disabled={isSubmitting || !isValid}
              />
              <Button
                ghost
                size="lg"
                variant="default"
                disabled={isSubmitting || isLoading}
                children={t("cancel")}
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              />
            </Modal.Footer>
          </Form>
        </Modal>
      </Layout.Container>
    </Layout>
  );
}
