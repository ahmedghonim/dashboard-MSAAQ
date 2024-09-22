import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, AnyObject, Course, ProductsCharts } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchTopSellingProducts: builder.query<
      { courses: ProductsCharts["courses"]; products: ProductsCharts["products"] },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/products/top-selling",
        method: "GET",
        params
      })
    }),
    fetchCoursesAndProductsReport: builder.query<APIResponse<Course>, AnyObject>({
      query: ({ type, ...params }) => {
        return {
          url: `/dashboards/reports/products/${type}`,
          method: "GET",
          params
        };
      }
    })
  })
});

export const { useFetchTopSellingProductsQuery, useFetchCoursesAndProductsReportQuery } = extendedApiSlice;
