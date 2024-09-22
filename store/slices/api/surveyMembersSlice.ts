import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { QuizMember } from "@/types/models/quizMember";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchSurveysMembers: builder.query<APIResponse<QuizMember>, { surveyId: number | string }>({
      query: (params: any) => ({
        url: `/surveys/${params.surveyId}/members`,
        method: "GET",
        params
      })
    })
  })
});

export const { useFetchSurveysMembersQuery } = extendedApiSlice;
