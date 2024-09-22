import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, CancellationReasons, Subscription } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchSubscriptions: builder.query<Subscription, object | void>({
      query: (params: object = {}) => ({
        url: "/billing/subscription",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: Subscription }) => response.data
    }),
    fetchSubscriptionCancellationReasons: builder.query<APIResponse<CancellationReasons>, object | void>({
      query: (params: any = {}) => ({
        url: "/cancellation-reasons",
        method: "GET",
        params: {
          ...params,
          filters: {
            ...(params?.filters ?? {}),
            type: "plan"
          }
        }
      })
    }),
    pauseSubscription: builder.mutation<Subscription, object>({
      query: (data) => ({
        url: "/billing/subscription/pause",
        method: "POST",
        data
      })
    }),
    unpauseSubscription: builder.mutation<Subscription, object>({
      query: (data) => ({
        url: "/billing/subscription/unpause",
        method: "POST",
        data
      })
    }),
    swapSubscription: builder.mutation<Subscription, object>({
      query: (data) => ({
        url: "/billing/subscription/swap",
        method: "POST",
        data
      })
    })
  })
});

export const {
  useFetchSubscriptionsQuery,
  usePauseSubscriptionMutation,
  useUnpauseSubscriptionMutation,
  useSwapSubscriptionMutation,
  useFetchSubscriptionCancellationReasonsQuery
} = extendedApiSlice;
