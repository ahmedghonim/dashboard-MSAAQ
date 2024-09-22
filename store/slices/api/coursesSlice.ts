import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Course, CourseStats } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCourses: builder.query<APIResponse<Course>, object | void>({
      query: (params: object = {}) => ({
        url: "/courses",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "courses.index" as const, id })),
              { type: "courses.index", id: "LIST" }
            ]
          : [{ type: "courses.index", id: "LIST" }]
    }),
    fetchCourse: builder.query<Course, number | string>({
      query: (courseId: number | string) => ({
        url: `/courses/${courseId}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Course }) => response.data,
      providesTags: (result, error, id) => [{ type: "courses.index", id }]
    }),
    fetchCourseStats: builder.query<CourseStats, number | string>({
      query: (courseId: number | string) => ({
        url: `/courses/${courseId}/stats`,
        method: "GET"
      }),
      transformResponse: (response: { data: CourseStats }) => response.data
    }),
    updateCourse: builder.mutation<
      Course,
      Pick<Course, "id"> &
        Omit<DeepPartial<Course>, "id"> & {
          certificate_template_id?: number;
        }
    >({
      query: ({ id, ...course }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/courses/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: {
          ...convertBooleans(course)
        }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "courses.index", id }]
    }),
    createCourse: builder.mutation<Course, DeepPartial<Course>>({
      query: (data) => ({
        url: `/courses`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "courses.index", id: "LIST" }]
    }),
    deleteCourse: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/courses/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "courses.index", id: "LIST" }]
    }),
    replicateCourse: builder.mutation<Course, number>({
      query: (id) => ({
        url: `/courses/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "courses.index", id: "LIST" }]
    })
  })
});

export const {
  useFetchCoursesQuery,
  useFetchCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useReplicateCourseMutation,
  useDeleteCourseMutation,
  useFetchCourseStatsQuery
} = extendedApiSlice;
