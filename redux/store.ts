import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slice/apiSlice';
import AuthReducer from "./slice/authSlice";
import NotificationSlice from './slice/notificationSlice';




export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    notification: NotificationSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
},
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }).concat(apiSlice.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
