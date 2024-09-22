import { apiSlice } from "@/store/slices/api/apiSlice";
import { Academy } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createAcademy: builder.mutation<
      Academy,
      { title: string; slug: string; favicon?: any; logo?: any; meta_description?: string; email: string }
    >({
      query: ({ ...academy }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/academies`,
        method: "POST",
        data: convertBooleans(academy)
      })
    }),
    updateAcademy: builder.mutation<Academy, DeepPartial<Academy>>({
      query: ({ ...academy }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/academies`,
        method: "POST",
        data: convertBooleans(academy)
      })
    })
  })
});

export const { useCreateAcademyMutation } = extendedApiSlice;
