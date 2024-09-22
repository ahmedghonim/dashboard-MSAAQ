import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Course, Product, Video } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchVideos: builder.query<APIResponse<Video>, object | void>({
      query: (params: object = {}) => ({
        url: "/videos",
        method: "GET",
        params: {
          per_page: 9,
          ...params
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "videos.index" as const, id })),
              { type: "videos.index", id: "LIST" }
            ]
          : [{ type: "videos.index", id: "LIST" }]
    }),
    fetchVideo: builder.query<Video, number | string>({
      query: (id: number | string) => ({
        url: `/videos/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "videos.index", id }],

      transformResponse: (response: { data: Video }) => response.data
    }),
    fetchVideoUsage: builder.query<Video, number | string>({
      query: (id: number | string) => ({
        url: `/videos/${id}/usage`,
        method: "GET"
      }),
      transformResponse: (response: { data: Video }) => response.data
    }),
    createVideo: builder.mutation<Video, DeepPartial<Video>>({
      query: (data) => ({
        url: `/videos`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, id) => [{ type: "videos.index", id: "LIST" }]
    }),
    updateVideo: builder.mutation<Video, Pick<Video, "id"> & Omit<DeepPartial<Video>, "id">>({
      query: ({ id, ...data }) => ({
        url: `/videos/${id}`,
        method: "PUT",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "videos.index", id }]
    }),
    deleteVideo: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/videos/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "videos.index", id: "LIST" }]
    })
  })
});

export const {
  useFetchVideosQuery,
  useFetchVideoQuery,
  useFetchVideoUsageQuery,
  useCreateVideoMutation,
  useDeleteVideoMutation,
  useUpdateVideoMutation
} = extendedApiSlice;
