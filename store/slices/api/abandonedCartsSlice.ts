import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, APISingleResourceResponse, Cart, DeepPartial, Member, Reminder } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchStats: builder.query<
      {
        abandoned_carts: number;
        potential_revenues: number;
        recovered_carts: number;
        recovered_revenues: number;
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/carts/stats",
        method: "GET",
        params
      }),
      transformResponse: (
        response: APISingleResourceResponse<{
          abandoned_carts: number;
          potential_revenues: number;
          recovered_carts: number;
          recovered_revenues: number;
        }>
      ) => response.data
    }),
    fetchCarts: builder.query<APIResponse<Cart>, object | void>({
      query: (params: object = {}) => ({
        url: "/carts",
        method: "GET",
        params
      }),
      transformResponse: (response: APIResponse<Cart>) => {
        return {
          ...response,
          data: response.data.map((cart) => {
            if (!cart.member && cart.email) {
              return {
                ...cart,
                member: {
                  avatar: {
                    url: "/images/Avatar-Placeholder.png"
                  },
                  email: cart.email,
                  is_verified: false,
                  __temp_member: true
                } as Member & {
                  __temp_member?: boolean;
                }
              };
            }
            return cart;
          })
        };
      }
    }),
    fetchReminders: builder.query<APIResponse<Reminder>, object | void>({
      query: (params: object = {}) => ({
        url: "/carts/reminders",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "abandoned_carts.reminders.index" as const, id })),
              { type: "abandoned_carts.reminders.index", id: "LIST" }
            ]
          : [{ type: "abandoned_carts.reminders.index", id: "LIST" }]
    }),
    fetchReminder: builder.query<Reminder, number | string>({
      query: (id: number | string) => ({
        url: `/carts/reminders/${id}`,
        method: "GET"
      }),
      providesTags: (result) => (result ? [{ type: "abandoned_carts.reminders.index" as const, id: result.id }] : []),
      transformResponse: (response: APISingleResourceResponse<Reminder>) => response.data
    }),
    createReminder: builder.mutation<
      Reminder,
      {
        url?: string;
        cart_id?: number | string;
        discount_enabled?: boolean;
      } & Omit<DeepPartial<Reminder>, "uuid" | "id" | "status">
    >({
      query: ({ url, ...data }) => ({
        url: url || "carts/reminders",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "abandoned_carts.reminders.index", id: "LIST" }]
    }),
    updateReminder: builder.mutation<
      Reminder,
      Pick<Reminder, "id"> & {
        discount_enabled?: boolean;
      } & Omit<DeepPartial<Reminder>, "uuid" | "id">
    >({
      query: ({ id, ...data }) => ({
        url: `carts/reminders/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data
      }),
      invalidatesTags: (result, error, { id }) =>
        result ? [{ type: "abandoned_carts.reminders.index", id: result.id }] : []
    }),
    deleteReminder: builder.mutation<void, number | string>({
      query: (id: number | string) => ({
        url: `carts/reminders/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, id) => [{ type: "abandoned_carts.reminders.index", id }]
    })
  })
});

export const {
  useFetchStatsQuery,
  useFetchRemindersQuery,
  useFetchReminderQuery,
  useUpdateReminderMutation,
  useCreateReminderMutation,
  useDeleteReminderMutation,
  useFetchCartsQuery
} = extendedApiSlice;
