import { apiSlice } from "@/store/slices/api/apiSlice";
import { DeepPartial, EmailTemplateInputs, NotificationsData, NotificationsSettings } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchNotifications: builder.query<
      {
        data: NotificationsData;
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/notifications",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.notifications.map(({ id }) => ({ type: "notifications.index" as const, id })),
              { type: "notifications.index", id: "LIST" }
            ]
          : [{ type: "notifications.index", id: "LIST" }]
    }),
    updateNotifications: builder.mutation<
      DeepPartial<NotificationsData>,
      {
        notification_id: string;
      }
    >({
      query: (data) => ({
        url: "/notifications/mark-as-read",
        method: "POST",
        params: {
          _method: "PATCH"
        },
        data
      }),
      invalidatesTags: () => [{ type: "notifications.index", id: "LIST" }]
    }),
    fetchNotificationsSettings: builder.query<
      {
        data: NotificationsSettings;
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/notifications/settings",
        method: "GET",
        params
      }),
      providesTags: ["notifications.settings"]
    }),
    updateNotificationsSettings: builder.mutation<
      DeepPartial<NotificationsSettings["settings"]>,
      {
        data: NotificationsSettings["settings"];
      }
    >({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/notifications/settings",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(data)
      }),
      invalidatesTags: ["notifications.settings"]
    }),
    updateNotificationsEmailTemplate: builder.mutation<any, EmailTemplateInputs>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/notifications/update-email-template",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(data)
      }),
      invalidatesTags: ["notifications.settings"]
    })
  })
});

export const {
  useLazyFetchNotificationsQuery,
  useFetchNotificationsQuery,
  useUpdateNotificationsMutation,
  useFetchNotificationsSettingsQuery,
  useUpdateNotificationsSettingsMutation,
  useUpdateNotificationsEmailTemplateMutation
} = extendedApiSlice;
