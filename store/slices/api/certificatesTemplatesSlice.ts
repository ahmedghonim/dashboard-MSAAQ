import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, CertificateTemplate, Product } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCertificatesTemplates: builder.query<APIResponse<CertificateTemplate>, object | void>({
      query: (params: object = {}) => ({
        url: `/certificate_templates`,
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "certificates_templates.index" as const, id })),
              { type: "certificates_templates.index", id: "LIST" }
            ]
          : [{ type: "certificates_templates.index", id: "LIST" }]
    }),
    fetchCertificatesTemplate: builder.query<CertificateTemplate, string | number>({
      query: (id: string | number) => ({
        url: `/certificate_templates/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "certificates_templates.index", id }],
      transformResponse: (response: { data: CertificateTemplate }) => response.data
    }),
    createCertificateTemplate: builder.mutation<CertificateTemplate, DeepPartial<CertificateTemplate>>({
      query: ({ ...certificate }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/certificate_templates",
        method: "POST",
        data: certificate
      }),
      invalidatesTags: (result, error, id) => [{ type: "certificates_templates.index", id: "LIST" }]
    }),
    updateCertificateTemplate: builder.mutation<
      Product,
      Pick<CertificateTemplate, "id"> &
        Omit<DeepPartial<CertificateTemplate>, "id"> & { "deleted-logo"?: number | number[] } & {
          "deleted-background"?: number | number[];
        }
    >({
      query: ({ id, ...certificate }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/certificate_templates/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: certificate
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "certificates_templates.index", id }]
    }),
    deleteCertificateTemplate: builder.mutation<
      { success: boolean; id: number },
      { id: number | string; alt_certificate_template_id: number | string }
    >({
      query: ({ id, alt_certificate_template_id }) => ({
        url: `/certificate_templates/${id}`,
        method: "DELETE",
        data: {
          alt_certificate_template_id
        }
      }),
      invalidatesTags: (result, error, id) => [{ type: "certificates_templates.index", id: "LIST" }]
    }),
    replicateCertificateTemplate: builder.mutation<CertificateTemplate, number>({
      query: (id) => ({
        url: `/certificate_templates/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "certificates_templates.index", id: "LIST" }]
    })
  })
});

export const {
  useFetchCertificatesTemplatesQuery,
  useFetchCertificatesTemplateQuery,
  useCreateCertificateTemplateMutation,
  useUpdateCertificateTemplateMutation,
  useReplicateCertificateTemplateMutation,
  useDeleteCertificateTemplateMutation
} = extendedApiSlice;
