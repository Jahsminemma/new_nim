import { apiSlice } from "./apiSlice";

const SOCIAL_URL = "user/social";
const socialApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSocialData: builder.mutation({
      query: (socialRequest) => ({
        url: `${SOCIAL_URL}/create`,
        method: "POST",
        body: socialRequest,
        variables: { socialRequest },
      }),
      invalidatesTags: ["Users"]
    }),
  }),
});

export const { useCreateSocialDataMutation } =
  socialApiSlice;
