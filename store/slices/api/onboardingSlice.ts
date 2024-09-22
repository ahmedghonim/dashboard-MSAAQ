import { apiSlice } from "@/store/slices/api/apiSlice";
import { DeepPartial } from "@/types";
import { Checklist, OnboardingData } from "@/types/models/onboarding";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchOnboardingList: builder.query<OnboardingData[], object | void>({
      query: (params: object = {}) => ({
        url: "/onboarding",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "onboarding.register" as const, id })),
              { type: "onboarding.register", id: "LIST" }
            ]
          : [{ type: "onboarding.register", id: "LIST" }],
      transformResponse: (response: { data: OnboardingData[] }) => response.data
    }),
    markStepAsRead: builder.mutation<
      DeepPartial<OnboardingData>,
      {
        step_id: number;
      }
    >({
      query: ({ step_id }) => ({
        url: `/onboarding/${step_id}/mark-as-read`,
        method: "POST"
      }),
      invalidatesTags: () => [{ type: "onboarding.register", id: "LIST" }]
    }),
    fetchChecklist: builder.query<Checklist[], object | void>({
      query: (params: object = {}) => ({
        url: "/onboarding/checklist",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "onboarding.checklist" as const, id })),
              { type: "onboarding.checklist", id: "LIST" }
            ]
          : [{ type: "onboarding.checklist", id: "LIST" }],
      transformResponse: (response: { data: Checklist[] }) => response.data
    }),
    updateTask: builder.mutation<DeepPartial<Checklist>, object>({
      query: (data) => ({
        url: `/onboarding/checklist`,
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "onboarding.checklist", id: "LIST" }]
    })
  })
});

export const { useFetchOnboardingListQuery, useMarkStepAsReadMutation, useUpdateTaskMutation, useFetchChecklistQuery } =
  extendedApiSlice;
