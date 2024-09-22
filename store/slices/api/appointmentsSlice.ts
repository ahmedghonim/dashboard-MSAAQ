import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Product } from "@/types";
import { Appointment } from "@/types/models/appointment";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAppointments: builder.query<APIResponse<Appointment>, object | void>({
      query: (params: object = {}) => ({
        url: "/appointments",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "appointments.index" as const, id })),
              { type: "appointments.index", id: "LIST" }
            ]
          : [{ type: "appointments.index", id: "LIST" }]
    })
  })
});

export const { useFetchAppointmentsQuery } = extendedApiSlice;
