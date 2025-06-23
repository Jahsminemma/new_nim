import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storeData, removeStoredData, removeToken } from "@/utils";
import {createAsyncThunk} from "@reduxjs/toolkit"

export enum LoginStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED'
}

export interface User {
    id: string;
    email: string;
    name: string;
    username?: string;
    accountType: 'individual' | 'brand';
    accessToken?: string;
    refreshToken?: string;
}

interface AuthState {
    user: User | null;
    loginStatus: LoginStatus;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
    user: null,
    loginStatus: LoginStatus.INACTIVE,
    isLoading: false,
    hasCompletedOnboarding: false,
};

export const setCredentialsAsync = createAsyncThunk(
    'auth/setCredentialsAsync',
    async (userData: any) => {
        await storeData("userData", userData);
    }
);

export const setAuthStatusAsync = createAsyncThunk(
    'auth/setAuthStatus',
    async (userActiveData: any) => {        
        await storeData("authStatus", userActiveData);
    }
);

export const logOutAsync = createAsyncThunk(
    'auth/logOutAsync',
    async (key: any) => {
        await removeStoredData(key);
        await removeToken()
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setLoginStatus: (state, action: PayloadAction<LoginStatus>) => {
            setAuthStatusAsync({status: true})
            state.loginStatus = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
            state.hasCompletedOnboarding = action.payload;
        },
        logout: (state, action) => {
            state.user = null
            setAuthStatusAsync({status: false})
            removeToken().then()
        }
    },
});

export const { 
    setCredentials, 
    setLoginStatus, 
    setLoading, 
    setOnboardingComplete,
    logout 
} = authSlice.actions;

export default authSlice.reducer;