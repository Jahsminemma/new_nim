import { storeData, removeStoredData, removeToken } from "@/types";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit"

export const enum LoginStatus  {
    ACTIVE="ACTIVE",
    INACTIVE="INACTIVE"
}

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

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: {}, loginStatus: LoginStatus.INACTIVE},
    reducers: {
        setCredentials: (state, action) => {
            state.user = { ...state.user, ...action.payload }
        },
        setLoginStatus: (state, action) => {
            state.loginStatus = action.payload
        },
        logOut: (state, action) => {
            state.user = {}
            setAuthStatusAsync({status: false})
            removeToken().then()
        }
    },
})

export const {setCredentials, logOut, setLoginStatus } = authSlice.actions
export default authSlice.reducer