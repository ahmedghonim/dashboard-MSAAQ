import { ChangeEvent, useContext, useEffect } from "react";

import { useRouter } from "next/router";

import { yupResolver } from "@hookform/resolvers/yup";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "next-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { AddonController, Layout } from "@/components";
import VideoPicker, { VideoFormInputsWithMeta } from "@/components/shared/video-picker/VideoPicker";
import { useToast } from "@/components/toast";
import { AppContext } from "@/contextes";
import { useAppDispatch, useResponseToastHandler, useTus } from "@/hooks";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { useCreateContentMutation, useUpdateContentMutation } from "@/store/slices/api/contentsSlice";
import { APIActionResponse, Content, Video } from "@/types";
import { getMissingFileIds } from "@/utils";

import { Button, Editor, Form, SingleFile, Typography } from "@msaaqcom/abjad";

interface IVideoFormInputs extends VideoFormInputsWithMeta {
  summary?: string;
  premium: boolean;
  type: "video";
  attachments?: SingleFile[];
}

interface IProps {
  defaultValues?: IVideoFormInputs | any;
}

export default function VideoForm({ defaultValues }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const schema = yup
    .object({
      title: yup.string().min(3).required(),
      summary: yup.string().nullable(),
      premium: yup.boolean(),
      meta: yup.object({
        source: yup.string().required(),
        video: yup.array().when("source", {
          is: "upload",
          then: yup.array().min(1).max(1).required()
        }),
        video_url: yup.string().when("source", {
          is: "url",
          then: yup.string().required()
        }),
        duration: yup.number().when("source", {
          is: "url",
          then: yup
            .number()
            .required()
            .min(1, t("validation.field_min_duration") as string)
        }),
        video_id: yup.string().when("source", {
          is: "library",
          then: yup.string().required()
        })
      })
    })
    .required();

  const form = useForm<IVideoFormInputs>({
    defaultValues: {
      premium: true,
      type: "video",
      meta: {
        source: "upload"
      }
    },
    mode: "all",
    resolver: yupResolver(schema)
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
    control,
    setValue,
    watch,
    setError
  } = form;

  const { displayErrors, displaySuccess } = useResponseToastHandler({ setError });

  const resetValues = () => {
    if (!isEmpty(defaultValues)) {
      const source = defaultValues?.meta?.source ?? "upload";

      reset({
        attachments: defaultValues.attachments,
        title: defaultValues?.title,
        summary: defaultValues?.summary,
        premium: defaultValues?.premium,
        meta: {
          video:
            source === "upload" || source === "library"
              ? [
                  {
                    id: defaultValues?.meta?.id,
                    name: defaultValues?.meta?.title,
                    size: parseInt(defaultValues?.meta?.size ?? 0),
                    mime: "video/mp4",
                    url: defaultValues?.meta?.url,
                    download_url: defaultValues?.meta?.download_url,
                    isValid: true
                  }
                ]
              : [],
          source: source,
          video_url: source === "url" ? defaultValues?.meta?.url : "",
          duration: source === "url" ? defaultValues?.meta?.duration : "0",
          video_id: source === "library" ? defaultValues?.meta?.id : ""
        }
      });
    }
  };

  useEffect(() => {
    resetValues();

    return () => {
      reset({});
    };
  }, [defaultValues]);

  useEffect(() => {
    if (!isEmpty(defaultValues)) {
      if (watch("title")) {
        dispatch({ type: "app/setTitle", payload: watch("title") ?? "" });
      } else {
        dispatch({ type: "app/setTitle", payload: defaultValues?.title ?? "" });
      }
    }
  }, [watch("title")]);

  const [createContentMutation] = useCreateContentMutation();
  const [updateContentMutation] = useUpdateContentMutation();

  const {
    query: { courseId, chapterId, contentId, sort }
  } = router;

  const { setIsLoading, isLoading } = useContext(AppContext);
  const [toast] = useToast();

  const setVideo = (payload: object) => {
    const source = watch("meta.source");
    let video: SingleFile[] | any = watch("meta.video");
    video = video ? video[0] : undefined;

    if (source === "upload" && video) {
      setValue("meta.video", [
        {
          ...video,
          ...payload
        }
      ]);
    }
  };

  const { setUpload, status } = useTus({
    onSuccess: () => {
      setIsLoading(false);

      setVideo({
        isUploading: false,
        isUploaded: true,
        isValid: true
      });

      toast.success({
        message: "تم رفع الفيديو بنجاح"
      });
    },
    onProgress: ({ percentage }) => {
      setVideo({
        isUploading: true,
        progress: parseFloat(percentage.toString())
      });
    }
  });

  useEffect(() => {
    switch (status) {
      case "uploading":
        setIsLoading(true);
        break;
      case "finished":
        setIsLoading(false);

        dispatch({ type: "app/setLastEditedChapterId", payload: chapterId });
        router.push({
          pathname: `/courses/[courseId]/chapters`,
          query: { courseId, success: true }
        });
        break;
    }
  }, [status]);

  const onSubmit: SubmitHandler<IVideoFormInputs> = async (data) => {
    if (data.meta.source === "upload" && !data.meta.video?.length) {
      return toast.error({
        message: "يجب رفع فيديو"
      });
    }

    const payload: object = {
      title: data.title,
      summary: data.summary,
      "deleted-attachments": getMissingFileIds(defaultValues?.attachments, data.attachments),
      attachments: data.attachments?.length ? data.attachments.map((file) => file.file) : [],
      premium: data.premium,
      type: "video",
      sort: defaultValues?.sort ?? sort ?? 999,
      meta: {
        source: data.meta.source,
        ...(data.meta.source === "url" && {
          video_url: data.meta.video_url,
          duration: data.meta.duration
        }),
        ...(data.meta.source === "library" && {
          video_id: data.meta.video_id
        })
      }
    };

    const mutation: any = contentId ? updateContentMutation : createContentMutation;
    const response = (await mutation({
      courseId: courseId as string,
      chapterId: chapterId as string,
      contentId: contentId as string,
      data: payload
    })) as APIActionResponse<Content<Video>>;

    if (displayErrors(response)) {
      return;
    }

    const { stream_info } = response.data.data.meta;
    const { source } = data.meta;
    const video = data.meta.video ? data.meta.video[0] : null;

    if (source === "upload" && video?.file && stream_info) {
      if (!contentId) {
        /**
         * Redirect to the edit page in case of creating a new content and uploading a video,
         * so if the upload fails, the user can retry.
         */
        await router.push(
          {
            pathname: `/courses/[courseId]/chapters/[chapterId]/contents/[contentId]/video/edit`,
            query: { courseId, chapterId, contentId: response.data.data.id }
          },
          undefined,
          { shallow: true }
        );
      }

      const upload = setUpload(video.file as File, {
        endpoint: stream_info.stream_url,
        headers: stream_info.stream_headers
      });

      upload.startOrResumeUpload();
      dispatch(apiSlice.util.invalidateTags([{ type: "chapters.content", id: chapterId as string }]));

      setValue("meta.video", [
        {
          ...video,
          isUploading: true
        }
      ]);
    } else {
      /**
       * Redirect to chapters page if it's a creation action or the video add by url
       * So it will prevent redirecting if the user is updating the video or editing the video
       */
      if (!contentId || source === "url" || source === "library") {
        displaySuccess(response);

        dispatch({ type: "app/setLastEditedChapterId", payload: chapterId });

        dispatch(apiSlice.util.invalidateTags([{ type: "chapters.content", id: chapterId as string }]));
        await router.push({
          pathname: `/courses/[courseId]/chapters`,
          query: { courseId }
        });
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Layout.FormGrid
        sidebar={
          <>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              children={t(
                isSubmitting || isLoading ? "submitting" : contentId ? "save_changes" : "contents.video.add_video"
              )}
              disabled={isSubmitting || isLoading || !isDirty}
            />
            <Button
              variant="default"
              size="lg"
              children={t(contentId ? "discard_changes" : "cancel_and_back")}
              disabled={!!(contentId && !isDirty) || isSubmitting || isLoading}
              onClick={() => {
                if (!contentId) {
                  router.back();
                  return;
                }

                if (isDirty) {
                  resetValues();
                }
              }}
            />
          </>
        }
      >
        <VideoPicker
          prefix="meta."
          form={form}
        />

        <Form.Group label={t("contents.video.add_description")}>
          <Controller
            name="summary"
            control={control}
            render={({ field }) => (
              <Editor
                defaultValue={defaultValues?.summary}
                {...field}
              />
            )}
          />
        </Form.Group>

        <Form.Group
          className="mb-0"
          label={t("contents.video.add_attachments")}
        >
          <AddonController addon="courses.attachments">
            <Controller
              name="attachments"
              control={control}
              render={({ field }) => (
                <Form.File
                  maxSize={50}
                  maxFiles={5}
                  {...field}
                />
              )}
            />
          </AddonController>
        </Form.Group>

        <div className="mt-4">
          <div className="relative py-12">
            <div className="border-grey-500 border"></div>
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 px-6 py-3">
              <Typography.Paragraph
                as="span"
                size="md"
                weight="medium"
                children={t("contents.extra_settings")}
              />
            </div>
          </div>

          <Controller
            name="premium"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Form.Toggle
                id={rest.name}
                value="premium"
                checked={value === false}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onChange(!event.target.checked);
                }}
                label={t("contents.free_preview_label")}
                description={t("contents.free_preview_description")}
                {...rest}
              />
            )}
          />
        </div>
      </Layout.FormGrid>
    </Form>
  );
}
