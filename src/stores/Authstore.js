import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/api.js";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  // ── STATE ──
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const loading = ref(false);
  const error = ref("");

  // ── GETTERS ──
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || "");
  const userEmail = computed(() => user.value?.email || "");
  const userAvatar = computed(() => user.value?.avatar || null);

  // ── ACTIONS ──
  // async function login(email, password) {
  //   loading.value = true;
  //   error.value = "";

  //   try {
  //     const response = await api.post("/login", { email, password });
  //     const data = response.data;

  //     // Handle your exact API response: { result: true, data: { id, name, token, ... } }
  //     if (!data.result || !data.data?.token) {
  //       throw new Error("TOKEN_NOT_FOUND");
  //     }

  //     // Separate token from user data
  //     const { token: extractedToken, ...extractedUser } = data.data;

  //     // Save to state + localStorage
  //     token.value = extractedToken;
  //     user.value = extractedUser;
  //     localStorage.setItem("token", extractedToken);
  //     localStorage.setItem("user", JSON.stringify(extractedUser));

  //     // Redirect to dashboard
  //     router.push("/");
  //     return true;

  //   } catch (err) {
  //     console.error("Login error:", err);

  //     if (err.message === "TOKEN_NOT_FOUND") {
  //       error.value = "Server response format error. Contact admin.";
  //     } else if (err.response?.data?.message) {
  //       error.value = err.response.data.message;
  //     } else if (err.response?.status === 401) {
  //       error.value = "Invalid email or password.";
  //     } else if (err.response?.status === 422) {
  //       const errors = err.response.data?.errors;
  //       if (errors) {
  //         const first = Object.values(errors)[0];
  //         error.value = Array.isArray(first) ? first[0] : first;
  //       } else {
  //         error.value = "Validation failed.";
  //       }
  //     } else {
  //       error.value = "Network error. Please check your connection.";
  //     }

  //     return false;
  //   } finally {
  //     loading.value = false;
  //   }
  // }

  async function login(email, password) {
    loading.value = true;
    error.value = "";

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      if (!data.result || !data.data?.token) {
        throw new Error("TOKEN_NOT_FOUND");
      }

      const { token: extractedToken, ...extractedUser } = data.data;

      // ╔══════════════════════════════════════════════════════════╗
      // ║  FRONTEND ADMIN CHECK (ONLY ADD THIS BLOCK)           ║
      // ╚══════════════════════════════════════════════════════════╝

      // Change 'admin' to whatever your backend sends for admins
      // (e.g., 'administrator', 'Admin', or if it's a number: extractedUser.is_admin === 1)
      // if (extractedUser.role !== "Administrator") {
      //   error.value = "Access Denied. You do not have admin privileges.";
      //   return false; // Stop here! Do not save token, do not redirect.
      // }
      const isAdmin =
        extractedUser.email === "chandalen@gmail.com" || extractedUser.id === 1; // or whatever the admin's ID is

      if (!isAdmin) {
        error.value = "Access Denied. You do not have admin privileges.";
        return false;
      }

      // ───────────────────────────────────────────────────────────

      // If they PASS the check, save to state + localStorage
      token.value = extractedToken;
      user.value = extractedUser;
      localStorage.setItem("token", extractedToken);
      localStorage.setItem("user", JSON.stringify(extractedUser));

      router.push("/");
      return true;
    } catch (err) {
      // ... keep your existing catch block exactly the same ...
      console.error("Login error:", err);

      if (err.message === "TOKEN_NOT_FOUND") {
        error.value = "Server response format error. Contact admin.";
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message;
      } else if (err.response?.status === 401) {
        error.value = "Invalid email or password.";
      } else if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          const first = Object.values(errors)[0];
          error.value = Array.isArray(first) ? first[0] : first;
        } else {
          error.value = "Validation failed.";
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
    userAvatar,
    // actions
    login,
    logout,
    clearError,
  };
});
