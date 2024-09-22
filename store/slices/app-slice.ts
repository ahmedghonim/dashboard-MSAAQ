import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import axios from "@/lib/axios";
import { APIResponse, Academy, App, Country, Currency, EntityAction } from "@/types";

export type AppSliceStateType = {
  checkoutProcessing: boolean;
  isLoading: boolean;
  title?: string;
  headerTitle?: string;
  tenant?: Academy;
  direction?: "ltr" | "rtl";
  backLink?: string;
  countries: Array<Country>;

  currencies: Array<Currency>;

  entityStatus: EntityAction | null;

  installedApps: Array<App>;
  msaaqpay?: {
    id: number;
    installed?: boolean;
    was_prev_installed?: boolean;
  };
  installedPaymentGateways: Array<App>;
  lastEditedChapterId?: number;
  apiError: {
    status: number;
    message: string;
  } | null;
};

const initialState: AppSliceStateType = {
  isLoading: false,
  checkoutProcessing: false,
  title: "",
  apiError: null,
  headerTitle: "",
  backLink: "",
  countries: [],
  currencies: [],
  entityStatus: null,
  installedApps: [],
  installedPaymentGateways: [],
  tenant: undefined
};

export const fetchCountries = createAsyncThunk("countries", async () => {
  return await axios.get("/countries").then(({ data: { data } }: AxiosResponse<APIResponse<Country>>) => data);
});

export const fetchCurrencies = createAsyncThunk("currencies", async () => {
  return await axios.get("/currencies").then(({ data: { data } }: AxiosResponse<APIResponse<Currency>>) => data);
});

export const fetchInstalledApps = createAsyncThunk("apps", async () => {
  return await axios
    .get("/apps", {
      params: {
        simple_response: true
      }
    })
    .then(({ data: { data } }: AxiosResponse<APIResponse<App>>) => data);
});

export const fetchAcademyVerificationStatus = createAsyncThunk("verification/entity", async () => {
  return await axios
    .get("/verification/entity")
    .then(({ data: { data } }: AxiosResponse<{ data: EntityAction }>) => data);
});

export const AppSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setTenant(state, action) {
      state.tenant = action.payload;
    },
    setDirection(state, action) {
      state.direction = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    setHeaderTitle(state, action) {
      state.headerTitle = action.payload;
    },
    setBackLink(state, action) {
      state.backLink = action.payload;
    },
    setLastEditedChapterId(state, action) {
      state.lastEditedChapterId = action.payload;
    },
    setCheckoutProcessing(state, action) {
      state.checkoutProcessing = action.payload;
    },
    setApiError(state, action) {
      state.apiError = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCountries.fulfilled, (state, action) => {
      state.countries = action.payload;
    });
    builder.addCase(fetchCurrencies.fulfilled, (state, action) => {
      state.currencies = action.payload;
    });
    builder.addCase(fetchInstalledApps.fulfilled, (state, action) => {
      state.installedApps = action.payload;

      const msaaqpay = action.payload.find((app) => app.slug === "msaaqpay");
      if (msaaqpay) {
        state.msaaqpay = {
          id: msaaqpay?.id,
          installed: msaaqpay.installed,
          was_prev_installed: msaaqpay.old_installed
        };
      }

      state.installedPaymentGateways = action.payload
        .filter((app) => app.category === "payment")
        .filter((app) => app.installed);
    });
    builder.addCase(fetchAcademyVerificationStatus.fulfilled, (state, action) => {
      if (!action.payload) return;

      const progress =
        (action.payload.sections.filter((section: any) => section.action === "approved").length / 5) * 100 + 20;
      const isApproved = action.payload.action === "approved";

      state.entityStatus = {
        action: action.payload.action,
        id: action.payload.id,
        sections: action.payload.sections,
        created_at: action.payload.created_at,
        progress: isApproved ? 100 : progress
      };
    });
    builder.addCase(fetchAcademyVerificationStatus.rejected, (state, action) => {
      state.entityStatus = null;
    });
  }
});

export const { setCheckoutProcessing, setApiError } = AppSlice.actions;

export default AppSlice.reducer;
