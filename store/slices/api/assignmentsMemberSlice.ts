import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, AssignmentMember } from "@/types";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAssignmentMembers: builder.query<APIResponse<AssignmentMember>, object | void>({
      query: (params: object = {}) => ({
        url: "/assignment-members",
        method: "GET",
        params
      })
    }),
    fetchAssignmentMember: builder.query<AssignmentMember, number | string>({
      query: (id: number | string) => ({
        url: `/assignment-members/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: AssignmentMember }) => response.data
    }),
    updateAssignmentMember: builder.mutation<
      AssignmentMember,
      Pick<AssignmentMember, "id"> & { status: number | string; notes: string }
    >({
      query: ({ id, ...assignmentMember }) => ({
        url: `/assignment-members/${id}`,
        method: "PUT",
        data: assignmentMember
      })
    })
  })
});

export const { useFetchAssignmentMembersQuery, useFetchAssignmentMemberQuery, useUpdateAssignmentMemberMutation } =
  extendedApiSlice;
