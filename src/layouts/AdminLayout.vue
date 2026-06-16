<template>
  <!-- Main Wrapper using Flexbox -->
  <div class="d-flex min-vh-100 bg-light">
    <!-- Sidebar -->
    <!-- Classes: bg-dark (black), text-white (white text), d-flex (flex layout) -->
    <aside
      class="sidebar d-flex flex-column shrink-0 p-3 bg-dark text-white"
      :class="{ show: isMobileOpen }"
    >
      <!-- Brand Area -->
      <router-link
        to="/"
        class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <div class="brand-icon me-2">
          <img
            src="../assets/img/logo.png"
            alt="Logo"
            width="32"
            height="32"
            onerror="this.style.display = 'none'"
          />
        </div>
        <div class="lh-1">
          <h5 class="m-0 fs-5">Louk Bontor</h5>
          <small class="opacity-75">Admin Panel</small>
        </div>
      </router-link>

      <hr />

      <!-- Navigation -->
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <router-link
            to="/"
            class="nav-link text-white"
            active-class="active"
            exact
          >
            <i class="bi bi-grid-fill me-2"></i> Dashboard
          </router-link>
        </li>

        <!-- Management -->
        <li class="mt-3 mb-1 px-3 text-uppercase small fw-bold opacity-50">
          Management
        </li>
        <li>
          <router-link
            to="/products"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-box-seam me-2"></i> Products
          </router-link>
        </li>
        <li>
          <router-link
            to="/categories"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-tags me-2"></i> Categories
          </router-link>
        </li>
        <li>
          <router-link
            to="/devices"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-display me-2"></i> Devices
          </router-link>
        </li>
        <li>
          <router-link
            to="/carts"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-cart me-2"></i> Carts
          </router-link>
        </li>
        <li>
          <router-link
            to="/payments"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-credit-card me-2"></i> Payments
          </router-link>
        </li>

        <!-- Account -->
        <li class="mt-3 mb-1 px-3 text-uppercase small fw-bold opacity-50">
          Account
        </li>
        <li>
          <router-link
            to="/profile"
            class="nav-link text-white"
            active-class="active"
          >
            <i class="bi bi-person me-2"></i> Profile
          </router-link>
        </li>
        <li>
          <a href="#" class="nav-link text-white" @click.prevent="logout">
            <i class="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </li>
      </ul>

      <hr />
      <!-- User Info at bottom -->
      <div class="dropdown">
        <a
          href="#"
          class="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          id="dropdownUser1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <!-- Bootstrap Avatar styling: rounded-circle, bg-primary -->
          <div
            class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold me-2"
            style="width: 32px; height: 32px"
          >
            A
          </div>
          <strong>Admin</strong>
        </a>
        <ul
          class="dropdown-menu dropdown-menu-dark text-small shadow"
          aria-labelledby="dropdownUser1"
        >
          <li><a class="dropdown-item" href="#">Sign out</a></li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="grow d-flex flex-column" style="width: 100%">
      <!-- Top Header -->
      <header
        class="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top"
      >
        <div class="d-flex align-items-center gap-3">
          <!-- Mobile Toggle Button -->
          <button
            class="btn btn-outline-secondary d-md-none border-0"
            @click="isMobileOpen = !isMobileOpen"
          >
            <i class="bi bi-list fs-4"></i>
          </button>

          <h4 class="m-0 page-title fw-bold text-dark">{{ pageTitle }}</h4>
        </div>

        <!-- Admin Badge (Desktop/Mobile) -->
        <div class="d-flex align-items-center gap-2 d-none d-md-flex">
          <div
            class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold"
            style="width: 32px; height: 32px"
          >
            A
          </div>
          <span class="fw-bold small">Admin</span>
        </div>
      </header>

      <!-- Page Slot Content -->
      <div class="content-area p-4 overflow-auto">
        <slot></slot>
      </div>
    </div>

    <!-- Mobile Overlay (Optional, for clicking outside to close) -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
      style="z-index: 1040; display: none"
      :style="{ display: isMobileOpen ? 'block' : 'none' }"
      @click="isMobileOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

defineProps({
  pageTitle: { type: String, default: "Dashboard" },
});

const isMobileOpen = ref(false);
const router = useRouter();

const logout = () => {
  localStorage.removeItem("token");
  // localStorage.removeItem("user");
  router.push("/login");
};
</script>

<style scoped>
/* Sidebar Width */
.sidebar {
  width: 260px;
  /* On mobile, it needs to be fixed and off-canvas */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1050; /* Above content */
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
}

/* Desktop: Sidebar is static/part of flow */
@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: none; /* Always visible */
  }
}

/* Mobile: When 'show' class is added, slide it in */
@media (max-width: 767.98px) {
  .sidebar.show {
    transform: translateX(0);
  }
}

/* Active Link Style (Dark Sidebar context) */
.nav-link.active {
  background-color: #0d6efd; /* Bootstrap Primary Color */
  color: white !important;
}

.nav-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
