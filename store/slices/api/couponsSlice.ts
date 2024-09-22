import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, AnyObject } from "@/types";
import { Coupon, CouponStats, CouponUse } from "@/types/models/coupon";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCoupons: builder.query<APIResponse<Coupon>, object | void>({
      query: (params: object = {}) => ({
        url: "/coupons",
        method: "GET",
        params
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "coupons.index" as const, id })),
              { type: "coupons.index", id: "LIST" }
            ]
          : [{ type: "coupons.index", id: "LIST" }]
    }),
    fetchCoupon: builder.query<Coupon, number | string>({
      query: (id: number | string) => ({
        url: `/coupons/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "coupons.index", id }],
      transformResponse: (response: { data: Coupon }) => response.data
    }),
    deleteCoupon: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/coupons/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "coupons.index", id: "LIST" }]
    }),
    createCoupon: builder.mutation<Coupon, DeepPartial<Coupon>>({
      query: (data) => ({
        url: `/coupons`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "coupons.index", id: "LIST" }]
    }),
    updateCoupon: builder.mutation<Coupon, Pick<Coupon, "id"> & Omit<DeepPartial<Coupon>, "id">>({
      query: ({ id, ...coupon }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/coupons/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(coupon)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "coupons.index", id }]
    }),
    fetchCouponUses: builder.query<APIResponse<CouponUse>, AnyObject>({
      query: ({ couponId, ...params }) => ({
        url: `/coupons/${couponId}/uses`,
        method: "GET",
        params
      })
    }),
    fetchCouponStats: builder.query<
      {
        data: CouponStats;
      },
      { couponId: string }
    >({
      query: ({ couponId, ...params }) => ({
        url: `coupons/${couponId}/uses/stats`,
        method: "GET",
        params
      })
    })
  })
});

export const {
  useFetchCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useFetchCouponsQuery,
  useDeleteCouponMutation,
  useFetchCouponUsesQuery,
  useFetchCouponStatsQuery
} = extendedApiSlice;
