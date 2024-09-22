import camelCase from "camelcase";
import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Member } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchMembers: builder.query<APIResponse<Member>, object | void>({
      query: (params: object = {}) => ({
        url: "/members",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "members.index" as const, id })),
              { type: "members.index", id: "LIST" }
            ]
          : [{ type: "members.index", id: "LIST" }]
    }),
    fetchMember: builder.query<Member, number | string>({
      query: (memberId: number | string) => ({
        url: `/members/${memberId}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Member }) => {
        const result = {
          ...response.data,
          segments: response.data.segments.map((segment) => ({
            ...segment,
            label: segment.name,
            value: segment.id,
            icon: `${camelCase(segment.icon, {
              pascalCase: true
            })}Icon`
          }))
        };

        return result;
      },
      providesTags: (result, error, id) => [{ type: "members.index", id }]
    }),
    updateMember: builder.mutation<Member, Pick<Member, "id"> & Omit<DeepPartial<Member>, "id">>({
      query: ({ id, ...course }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/members/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(course)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "members.index", id }]
    }),
    createMember: builder.mutation<Member, DeepPartial<Member>>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/members",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "members.index", id: "LIST" }]
    }),
    importMembers: builder.mutation<
      object,
      {
        notify: boolean;
        products: Array<number>;
        courses: Array<number>;
        file?: File | Blob;
      }
    >({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/members/import",
        method: "POST",
        data: convertBooleans(data)
      })
    }),
    deleteMember: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/members/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "members.index", id: "LIST" }]
    }),
    unsubscribeMember: builder.mutation<void, number>({
      query: (memberId) => ({
        url: `/members/${memberId}/unsubscribe`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "members.index", id }]
    })
  })
});

export const {
  useFetchMembersQuery,
  useFetchMemberQuery,
  useCreateMemberMutation,
  useImportMembersMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useUnsubscribeMemberMutation
} = extendedApiSlice;
