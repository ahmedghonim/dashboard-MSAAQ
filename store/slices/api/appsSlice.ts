import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, App, Product } from "@/types";

interface unknownAPIKeys {
  [key: string]: any;
}

interface appKeys extends unknownAPIKeys {
  id: number | string;
}

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchApps: builder.query<APIResponse<App>, object | void>({
      query: (params: object = {}) => ({
        url: "/apps",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "apps.index" as const, id })), { type: "apps.index", id: "LIST" }]
          : [{ type: "apps.index", id: "LIST" }]
    }),
    fetchApp: builder.query<App, number | string>({
      query: (idOrSlug) => ({
        url: `/apps/${idOrSlug}`,
        method: "GET"
      }),
      transformResponse: (response: { data: App }) => response.data,
      providesTags: (result, error, id) => [{ type: "apps.index", id }]
    }),
    fetchProperties: builder.query<APIResponse<any>, object | void>({
      query: () => ({
        url: `/apps/google-analytics/properties-list`,
        method: "GET"
      }),
      providesTags: () => [{ type: "apps.properties", id: "LIST" }]
    }),
    installApp: builder.mutation<App, appKeys>({
      query: ({ id, ...data }) => ({
        url: `/apps/${id}/install`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "apps.index", id }]
    }),
    uninstallApp: builder.mutation<App, appKeys>({
      query: ({ id, ...data }) => ({
        url: `/apps/${id}/uninstall`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "apps.index", id }]
    })
  })
});

export const {
  useFetchAppsQuery,
  useInstallAppMutation,
  useUninstallAppMutation,
  useFetchAppQuery,
  useFetchPropertiesQuery
} = extendedApiSlice;
