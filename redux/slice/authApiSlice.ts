import { apiSlice } from "./apiSlice";

const AUTH_URL = "auth";
const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (signUpRequest) => ({
        url: `${AUTH_URL}/register`,
        method: "POST",
        body: signUpRequest,
      }),
    }),

    signIn: builder.mutation({
      query: (loginRequest) => ({
        url: `${AUTH_URL}/login`,
        method: "POST",
        body: loginRequest,
      }),
      invalidatesTags: ["Followers", "Followings", "Users", "Giveaways", "Hosted", "Participated", "Wallet"]
    }),

    verifyEmail: builder.mutation({
      query: (emailAddress) => ({
        url: `${AUTH_URL}/verify-email/request`,
        method: "POST",
        body: emailAddress,
      }),
    }),

    validateEmailCode: builder.mutation({
      query: (verificationRequest) => ({
        url: `${AUTH_URL}/verify-email/validate`,
        method: "POST",
        body: verificationRequest,
      }),
    }),

    requestPasswordReset: builder.mutation({
      query: (emailAddress) => ({
        url: `${AUTH_URL}/reset-password/request`,
        method: "POST",
        body: emailAddress,
      }),
    }),

    validateResetCode: builder.mutation({
      query: (resetCodeValidationRequest) => ({
        url: `${AUTH_URL}/reset-password/validate`,
        method: "POST",
        body: resetCodeValidationRequest,
      }),
    }),

    resetPassword: builder.mutation({
      query: (passwordResetRequest) => ({
        url: `${AUTH_URL}/reset-password`,
        method: "POST",
        body: passwordResetRequest,
      }),
    }),
  }),
});

export const {
  useSignInMutation,
  useSignupMutation,
  useValidateEmailCodeMutation,
  useVerifyEmailMutation,
  useRequestPasswordResetMutation,
  useValidateResetCodeMutation,
  useResetPasswordMutation,
} = authApiSlice;
