import { apiSlice } from "./apiSlice";

 export type OrderRequest = {
    category: string;
    provider: string;
    amount: number;
    fee: number;
    narration?: string;
    pin: string;
    saveBeneficiary: boolean;
    phoneNumber: string;
    data?: {
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone: string;
    },
    airtime?: {
      serviceID: string;
      amount: number;
      phone: string;
    },
    cable?:{
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone?: string;
      subscriptionType?: "change" | "renew"
    }
    electricity?: {
      serviceID: string;
      variationCode: string;
      billersCode: string;
      amount: number;
      phone: string;
    }
    giftCard?: {
      unitPrice: number;
      productId: number;
      recipientEmail: string;
    }
  }

const SERVICE_URL = "service";

const servicesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation({
      query: (orderRequest: OrderRequest) => ({
        url: `order/placeOrder`,
        method: "POST",
        body: orderRequest,
      }),
      invalidatesTags: ["Wallet"],
    }),
    getActiveProviders: builder.query({
      query: (categoryName: string) => ({
        url: `${SERVICE_URL}/active-providers?categoryName=${categoryName}`,
        method: "GET",
      }),
    }),
    getDataPackages: builder.query({
      query: (productCode: string) => ({
        url: `${SERVICE_URL}/data-packages?productCode=${productCode}`,
        method: "GET",
      }),
    }),
    getCableTvPackages: builder.query({
      query: (productCode: string) => ({
        url: `${SERVICE_URL}/cabletv-packages?productCode=${productCode}`,
        method: "GET",
      }),
    }),
    cableInfoEnquiry: builder.query({
      query: (cableData: { smartCard: string; serviceID: string }) => ({
        url: `${SERVICE_URL}/cable-info?smartCard=${cableData.smartCard}&serviceID=${cableData.serviceID}`,
        method: "GET",
      }),
    }),
    meterNumberValidation: builder.query({
      query: (meterData: {
        billersCode: string;
        serviceID: string;
        type: string;
      }) => ({
        url: `${SERVICE_URL}/meter-validation?billersCode=${meterData.billersCode}&serviceID=${meterData.serviceID}&type=${meterData.type}`,
        method: "GET",
      }),
    }),
    fetchBeneficiary: builder.query({
      query: (serviceType: string) => ({
        url: `${SERVICE_URL}/beneficiary?serviceType=${serviceType}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetActiveProvidersQuery,
  useGetCableTvPackagesQuery,
  useGetDataPackagesQuery,
  useCableInfoEnquiryQuery,
  useMeterNumberValidationQuery,
  useFetchBeneficiaryQuery,
  usePlaceOrderMutation,
} = servicesApiSlice;
