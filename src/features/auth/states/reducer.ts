import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  login,
  register,
  type LoginResponse,
  type RegisterResponse,
} from "@/features/auth/api/authApi";

import {
  removeAccessToken,
  putAccessToken,
} from "@/helpers/apiHelper";

interface AuthState {
  user: LoginResponse["data"]["user"] | null;
  token: string | null;

  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;

  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,

  isAuthLogin: false,
  isAuthRegister: false,
  isAuthLogout: false,

  error: null,
};

export const authLogin = createAsyncThunk(
  "auth/login",
  async (
    payload: {
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await login(payload);

      putAccessToken(response.data.token);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login gagal"
      );
    }
  }
);

export const authRegister = createAsyncThunk(
  "auth/register",
  async (
    payload: {
      name: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await register(payload);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registrasi gagal"
      );
    }
  }
);

export const authLogout = createAsyncThunk(
  "auth/logout",
  async () => {
    removeAccessToken();
    return true;
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(authLogin.pending, (state) => {
        state.isAuthLogin = true;
        state.error = null;
      })

      .addCase(authLogin.fulfilled, (state, action) => {
        state.isAuthLogin = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.error = null;
      })

      .addCase(authLogin.rejected, (state, action) => {
        state.isAuthLogin = false;
        state.error = action.payload as string;
      })

      // REGISTER
      .addCase(authRegister.pending, (state) => {
        state.isAuthRegister = true;
        state.error = null;
      })

      .addCase(authRegister.fulfilled, (state) => {
        state.isAuthRegister = false;
        state.error = null;
      })

      .addCase(authRegister.rejected, (state, action) => {
        state.isAuthRegister = false;
        state.error = action.payload as string;
      })

      // LOGOUT
      .addCase(authLogout.pending, (state) => {
        state.isAuthLogout = true;
      })

      .addCase(authLogout.fulfilled, (state) => {
        state.isAuthLogout = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })

      .addCase(authLogout.rejected, (state) => {
        state.isAuthLogout = false;
      });
  },
});

export default authSlice.reducer;