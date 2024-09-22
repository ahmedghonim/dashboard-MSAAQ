import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse, Bank } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchUserBank: builder.query<{ data: Bank }, object | void>({
      query: () => ({
        url: `/authentication/me/bank`,
        method: "GET"
      })
    }),
    createUserBank: builder.mutation<APIActionResponse<Bank>, object | void>({
      query: (data) => ({
        url: `/authentication/me/bank`,
        method: "POST",
        data
      })
    }),
    updateUserBank: builder.mutation<APIActionResponse<Bank>, object | void>({
      query: (data) => ({
        url: `/authentication/me/bank`,
        method: "PUT",
        data
      })
    })
  })
});

export const { useFetchUserBankQuery, useCreateUserBankMutation, useUpdateUserBankMutation } = extendedApiSlice;
