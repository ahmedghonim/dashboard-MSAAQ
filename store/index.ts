import { configureStore } from "@reduxjs/toolkit";

import AppSlice from "@/store/slices/app-slice";
import AuthSlice from "@/store/slices/auth-slice";

import { apiSlice } from "./slices/api/apiSlice";

const store = configureStore({
  reducer: {
    app: AppSlice,
    auth: AuthSlice,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(apiSlice.middleware);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
