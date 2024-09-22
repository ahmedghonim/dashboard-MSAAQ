import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { OnBoardingQuestions } from "@/types/models/onboarding-questions";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchQuestions: builder.query<APIResponse<OnBoardingQuestions>, object | void>({
      query: () => ({
        url: `/onboarding/questions`,
        method: "GET"
      })
    }),
    submitQuestions: builder.mutation<APIResponse<OnBoardingQuestions>, object | void>({
      query: (data) => ({
        url: `/onboarding/questions/answers`,
        method: "POST",
        data
      })
    })
  })
});

export const { useFetchQuestionsQuery, useSubmitQuestionsMutation } = extendedApiSlice;
