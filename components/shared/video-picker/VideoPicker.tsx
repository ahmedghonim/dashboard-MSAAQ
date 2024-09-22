import React, { useEffect, useState } from "react";

import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { Controller } from "react-hook-form";
import { UseFormReturn } from "react-hook-form/dist/types/form";

import { Datatable, DurationInput, EmptyStateTable } from "@/components";
import { VideoCard } from "@/pages/video-library";
import { useFetchVideosQuery } from "@/store/slices/api/videosSlice";
import { classNames } from "@/utils";

import { ArrowUpTrayIcon, LinkIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

import { Button, Form, Icon, Modal, SingleFile } from "@msaaqcom/abjad";

type VideoMeta = {
  source: "upload" | "url" | "library";
  video_url?: string;
  video_id?: number | string;
  duration?: number;
  video?: SingleFile[];
};

export interface VideoFormInputs extends VideoMeta {
  title: string;
}

export interface VideoFormInputsWithMeta {
  title: string;
  meta: VideoMeta;
}

type Names = {
  title: string;
  video: string;
  source: string;
  video_url: string;
  video_id: string;
  duration: string;
};

interface Props {
  form: UseFormReturn<VideoFormInputs> | any;
  canChooseFromLibrary?: boolean;
  prefix?: string;
}

const VideoPicker = ({ form, prefix, canChooseFromLibrary = true }: Props) => {
  const { t } = useTranslation();
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const {
    formState: { errors },
    control,
    watch,
    setValue,
    getValues
  } = form;

  const [names, setNames] = useState<Names>({
    title: "title",
    video: "meta.video",
    source: "meta.source",
    video_url: "meta.video_url",
    video_id: "meta.video_id",
    duration: "meta.duration"
  });

  useEffect(() => {
    const namesToObject = (prefix: string = "") => ({
      video: `${prefix}video`,
      source: `${prefix}source`,
      video_url: `${prefix}video_url`,
      video_id: `${prefix}video_id`,
      duration: `${prefix}duration`
    });

    setNames((names) => ({
      ...names,
      ...namesToObject(prefix ?? "")
    }));
  }, [prefix]);

  useEffect(() => {
    const source = watch(names.source);
    if (source) {
      setValue(names.source, source);
      setValue(names.video, getValues(names.video));
      setValue(names.video_id, getValues(names.video_id));
      setValue(names.duration, getValues(names.duration));
      setValue(names.video_url, getValues(names.video_url));
    }
  }, [watch(names.source)]);

  return (
    <>
      <Form.Group
        label={t("contents.video.title")}
        required
        errors={errors?.title?.message}
      >
        <Controller
          name={names.title}
          control={control}
          render={({ field }) => (
            <Form.Input
              placeholder={t("contents.video.title_input_placeholder")}
              {...field}
            />
          )}
        />
      </Form.Group>

      <Form.Group
        label={t("contents.video.upload_video_file")}
        required
      >
        <div className="flex items-start gap-4">
          <Controller
            name={names.source}
            control={control}
            defaultValue="upload"
            render={({ field: { value, ...field } }) => (
              <label
                className={classNames(
                  "w-full cursor-pointer rounded border px-4 py-4",
                  "flex items-center gap-2",
                  value === "upload" || value === "library" ? "border-primary bg-primary-50" : "border-gray"
                )}
              >
                <Form.Radio
                  id="source-upload"
                  value="upload"
                  checked={value === "upload" || value === "library"}
                  label={t("contents.video.direct_upload")}
                  {...field}
                />

                <Icon
                  size="lg"
                  children={<ArrowUpTrayIcon />}
                  className="mr-auto"
                />
              </label>
            )}
          />

          <Controller
            name={names.source}
            control={control}
            defaultValue="url"
            render={({ field: { value, ...field } }) => (
              <label
                className={classNames(
                  "w-full cursor-pointer rounded border px-4 py-4",
                  "flex items-center gap-2",
                  value === "url" ? "border-primary bg-primary-50" : "border-gray"
                )}
              >
                <Form.Radio
                  id="source-url"
                  value="url"
                  checked={value === "url"}
                  label={t("contents.video.source_url")}
                  {...field}
                />

                <Icon
                  size="lg"
                  children={<LinkIcon />}
                  className="mr-auto"
                />
              </label>
            )}
          />
        </div>
      </Form.Group>

      {watch(names.source) === "upload" || watch(names.source) === "library" ? (
        <Form.Group
          className="rounded border border-gray bg-white p-4"
          errors={errors.meta?.video?.message}
        >
          <Controller
            name={names.video}
            control={control}
            render={({ field: { onChange, name, ...field } }) => (
              <Form.File
                accept={["video/mp4", "video/mov", "video/*", "video/quicktime"]}
                maxSize={2000}
                onChange={(files: SingleFile[]) => {
                  if (files.length) {
                    onChange(files);
                    setValue(names.source, "upload");

                    if (!getValues(names.title)) {
                      setValue(names.title, files[0].name);
                    }
                  }
                }}
                {...field}
              >
                {canChooseFromLibrary && (
                  <div className="flex w-full border-t border-gray-300 pt-4">
                    <Button
                      className="mx-auto w-full"
                      size="lg"
                      variant="default"
                      icon={<Icon children={<VideoCameraIcon />} />}
                      children={t("file_uploader.choose_form_video_library")}
                      onClick={() => {
                        setShowLibrary(true);
                      }}
                      outline
                    />
                  </div>
                )}
              </Form.File>
            )}
          />
        </Form.Group>
      ) : (
        <Form.Group className="rounded border border-gray bg-white p-4">
          <Form.Group
            errors={errors.meta?.video_url?.message}
            label={t("contents.video.enter_url")}
            required
          >
            <Controller
              name={names.video_url}
              control={control}
              render={({ field }) => (
                <Form.Input
                  type="url"
                  placeholder={t("contents.video.url_input_placeholder")}
                  {...field}
                />
              )}
            />
          </Form.Group>

          <Form.Group
            className="mb-0"
            label={t("contents.video.duration_label")}
            errors={errors.meta?.duration?.message}
            required
          >
            <Controller
              name={names.duration}
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <DurationInput
                  onChange={(duration) => onChange(duration)}
                  {...field}
                />
              )}
            />
          </Form.Group>
        </Form.Group>
      )}
      <Modal
        open={showLibrary}
        onDismiss={() => {
          setShowLibrary(false);
        }}
        size="xl"
      >
        <Modal.Header>
          <Modal.HeaderTitle>{t("sidebar.manage_content.video_library")}</Modal.HeaderTitle>
        </Modal.Header>
        <Modal.Content>
          <Modal.Body>
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
                          deleteHandler={() => {}}
                          handleEdit={() => {}}
                          actions={
                            <Button
                              variant="default"
                              size="sm"
                              className="ml-2"
                              children={t("video_library.chose_video")}
                              onClick={() => {
                                const options = {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                  shouldTouch: true
                                };

                                setValue(names.source, "library", options);

                                setValue(names.video_id, original.id, options);

                                setValue(
                                  names.video,
                                  [
                                    {
                                      id: original.id,
                                      name: original.title,
                                      size: parseInt(original.size ?? 0) ?? 0,
                                      mime: "video/mp4",
                                      url: original.url,
                                      isValid: true
                                    }
                                  ],
                                  options
                                );

                                if (isEmpty(getValues(names.title))) {
                                  setValue(names.title, original.title, options);
                                }

                                setShowLibrary(false);
                              }}
                            />
                          }
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
                  />
                }
              />
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default VideoPicker;
