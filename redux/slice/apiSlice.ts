import {
  fetchBaseQuery,
  createApi,
  BaseQueryApi,
  FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { LoginStatus, logout, setAuthStatusAsync, setLoginStatus } from './authSlice';
import { getToken, getStorageData, removeToken } from '@/utils';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const requiresAuthorization = (endpoint: string) => {
  const exemptEndpoints = [
    'signup',
    'signIn',
    'verifyEmail',
    'validateEmailCode',
    'requestPasswordReset',
    'validateResetCode',
    'resetPassword',
  ];
  return !exemptEndpoints.includes(endpoint);
};

const baseUrl =
  process.env.EXPO_PUBLIC_APP_ENV === 'production'
    ? process.env.EXPO_PUBLIC_API_URL
    : process.env.EXPO_PUBLIC_DEV_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: async (
    headers: Headers,
    api: Pick<
      BaseQueryApi,
      'getState' | 'extra' | 'endpoint' | 'type' | 'forced'
    >
  ) => {
    const tokens = await getToken();
    const accessToken = tokens?.accessToken;
    if (requiresAuthorization(api.endpoint)) {
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  // @ts-ignore
  extraOptions: {}
) => {
  const tokens = await getToken();
  const accessToken = tokens?.accessToken;
  const user = await getStorageData('userData');


  if (requiresAuthorization(api.endpoint && accessToken)) {
    let result = await baseQuery(args, api, extraOptions);
    const currentRefreshToken = tokens?.refreshToken;
    if (!currentRefreshToken) {
      // @ts-ignore
      await AsyncStorage.multiRemove(['tokens', 'userData']);
      api.dispatch(setAuthStatusAsync({ status: false }));
      api.dispatch(setLoginStatus(LoginStatus.INACTIVE));
      api.dispatch(logout(''));
      await removeToken();
      router.replace('/(auth)/login')
    }

    if (
      requiresAuthorization(api.endpoint) &&
      (result.meta?.response?.status === 401 ||
        result.error?.data.status === 403) &&
      currentRefreshToken
    ) {
      await removeToken();
      const refreshResult = await baseQuery(
        {
          url: `auth/request-token`,
          method: 'POST',
          body: { email: user?.email, refreshToken: currentRefreshToken },
        },
        api,
        extraOptions
      );
      // @ts-ignore
      if (refreshResult?.data) {
        // @ts-ignore
        await storeTokens(JSON.stringify(refreshResult?.data?.data));
        result = await baseQuery(args, api, extraOptions);
      } else {
        // @ts-ignore
        await AsyncStorage.multiRemove(['tokens', 'userData']);
        api.dispatch(setAuthStatusAsync({ status: false }));
        api.dispatch(setLoginStatus(LoginStatus.INACTIVE));
        api.dispatch(logout(''));
        await removeToken();
        router.replace('/(auth)/login')
      }
    }
    return result;
  }
  if (requiresAuthorization(api.endpoint) && !accessToken) {
    return { data: '' };
  }
  if (!requiresAuthorization(api.endpoint)) {
    return await baseQuery(args, api, extraOptions);
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Giveaways',
    'Users',
    'Streaks',
    'Followers',
    'Followings',
    'Participated',
    'Hosted',
    'Notification',
    'Wallet',
  ],
  endpoints: (builder) => ({}),
});

