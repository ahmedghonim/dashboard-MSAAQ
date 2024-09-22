import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { isNumber } from "lodash";

import axios from "@/lib/axios";
import { APIResponse, Academy, User } from "@/types";
import { Permission } from "@/types/models/permission";

export type AuthSliceStateType = {
  user: User;
  permissions: Permission["name"][];
  academies: Array<Academy>;
  current_academy: Academy;
  status: "idle" | "loading" | "failed";
};

const initialState: AuthSliceStateType = {
  user: {} as User,
  permissions: [],
  academies: [],
  current_academy: {} as Academy,
  status: "idle"
};

export type UserResponse = {
  data: {
    data: {
      user: User;
      current_academy: Academy;
      academies: Array<Academy>;
    };
  };
};

export const fetchAuth = createAsyncThunk("authentication/me", async () => {
  return await axios.get("/authentication/me").then(({ data: { data } }: UserResponse) => data);
});

export const fetchPermissions = createAsyncThunk("authentication/permissions", async () => {
  return axios
    .get("/authentication/me/permissions")
    .then(({ data: { data } }: AxiosResponse<APIResponse<Permission["name"]>>) => data);
});

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.current_academy = action.payload.current_academy;
      state.academies = action.payload.academies;
      state.status = "idle";
    },
    setAcademies(state, action) {
      state.academies = action.payload;
    },
    setCurrentAcademy(state, action) {
      state.current_academy = isNumber(action.payload)
        ? (state.academies.find((academy) => academy.id === action.payload) as Academy)
        : (action.payload as Academy);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAuth.pending, (state, action) => {
      state.status = "loading";
    });
    builder.addCase(fetchAuth.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.academies = action.payload.academies;
      state.status = "idle";
    });
    builder.addCase(fetchAuth.rejected, (state, action) => {
      state.status = "failed";
    });
    builder.addCase(fetchPermissions.fulfilled, (state, action) => {
      state.permissions = action.payload;
    });
  }
});

export default AuthSlice.reducer;
