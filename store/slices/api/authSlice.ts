import { apiSlice } from "@/store/slices/api/apiSlice";
import { User } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerAuth: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        url: "/authentication/register",
        method: "POST",
        data: data
      })
    }),
    forgetPassword: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        url: "/authentication/password/email",
        method: "POST",
        data: data
      })
    }),
    updateEmail: builder.mutation<
      User,
      DeepPartial<{
        new_email: string;
        password: string;
      }>
    >({
      query: (data) => ({
        url: "/authentication/change-email",
        method: "POST",
        data: data
      })
    }),
    updatePassword: builder.mutation<
      User,
      DeepPartial<{
        old_password: string;
        password: string;
        password_confirmation: string;
      }>
    >({
      query: (data) => ({
        url: "/authentication/change-password",
        method: "POST",
        data: data
      })
    }),

    resetPassword: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        url: "/authentication/password/reset",
        method: "POST",
        data: data
      })
    }),
    acceptInvitation: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        url: "/authentication/accept-invitation",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: data
      })
    }),
    updateAuth: builder.mutation<User, DeepPartial<User>>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: "/authentication/update",
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(data)
      })
    }),
    phoneVerify: builder.mutation<
      {
        verification_uuid: string;
        "cf-turnstile-response": string;
        verification_code: string;
      },
      DeepPartial<User>
    >({
      query: (data) => ({
        url: "/authentication/send-verification-code",
        method: "POST",
        data: data
      })
    })
  })
});

export const {
  useUpdateAuthMutation,
  useUpdateEmailMutation,
  useRegisterAuthMutation,
  useUpdatePasswordMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  usePhoneVerifyMutation,
  useAcceptInvitationMutation
} = extendedApiSlice;
