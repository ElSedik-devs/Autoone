import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import i18n from "../i18n";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api", // remove hardcoded localhost
  headers: {
    "Accept": "application/json",
    "Accept-Language": i18n.language || "en",
  },
});

// keep language header in sync
i18n.on("languageChanged", (lng) => {
  api.defaults.headers.common["Accept-Language"] = lng;
});

// attach Bearer token from localStorage on every request (type-safe)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers);

  // read & normalize token (strip accidental surrounding quotes)
  const raw = localStorage.getItem("accessToken");
  const token = raw ? raw.replace(/^"|"$/g, "") : "";

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  if (i18n.language) headers.set("Accept-Language", i18n.language);

  config.headers = headers;

  // DEV ONLY: quick sanity log (remove or guard for production)
  if (import.meta.env.DEV) {
    // console.debug("[api] ->", config.method?.toUpperCase(), config.url, {
    //   auth: headers.get("Authorization") ? "yes" : "no",
    //   lang: headers.get("Accept-Language"),
    // });
  }

  return config;
});
