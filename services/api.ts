import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/* ================= BASE URL ================= */
/* 🚀 PRODUCTION BACKEND (Render) */
const BASE_URL = "https://backend-youtube-lubk.onrender.com/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/* ================= TOKEN ================= */
const getToken = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  } catch {
    return null;
  }
};

/* ================= INTERCEPTOR ================= */
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FormData safe check (Expo + Web compatible)
    const isFormData =
      typeof FormData !== "undefined" &&
      config.data &&
      config.data.constructor?.name === "FormData";

    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);