<template>
  <div class="login-wrapper bg-dark">
    <!-- Background Decoration (Glow Effect) -->
    <div
      class="position-absolute top-50 start-50 translate-middle rounded-circle opacity-25"
      style="
        width: 600px;
        height: 600px;
        background: radial-gradient(
          circle,
          rgba(13, 110, 253, 0.4),
          transparent 70%
        );
      "
    ></div>

    <div
      class="login-card bg-white rounded-4 p-4 shadow-lg w-100"
      style="max-width: 420px"
    >
      <!-- Brand -->
      <div class="brand text-center mb-4">
        <div
          class="brand-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
        >
          LB
        </div>
        <h4 class="fw-bold">Welcome Back</h4>
        <p class="text-secondary small">Sign in to Louk Bontor Admin</p>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="alert alert-danger d-flex align-items-center mb-3"
        role="alert"
      >
        <i class="bi bi-exclamation-circle-fill me-2 fs-5"></i>
        <div>{{ error }}</div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <div class="form-floating mb-3">
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="form.email"
            placeholder="name@example.com"
            required
          />
          <label for="email">Email address</label>
        </div>

        <!-- Password with show/hide -->
        <div class="input-group mb-3">
          <div class="form-floating grow">
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control border-end-0"
              id="password"
              v-model="form.password"
              placeholder="Password"
              required
            />
            <label for="password">Password</label>
          </div>
          <button
            type="button"
            class="btn btn-outline-secondary border-start-0"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100 py-3 fw-semibold rounded-3"
          :disabled="loading"
        >
          <span v-if="!loading">Sign In</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2"></span> Signing
            in...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/api.js";

const router = useRouter();
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    // 1. Send request
    const response = await api.post("/login", {
      email: form.email,
      password: form.password,
    });

    // 2. Handle Response Data
    // Assuming API structure: { result: true, data: { token: "...", user: {...} } }
    const data = response.data;
    
    // Check if the structure matches what you expect
    if (data.result && data.data?.token) {
      const { token, ...user } = data.data;

      // 3. Save to LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect
      router.push("/");
    } else {
      // Fallback for different structures (just in case)
      const token = data.token || data.access_token || data.data?.token;
      const user = data.user || data.data?.user || data.data;
      
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/");
      } else {
        throw new Error("Token not found in response");
      }
    }
  } catch (err) {
    console.error("Login Error:", err);
    
    // 5. Error Handling
    // Check for specific message from backend or use generic message
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.message === "Token not found in response") {
      error.value = "Server response format error. Contact admin.";
    } else {
      error.value = "Network error. Please check your connection.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-card {
  position: relative;
  z-index: 2;
}

.brand-icon {
  width: 56px;
  height: 56px;
  font-size: 22px;
  font-weight: 700;
}

/* Fix for floating label inside input-group */
.input-group .form-floating .form-control {
  border-radius: 0.375rem 0 0 0.375rem;
}

.input-group .btn-outline-secondary {
  border-radius: 0 0.375rem 0.375rem 0;
}
</style>