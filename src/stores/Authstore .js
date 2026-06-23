import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  // ── STATE ──
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const loading = ref(false);
  const error = ref("");

  // ── GETTERS ──
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || user.value?.data?.name || "");
  const userEmail = computed(() => user.value?.email || user.value?.data?.email || "");

  // ── ACTIONS ──
  async function login(email, password) {
    loading.value = true;
    error.value = "";

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      // Handle response structure: { result: true, data: { token, ...user } }
      let extractedToken = null;
      let extractedUser = null;

      if (data.result && data.data?.token) {
        const { token: t, ...u } = data.data;
        extractedToken = t;
        extractedUser = u;
      } else {
        // Fallback for different structures
        extractedToken = data.token || data.access_token || data.data?.token;
        extractedUser = data.user || data.data?.user || data.data;
      }

      if (!extractedToken) {
        throw new Error("TOKEN_NOT_FOUND");
      }

      // Save to state + localStorage
      token.value = extractedToken;
      user.value = extractedUser;
      localStorage.setItem("token", extractedToken);
      localStorage.setItem("user", JSON.stringify(extractedUser));

      // Redirect to dashboard
      router.push("/");
      return true;

    } catch (err) {
      console.error("Login error:", err);

      if (err.message === "TOKEN_NOT_FOUND") {
        error.value = "Server response format error. Contact admin.";
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message;
      } else if (err.response?.data?.error) {
        error.value = err.response.data.error;
      } else if (err.response?.status === 401) {
        error.value = "Invalid email or password.";
      } else if (err.response?.status === 422) {
        // Validation errors
        const errors = err.response.data?.errors;
        if (errors) {
          const first = Object.values(errors)[0];
          error.value = Array.isArray(first) ? first[0] : first;
        } else {
          error.value = err.response.data?.message || "Validation failed.";
        }
      } else {
        error.value = "Network error. Please check your connection.";
      }

      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function clearError() {
    error.value = "";
  }

  return {
    // state
    token,
    user,
    loading,
    error,
    // getters
    isAuthenticated,
    userName,
    userEmail,
    // actions
    login,
    logout,
    clearError,
  };
});