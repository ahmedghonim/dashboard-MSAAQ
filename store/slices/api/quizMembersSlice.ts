import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { QuizMember } from "@/types/models/quizMember";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchQuizMembers: builder.query<APIResponse<QuizMember>, { quizId: number | string }>({
      query: (params: any) => ({
        url: `/quizzes/${params.quizId}/members`,
        method: "GET",
        params
      })
    })
  })
});

export const { useFetchQuizMembersQuery } = extendedApiSlice;
