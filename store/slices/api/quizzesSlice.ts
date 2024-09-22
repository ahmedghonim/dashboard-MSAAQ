import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, DeepPartial } from "@/types";
import { Quiz } from "@/types/models/quiz";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchQuizzes: builder.query<APIResponse<Quiz>, object | void>({
      query: (params: object = {}) => ({
        url: "/quizzes",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "quizzes.index" as const, id })),
              { type: "quizzes.index", id: "LIST" }
            ]
          : [{ type: "quizzes.index", id: "LIST" }]
    }),
    fetchQuiz: builder.query<Quiz, number | string>({
      query: (id: number | string) => ({
        url: `/quizzes/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Quiz }) => response.data,
      providesTags: (result, error, id) => [{ type: "quizzes.index", id }]
    }),
    createQuiz: builder.mutation<Quiz, { data: DeepPartial<Quiz> }>({
      query: ({ ...data }) => ({
        url: "/quizzes",
        method: "POST",
        ...data
      }),
      invalidatesTags: () => [{ type: "quizzes.index", id: "LIST" }]
    }),
    updateQuiz: builder.mutation<
      Quiz,
      { quizId: string | number; chapterId?: string | number; data: DeepPartial<Quiz> }
    >({
      query: ({ quizId, chapterId, ...data }) => ({
        url: `/quizzes/${quizId}`,
        method: "PUT",
        ...data
      }),
      invalidatesTags: (result, error, { quizId, chapterId }) => [
        { type: "quizzes.index", quizId },
        { type: "chapters.content", chapterId }
      ]
    }),

    deleteQuiz: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/quizzes/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "quizzes.index", id: "LIST" }]
    })
  })
});

export const {
  useFetchQuizzesQuery,
  useUpdateQuizMutation,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useFetchQuizQuery
} = extendedApiSlice;
