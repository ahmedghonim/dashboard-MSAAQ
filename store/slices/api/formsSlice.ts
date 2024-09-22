import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse } from "@/types";
import { FieldForm, IForm } from "@/types/models/form";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchForm: builder.query<
      {
        data: IForm;
      },
      string
    >({
      query: (type) => ({
        url: `forms?type=${type}`,
        method: "GET"
      })
    }),
    createForm: builder.mutation<
      APIActionResponse<IForm>,
      {
        type: string;
        fields: FieldForm[];
      }
    >({
      query: (data) => ({
        url: `forms`,
        method: "POST",
        data
      })
    })
  })
});

export const { useFetchFormQuery, useCreateFormMutation } = extendedApiSlice;
