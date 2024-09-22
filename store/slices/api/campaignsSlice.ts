import { omit } from "lodash";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, APISingleResourceResponse, Campaign, DeepPartial } from "@/types";
import { Send } from "@/types/models/send";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCampaigns: builder.query<APIResponse<Campaign>, object | void>({
      query: (params: object = {}) => ({
        url: "/campaigns",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "campaigns.index" as const, id })),
              { type: "campaigns.index", id: "LIST" }
            ]
          : [{ type: "campaigns.index", id: "LIST" }]
    }),
    fetchCampaign: builder.query<Campaign, number | string>({
      query: (id: number | string) => ({
        url: `/campaigns/${id}`,
        method: "GET"
      }),
      providesTags: (result) => (result ? [{ type: "campaigns.index" as const, id: result.id }] : []),
      transformResponse: (response: APISingleResourceResponse<Campaign>) => response.data
    }),
    fetchCampaignEstimateMessage: builder.query<
      {
        estimated_volume: number;
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: `/campaigns/estimate-messages-volume`,
        method: "GET",
        params
      }),
      transformResponse: (
        response: APISingleResourceResponse<{
          estimated_volume: number;
        }>
      ) => response.data
    }),
    fetchSends: builder.query<Send, { campaignId: number | string }>({
      query: (params) => ({
        url: `/campaigns/${params.campaignId}/sends`,
        method: "GET",
        params: omit(params, ["campaignId"])
      }),
      providesTags: (result) => (result ? [{ type: "campaigns.sends" as const, id: result.id }] : [])
    }),
    createCampaign: builder.mutation<Campaign, Omit<DeepPartial<Campaign>, "uuid" | "id">>({
      query: (data) => ({
        url: "/campaigns",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "campaigns.index", id: "LIST" }]
    }),
    updateCampaign: builder.mutation<Campaign, Pick<Campaign, "id"> & Omit<DeepPartial<Campaign>, "uuid" | "id">>({
      query: ({ id, ...data }) => ({
        url: `/campaigns/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data
      }),
      invalidatesTags: (result, error, { id }) => (result ? [{ type: "campaigns.index", id: result.id }] : [])
    }),
    deleteCampaign: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/campaigns/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "campaigns.index", id: "LIST" }]
    }),
    replicateCampaign: builder.mutation<Campaign, number>({
      query: (id) => ({
        url: `/campaigns/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "campaigns.index", id: "LIST" }]
    }),
    sendTestEmail: builder.mutation<
      Campaign,
      Pick<Campaign, "id"> &
        Omit<
          DeepPartial<{
            email: string;
          }>,
          "uuid" | "id"
        >
    >({
      query: ({ id, ...data }) => ({
        url: `/campaigns/${id}/send-test`,
        method: "POST",
        data
      })
    }),
    grant100Message: builder.mutation<void, void>({
      query: () => ({
        url: `/campaigns/grant-free-emails`,
        method: "POST"
      })
    }),
    previewCampaign: builder.mutation<
      Campaign,
      {
        id: string | number;
      }
    >({
      query: ({ id }) => ({
        url: `/campaigns/${id}/preview`,
        method: "GET"
      })
    })
  })
});

export const {
  useFetchCampaignsQuery,
  useFetchSendsQuery,
  useFetchCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useReplicateCampaignMutation,
  useSendTestEmailMutation,
  usePreviewCampaignMutation,
  useGrant100MessageMutation,
  useFetchCampaignEstimateMessageQuery
} = extendedApiSlice;
