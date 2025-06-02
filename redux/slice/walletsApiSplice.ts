import { apiSlice } from "./apiSlice";

interface ITransactionFx  {
  sellRate: number;
  buyRate: number;
  percentagePerWithdrawal: number;
  profitPerCoins: number;
  nairaToDollar: number;
}

const WALLET_URL = "wallet";
const walletApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    transactionHistory: builder.mutation({
      query: (walletRequest) => ({
        url: `${WALLET_URL}/transaction-history?page=${walletRequest.page}&size=${walletRequest.size}&isBill=${walletRequest.isBill}&id=${walletRequest?.id}`,
        method: "POST",
      }),
    }),
    claimPrice: builder.mutation({
      query: (giveawayId) => ({
        url: `${WALLET_URL}/claim-price?giveawayId=${giveawayId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wallet", "Giveaways"],
    }),
    creditWallet: builder.mutation({
      query: (request) => ({
        url: `${WALLET_URL}/credit-wallet`,
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Wallet"],
    }),
    getWallet: builder.query({
      query: () => ({
        url: `${WALLET_URL}`,
        method: "GET",
      }),
      providesTags: ["Wallet"],
    }),
    getBankList: builder.query({
      query: () => ({
        url: `${WALLET_URL}/banklist`,
        method: "GET",
      }),
    }),
    withdrawRequest: builder.mutation({
      query: (withdrawRequest) => ({
        url: `${WALLET_URL}/withdraw`,
        method: "POST",
        body: withdrawRequest,
      }),
      invalidatesTags: ["Wallet"],
    }),
    getTransactionFX: builder.query<ITransactionFx, {}>({
      query: () => ({
        url: `${WALLET_URL}/transactionfx/get`,
        method: "GET",
      }),
      providesTags: ["Wallet"],
      transformResponse: (({data}: {data: ITransactionFx}) => data )
    }),
  }),
});

export const {
  useClaimPriceMutation,
  useCreditWalletMutation,
  useTransactionHistoryMutation,
  useGetWalletQuery,
  useGetBankListQuery,
  useWithdrawRequestMutation,
  useGetTransactionFXQuery,
} = walletApiSlice;
