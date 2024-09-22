import camelCase from "camelcase";
import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Segment } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchSegments: builder.query<APIResponse<Segment>, object | void>({
      query: (params: object = {}) => ({
        url: "/members/segments",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "segments.index" as const, id })),
              { type: "segments.index", id: "LIST" }
            ]
          : [{ type: "segments.index", id: "LIST" }],
      transformResponse: (response: APIResponse<Segment>) => {
        return {
          ...response,
          data: response.data.map((segment) => ({
            ...segment,
            icon: `${camelCase(segment.icon, {
              pascalCase: true
            })}Icon`
          }))
        };
      }
    }),
    fetchSegment: builder.query<Segment, number | string>({
      query: (id: number | string) => ({
        url: `/members/segments/${id}`,
        method: "GET"
      }),
      providesTags: (result) => (result ? [{ type: "segments.index" as const, id: result.id }] : []),
      transformResponse: (response: { data: Segment }) => {
        return {
          ...response.data,
          icon: `${camelCase(response.data.icon, {
            pascalCase: true
          })}Icon`
        };
      }
    }),
    deleteSegment: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/members/segments/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, _, id) => (result ? [{ type: "segments.index", id }] : [])
    }),
    createSegment: builder.mutation<Segment, DeepPartial<Segment>>({
      query: (data) => ({
        url: "/members/segments",
        method: "POST",
        data
      }),
      invalidatesTags: (result) => (result ? [{ type: "segments.index" as const, id: result.id }] : [])
    }),
    updateSegment: builder.mutation<Segment, Pick<Segment, "id"> & Omit<DeepPartial<Segment>, "id">>({
      query: ({ id, ...data }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/members/segments/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data
      }),
      invalidatesTags: (result) => (result ? [{ type: "segments.index" as const, id: result.id }] : [])
    })
  })
});

export const {
  useFetchSegmentsQuery,
  useLazyFetchSegmentsQuery,
  useFetchSegmentQuery,
  useCreateSegmentMutation,
  useDeleteSegmentMutation,
  useUpdateSegmentMutation
} = extendedApiSlice;
