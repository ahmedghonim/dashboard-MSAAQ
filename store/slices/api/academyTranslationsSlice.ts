import { apiSlice } from "@/store/slices/api/apiSlice";

export type Translations = {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
};
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAcademyTranslations: builder.query<Translations, object | void>({
      query: (params: object = {}) => ({
        url: "/settings/translations",
        method: "GET",
        params
      }),
      providesTags: ["academy.translations.index"]
    }),
    updateAcademyTranslations: builder.mutation<Translations, { texts: Record<string, string> }>({
      query: (data) => ({
        url: "/settings/translations",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data
      }),
      invalidatesTags: ["academy.translations.index"]
    })
  })
});

export const { useFetchAcademyTranslationsQuery, useUpdateAcademyTranslationsMutation } = extendedApiSlice;
