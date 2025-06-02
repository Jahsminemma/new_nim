import { apiSlice } from "./apiSlice";

const GIVEAWAY_URL = "giveaway";
const giveawayApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGiveaway: builder.mutation({
      query: (createGiveawayRequest: any) => ({
        url: `${GIVEAWAY_URL}/create`,
        method: "POST",
        body: createGiveawayRequest,
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
        "Wallet"
      ],
    }),
    getGiveawayById: builder.query({
      query: (giveawayId: string) => ({
        url: `${GIVEAWAY_URL}?giveawayId=${giveawayId}`,
        method: "GET",
      }),
      providesTags: ["Giveaways"],
    }),
    getGiveaways: builder.mutation({
      query: (getGiveawayRequest) => ({
        url: `${GIVEAWAY_URL}?page=${getGiveawayRequest.page}&size=${getGiveawayRequest.size}`,
        method: "POST",
      }),
    }),
    joinGiveaway: builder.mutation({
      query: (giveawayId: string) => ({
        url: `${GIVEAWAY_URL}/join?giveawayId=${giveawayId}`,
        method: "POST",
        body: "",
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    leaveGiveaway:  builder.mutation({
      query: (giveawayId: string) => ({
        url: `${GIVEAWAY_URL}/leave?giveawayId=${giveawayId}`,
        method: "POST",
        body: "",
      }),
      invalidatesTags: [
        "Followers",
        "Followings",
        "Users",
        "Giveaways",
        "Hosted",
        "Participated",
      ],
    }),
    suggestedQuestions: builder.query({
      query: ({ queryTerm }) => ({
        url: `${GIVEAWAY_URL}/suggest?queryTerm=${queryTerm}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateGiveawayMutation,
  useGetGiveawayByIdQuery,
  useGetGiveawaysMutation,
  useJoinGiveawayMutation,
  useSuggestedQuestionsQuery,
  useLeaveGiveawayMutation,
} = giveawayApiSlice;
