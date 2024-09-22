import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse, APIResponse, DomainRecord } from "@/types";
import { Domain } from "@/types/models/domain";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchDomains: builder.query<APIResponse<Domain>, object | void>({
      query: (params: object = {}) => ({
        url: "/domains",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "domains.index" as const, id })),
              { type: "domains.index", id: "LIST" }
            ]
          : [{ type: "domains.index", id: "LIST" }]
    }),
    fetchDomain: builder.query<Domain, number | string>({
      query: (id: number | string) => ({
        url: `/domains/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "domains.index", id }],
      transformResponse: (response: { data: Domain }) => response.data
    }),
    createDomain: builder.mutation<
      Domain,
      {
        type: "free" | "custom";
        domain: string | unknown;
        slug: string | unknown;
      }
    >({
      query: (data) => ({
        url: "/domains",
        method: "POST",
        data
      }),
      invalidatesTags: (result, error) => [{ type: "domains.index", id: "LIST" }]
    }),
    verifyDomainActivation: builder.mutation<Domain, number | string>({
      query: (id) => ({
        url: `/domains/${id}/verify-activation`,
        method: "PUT"
      })
    }),
    makeDomainDefault: builder.mutation<Domain, number | string>({
      query: (id) => ({
        url: `/domains/${id}/make-default`,
        method: "PUT"
      })
    }),
    deleteDomain: builder.mutation<object, object | any>({
      query: ({ id }) => ({
        url: `/domains/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error) => [{ type: "domains.index", id: "LIST" }]
    }),
    // DNS
    fetchDomainDns: builder.query<APIResponse<DomainRecord>, object | any>({
      query: ({ domainId, ...params }) => ({
        url: `/domains/${domainId}/dns`,
        method: "GET",
        params
      })
    }),
    createDomainDns: builder.mutation<DomainRecord, any>({
      query: ({ domainId, ...data }) => ({
        url: `/domains/${domainId}/dns`,
        method: "POST",
        data
      })
    }),
    updateDomainDns: builder.mutation<object, object | any>({
      query: ({ domainId, recordId, ...data }) => ({
        url: `/domains/${domainId}/dns/${recordId}`,
        method: "PUT",
        data
      })
    }),
    deleteDomainDns: builder.mutation<object, object | any>({
      query: ({ domainId, recordId }) => ({
        url: `/domains/${domainId}/dns/${recordId}`,
        method: "DELETE"
      })
    })
  })
});

export const {
  useFetchDomainsQuery,
  useFetchDomainQuery,
  useFetchDomainDnsQuery,
  useDeleteDomainMutation,
  useCreateDomainMutation,
  useCreateDomainDnsMutation,
  useDeleteDomainDnsMutation,
  useUpdateDomainDnsMutation,
  useVerifyDomainActivationMutation,
  useMakeDomainDefaultMutation
} = extendedApiSlice;
