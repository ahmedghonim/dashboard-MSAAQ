import { apiSlice } from "@/store/slices/api/apiSlice";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchEntity: builder.query<any, object | void>({
      query: (params: object = {}) => ({
        url: "/verification/entity",
        method: "GET",
        params
      }),
      providesTags: () => [{ type: "entity.index", id: "LIST" }]
    }),
    createEntity: builder.mutation<any, any>({
      query: (data) => ({
        url: "/verification",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        method: "POST",
        data: convertBooleans(data)
      }),
      invalidatesTags: () => [{ type: "entity.index", id: "LIST" }]
    })
  })
});

export const { useFetchEntityQuery, useCreateEntityMutation } = extendedApiSlice;
