import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Taxonomy } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchTaxonomies: builder.query<APIResponse<Taxonomy>, object | void>({
      query: (params: object = {}) => ({
        url: "/taxonomies",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "taxonomies.index" as const, id })),
              { type: "taxonomies.index", id: "LIST" }
            ]
          : [{ type: "taxonomies.index", id: "LIST" }]
    }),
    fetchTaxonomy: builder.query<Taxonomy, number | string>({
      query: (taxonomyId: number | string) => ({
        url: `/taxonomies/${taxonomyId}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Taxonomy }) => response.data,
      providesTags: (result, error, id) => [{ type: "taxonomies.index", id }]
    }),

    updateTaxonomy: builder.mutation<Taxonomy, Pick<Taxonomy, "id"> & Omit<DeepPartial<Taxonomy>, "id">>({
      query: ({ id, ...taxonomy }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/taxonomies/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(taxonomy)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "taxonomies.index", id }]
    }),
    createTaxonomy: builder.mutation<Taxonomy, DeepPartial<Taxonomy>>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/taxonomies`,
        method: "POST",
        data: convertBooleans(data)
      }),
      invalidatesTags: () => [{ type: "taxonomies.index", id: "LIST" }]
    }),
    deleteTaxonomy: builder.mutation<
      { success: boolean; id: number },
      { id: number | string; alt_taxonomy_id: number | string }
    >({
      query: ({ id, alt_taxonomy_id }) => ({
        url: `/taxonomies/${id}`,
        method: "DELETE",
        data: {
          alt_taxonomy_id
        }
      }),
      invalidatesTags: () => [{ type: "taxonomies.index", id: "LIST" }]
    }),
    replicateTaxonomy: builder.mutation<Taxonomy, number>({
      query: (id) => ({
        url: `/taxonomies/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: () => [{ type: "taxonomies.index", id: "LIST" }]
    })
  })
});

export const {
  useFetchTaxonomiesQuery,
  useCreateTaxonomyMutation,
  useUpdateTaxonomyMutation,
  useReplicateTaxonomyMutation,
  useDeleteTaxonomyMutation
} = extendedApiSlice;
