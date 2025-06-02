import { apiSlice } from "./apiSlice";

const GIFT_CARD_URL = "gift-cardS";
const giftCardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGiftCards: builder.mutation({
      query: ({ page, size, countryCode }) => ({
        url: `${GIFT_CARD_URL}/products?page=${page}&size=${size}&countryCode=${countryCode}`,
        method: "GET",
      }),
    }),
    getCountries: builder.query({
      query: () => ({
        url: `${GIFT_CARD_URL}/countries`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetGiftCardsMutation, useGetCountriesQuery } =
  giftCardApiSlice;
