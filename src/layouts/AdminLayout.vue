<template>
  <!-- Main Wrapper -->
  <div class="admin-layout min-vh-100 bg-light">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobileOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="sidebar d-flex flex-column shrink-0 p-3 bg-dark text-white"
      :class="{ show: isMobileOpen }"
    >
      <!-- Brand Area -->
      <router-link
        to="/"
        class="brand-link d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <div class="brand-icon me-2">
          <img
            src="../assets/img/logo.png"
            alt="Logo"
            width="32"
            height="32"
            @error="handleImageError"
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
            @click="closeMobileSidebar"
          >
            <i class="bi bi-grid-fill me-2"></i>
            Dashboard
          </router-link>
        </li>

        <!-- Management Section -->
        <li class="mt-3 mb-1 px-3 text-uppercase small fw-bold opacity-50">
          Management
        </li>

        <li>
          <router-link
            to="/products"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-box-seam me-2"></i>
            Products
          </router-link>
        </li>

        <li>
          <router-link
            to="/categories"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-tags me-2"></i>
            Categories
          </router-link>
        </li>

        <li>
          <router-link
            to="/devices"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-display me-2"></i>
            Devices
          </router-link>
        </li>

        <li>
          <router-link
            to="/carts"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-cart me-2"></i>
            Carts
          </router-link>
        </li>

        <li>
          <router-link
            to="/payments"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-credit-card me-2"></i>
            Payments
          </router-link>
        </li>

        <!-- Account Section -->
        <li class="mt-3 mb-1 px-3 text-uppercase small fw-bold opacity-50">
          Account
        </li>

        <li>
          <router-link
            to="/profile"
            class="nav-link text-white"
            active-class="active"
            @click="closeMobileSidebar"
          >
            <i class="bi bi-person me-2"></i>
            Profile
          </router-link>
        </li>

        <li>
          <a href="#" class="nav-link text-white" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right me-2"></i>
            Logout
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
          <div
            class="avatar-circle rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold me-2"
          >
            {{ userInitial }}
          </div>
          <strong>{{ userName }}</strong>
        </a>
        <ul
          class="dropdown-menu dropdown-menu-dark text-small shadow"
          aria-labelledby="dropdownUser1"
        >
          <li>
            <router-link
              to="/profile"
              class="dropdown-item"
              @click="closeMobileSidebar"
            >
              Profile Settings
            </router-link>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleLogout">
              Sign out
            </a>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content d-flex flex-column">
      <!-- Top Header -->
      <header class="header bg-white border-bottom p-3 sticky-top">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <!-- Mobile Toggle Button -->
            <button
              class="btn btn-outline-secondary d-md-none border-0"
              @click="toggleMobileSidebar"
              aria-label="Toggle navigation"
            >
              <i class="bi bi-list fs-4"></i>
            </button>

            <h4 class="m-0 page-title fw-bold text-dark">{{ pageTitle }}</h4>
          </div>

          <!-- Header Actions -->
          <div class="header-actions d-flex align-items-center gap-3">
            <!-- Search Bar (Desktop) -->
            <div class="search-box d-none d-md-block">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search..."
                  aria-label="Search"
                />
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>

            <!-- Notifications -->
            <button
              class="btn btn-outline-secondary position-relative border-0"
            >
              <i class="bi bi-bell fs-5"></i>
              <span
                v-if="notificationCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ notificationCount }}
              </span>
            </button>

            <!-- User Info (Desktop) -->
            <div class="d-flex align-items-center gap-2 d-none d-md-flex">
              <div
                class="avatar-circle rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold"
              >
                {{ userInitial }}
              </div>
              <span class="fw-bold small">{{ userName }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content Slot -->
      <div class="content-area p-4 overflow-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
// import { useProfileStore } from '@/stores/ProfileStore.js';
import { useProfileStore } from "@/stores/profileStore";

// Props
const props = defineProps({
  pageTitle: {
    type: String,
    default: "Dashboard",
  },
});

// Router
const router = useRouter();

// Stores
const profileStore = useProfileStore();

// State
const isMobileOpen = ref(false);
const notificationCount = ref(0);

// Computed
const userName = computed(() => {
  return profileStore.profile.name || "Admin";
});

const userInitial = computed(() => {
  const name = profileStore.profile.name || "Admin";
  return name.charAt(0).toUpperCase();
});

// Methods
const toggleMobileSidebar = () => {
  isMobileOpen.value = !isMobileOpen.value;
};

const closeMobileSidebar = () => {
  isMobileOpen.value = false;
};

const handleLogout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Redirect to login
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    // Force redirect even on error
    router.push("/login");
  }
};

const handleImageError = (event) => {
  event.target.style.display = "none";
};

// Lifecycle
onMounted(async () => {
  try {
    // Fetch profile data
    await profileStore.fetchProfile();
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
});
</script>

<style scoped>
/* Layout Structure */
.admin-layout {
  display: flex;
  position: relative;
}

/* Main Content Area */
.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1050;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

/* Desktop Sidebar */
@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: none;
    z-index: 1;
  }

  .mobile-overlay {
    display: none !important;
  }
}

/* Mobile Sidebar Active State */
@media (max-width: 767.98px) {
  .sidebar.show {
    transform: translateX(0);
  }
}

/* Navigation Links */
.nav-link {
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.nav-link.active {
  background-color: #0d6efd;
  color: white !important;
}

.nav-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Brand Link */
.brand-link:hover {
  color: white;
  opacity: 0.9;
}

/* Avatar Circle */
.avatar-circle {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

/* Header Styling */
.header {
  z-index: 1000;
}

/* Search Box */
.search-box {
  max-width: 300px;
}

.search-box .form-control {
  border-radius: 20px 0 0 20px;
}

.search-box .input-group-text {
  border-radius: 0 20px 20px 0;
  background-color: #f8f9fa;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
}

/* Responsive Adjustments */
@media (max-width: 576px) {
  .page-title {
    font-size: 1rem;
  }

  .header-actions {
    gap: 1rem;
  }
}
</style>
