import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Lang = "en" | "de" | "ar";
export type Role = "user" | "partner" | "admin";
export type PartnerStatus = "pending" | "approved" | "rejected";

// Expand the user shape so partner-only fields exist (all optional)
export type User =
  | {
      id: number;
      name: string;
      email: string;
      role: Role;
      preferred_language?: Lang | null;

      // NEW (optional) — used by partner approval flow
      partner_status?: PartnerStatus | null;
      business_type?: "workshop" | "carwash" | "rental" | "parts" | null;
      company_name?: string | null;
      phone?: string | null;
    }
  | null;

type AuthState = {
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Keep the same shape your app dispatches: { user, accessToken, refreshToken }
    setAuth(state, action: PayloadAction<AuthState>) {
      Object.assign(state, action.payload);
      localStorage.setItem("user", JSON.stringify(state.user));
      if (state.accessToken) localStorage.setItem("accessToken", state.accessToken);
      if (state.refreshToken) localStorage.setItem("refreshToken", state.refreshToken);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setAuth, logout } = slice.actions;
export default slice.reducer;
