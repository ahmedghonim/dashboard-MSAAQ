import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, User } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchUsers: builder.query<APIResponse<User>, object | void>({
      query: (params: object = {}) => ({
        url: "/users",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "users.index" as const, id })),
              { type: "users.index", id: "LIST" }
            ]
          : [{ type: "users.index", id: "LIST" }]
    }),
    fetchUser: builder.query<User, number | string>({
      query: (id: number | string) => ({
        url: `/users/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: User }) => response.data,
      providesTags: (result, error, id) => [{ type: "users.index", id }]
    }),
    updateUser: builder.mutation<User, Pick<User, "id"> & Omit<DeepPartial<User>, "id">>({
      query: ({ id, ...user }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/users/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(user)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "users.index", id }]
    }),
    createUser: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/users",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "users.index", id: "LIST" }]
    }),
    deleteUser: builder.mutation<object, { id: number }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "users.index", id: "LIST" }]
    }),
    sendVerificationEmail: builder.mutation<object, number>({
      query: (id) => ({
        url: `/users/${id}/send-verification-email`,
        method: "POST"
      })
    })
  })
});

export const {
  useFetchUsersQuery,
  useFetchUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSendVerificationEmailMutation
} = extendedApiSlice;
