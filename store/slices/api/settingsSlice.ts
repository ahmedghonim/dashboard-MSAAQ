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
    updateAcademySettings: builder.mutation<Academy, DeepPartial<Academy>>({
      query: ({ ...academy }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/settings",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(academy)
      })
    })
  })
});

export const { useUpdateAcademySettingsMutation } = extendedApiSlice;
