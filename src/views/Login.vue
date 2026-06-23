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
      <!-- <div
        v-if="error"
        class="alert alert-danger d-flex align-items-center mb-3"
        role="alert"
      >
        <i class="bi bi-exclamation-circle-fill me-2 fs-5"></i>
        <div>{{ error }}</div>
      </div> -->
      <!-- Error Alert — use store error -->
      <div v-if="authStore.error" class="alert alert-danger ...">
        {{ authStore.error }}
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

        <!-- <button
          type="submit"
          class="btn btn-primary w-100 py-3 fw-semibold rounded-3"
          :disabled="loading"
        >
          <span v-if="!loading">Sign In</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2"></span> Signing
            in...
          </span>
        </button> -->

        <!-- Button — use store loading -->
        <button class="btn btn-primary w-100 py-3 fw-semibold rotate-3" type="submit" :disabled="authStore.loading">
          <span v-if="!authStore.loading">Login</span>
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
import { useAuthStore } from "../stores/Authstore ";

const authStore = useAuthStore();
const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  authStore.clearError();
  await authStore.login(form.email, form.password);
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
