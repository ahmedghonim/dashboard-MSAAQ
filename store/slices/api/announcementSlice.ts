import { apiSlice } from "@/store/slices/api/apiSlice";
import { DeepPartial } from "@/types";
import { Announcement } from "@/types/models/announcement";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAnnouncements: builder.query<
      {
        data: Announcement[];
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/announcements",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "announcements.index" as const, id })),
              { type: "announcements.index", id: "LIST" }
            ]
          : [{ type: "announcements.index", id: "LIST" }]
    }),
    updateAnnouncements: builder.mutation<
      DeepPartial<Announcement>,
      {
        announcement_id: string;
      }
    >({
      query: ({ announcement_id }) => ({
        url: `/announcements/${announcement_id}/mark-as-read`,
        method: "POST"
      }),
      invalidatesTags: (result, error, { announcement_id }) => [{ type: "announcements.index", announcement_id }]
    })
  })
});

export const { useFetchAnnouncementsQuery, useUpdateAnnouncementsMutation } = extendedApiSlice;
