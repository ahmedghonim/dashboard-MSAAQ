import { apiSlice } from "@/store/slices/api/apiSlice";
import { Certificate } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createCertificate: builder.mutation<
      Certificate,
      {
        courseId: number | string;
        memberId: number | string;
        data: {
          type: string;
          serial?: string;
          certificate?: File | Blob;
        };
      }
    >({
      query: ({ courseId, memberId, data }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/certificates",
        method: "POST",
        data: {
          course_id: courseId,
          member_id: memberId,
          ...convertBooleans(data)
        }
      }),
      invalidatesTags: ["enrollments.index"]
    }),
    deleteCertificate: builder.mutation<{ success: boolean; id: number }, { certificateID: number | string }>({
      query: ({ certificateID }) => ({
        url: `/certificates/${certificateID}`,
        method: "DELETE"
      }),
      invalidatesTags: ["enrollments.index"]
    })
  })
});

export const { useCreateCertificateMutation, useDeleteCertificateMutation } = extendedApiSlice;
