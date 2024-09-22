import { apiSlice } from "@/store/slices/api/apiSlice";
import { Chapter, Content, Course } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchContent: builder.query<
      Content,
      { courseId: number | string; chapterId: number | string; contentId: number | string }
    >({
      query: ({ courseId, chapterId, contentId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}`,
        method: "GET"
      }),
      providesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }],
      transformResponse: (response: { data: Content }) => response.data
    }),
    createContent: builder.mutation<
      Content,
      { courseId: number | string; chapterId: number | string; data: DeepPartial<Content> }
    >({
      query: ({ courseId, chapterId, data }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/courses/${courseId}/chapters/${chapterId}/contents`,
        method: "POST",
        data: convertBooleans(data)
      }),
      invalidatesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }]
    }),
    updateContent: builder.mutation<
      Content,
      {
        courseId: number | string;
        chapterId: number | string;
        contentId: number | string;
        data: DeepPartial<Content>;
      }
    >({
      query: ({ courseId, chapterId, contentId, data }) => ({
        ...(data.type != "quiz" && {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }),
        url: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(data)
      }),
      invalidatesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }]
    }),
    replicateContent: builder.mutation<
      Content,
      { courseId: Pick<Course, "id">; chapterId: Pick<Chapter, "id">; contentId: Pick<Content, "id"> }
    >({
      query: ({ courseId, chapterId, contentId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }]
    }),
    deleteContent: builder.mutation<
      { success: boolean; id: number },
      { courseId: Pick<Course, "id">; chapterId: Pick<Chapter, "id">; contentId: Pick<Content, "id"> }
    >({
      query: ({ courseId, chapterId, contentId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }]
    }),
    deleteRecurringMeetings: builder.mutation<
      { success: boolean; id: number },
      { courseId: Pick<Course, "id">; chapterId: Pick<Chapter, "id">; contentId: Pick<Content, "id"> }
    >({
      query: ({ courseId, chapterId, contentId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}`,
        method: "DELETE",
        params: {
          delete_all_recurring_meetings: true
        }
      }),
      invalidatesTags: (result, error, chapterId) => [{ type: "chapters.content", chapterId }]
    })
  })
});

export const {
  useCreateContentMutation,
  useReplicateContentMutation,
  useUpdateContentMutation,
  useFetchContentQuery,
  useDeleteContentMutation,
  useDeleteRecurringMeetingsMutation
} = extendedApiSlice;
