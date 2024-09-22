import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Chapter, Course } from "@/types";

export type DripPayloadType = {
  drip_type: string;
  chapters: [
    {
      id: number | string;
      drip_after: number | string;
      dripped_at: string;
      drip_enabled: boolean;
    }
  ];
};
export type SortPayloadType = {
  chapters: Array<{
    id: number | string;
    sort?: number;
    contents: Array<{
      id: number | string;
      sort: number;
    }>;
  }>;
};
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchChapters: builder.query<APIResponse<Chapter>, number | string>({
      query: (courseId: number | string) => ({
        url: `/courses/${courseId}/chapters`,
        method: "GET"
      })
    }),
    updateChaptersDrip: builder.mutation<
      Omit<APIResponse<Chapter>, "meta" | "links">,
      Pick<Course, "id"> & DripPayloadType
    >({
      query: ({ id, ...payload }) => ({
        url: `/courses/${id}/chapters/drip`,
        method: "PUT",
        data: payload
      })
    }),
    sortChapters: builder.mutation<Omit<APIResponse<Chapter>, "meta" | "links">, Pick<Course, "id"> & SortPayloadType>({
      query: ({ id, ...payload }) => ({
        url: `/courses/${id}/chapters/sort`,
        method: "PUT",
        data: payload
      })
    }),
    createChapter: builder.mutation<
      Chapter,
      Pick<Chapter, "id"> & {
        title: string;
        sort?: number;
      }
    >({
      query: ({ id, title, sort }) => ({
        url: `/courses/${id}/chapters`,
        method: "POST",
        data: {
          title,
          sort: sort || 0
        }
      })
    }),
    updateChapter: builder.mutation<
      Chapter,
      {
        courseId: Pick<Course, "id">;
        chapterId: Pick<Chapter, "id">;
        title: Pick<Chapter, "title">;
        hidden?: Pick<Chapter, "hidden">;
      }
    >({
      query: ({ courseId, chapterId, title, hidden }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}`,
        method: "PUT",
        data: {
          title,
          hidden
        }
      })
    }),
    deleteChapter: builder.mutation<
      { success: boolean; id: number },
      { courseId: Pick<Course, "id">; chapterId: Pick<Chapter, "id"> }
    >({
      query: ({ courseId, chapterId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}`,
        method: "DELETE"
      })
    })
  })
});

export const {
  useFetchChaptersQuery,
  useCreateChapterMutation,
  useUpdateChaptersDripMutation,
  useDeleteChapterMutation,
  useUpdateChapterMutation,
  useSortChaptersMutation
} = extendedApiSlice;
