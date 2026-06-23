<script setup>
import { useUser } from '../composables/useUser'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'logout'])

const { userName, userInitial, hasAvatar, userAvatar } = useUser()

// Navigation items defined as data for clarity
const sections = [
  {
    key: 'main',
    items: [
      { to: '/', icon: 'bi-grid-fill', label: 'ផ្ទាំងគ្រប់គ្រង', exact: true },
    ],
  },
  {
    key: 'management',
    title: 'ការគ្រប់គ្រង',
    items: [
      { to: '/products', icon: 'bi-box-seam', label: 'ផលិតផល' },
      { to: '/categories', icon: 'bi-tags', label: 'ប្រភេទផលិតផល' },
      { to: '/devices', icon: 'bi-display', label: 'ឧបករណ៍' },
      { to: '/carts', icon: 'bi-cart', label: 'រទេះទំនិញ' },
      { to: '/payments', icon: 'bi-credit-card', label: 'ការទូទាត់' },
    ],
  },
  {
    key: 'account',
    title: 'គណនី',
    items: [
      { to: '/profile', icon: 'bi-person', label: 'Profile' },
    ],
  },
]

function handleBrandImageError(e) {
  e.target.style.display = 'none'
}
</script>

<template>
  <aside
    class="sidebar d-flex flex-column shrink-0 p-3 bg-dark text-white"
    :class="{ show: isOpen }"
  >
    <!-- Brand -->
    <router-link
      to="/"
      class="brand-link d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
    >
      <!-- <div class="brand-icon me-2">
        <img
          src="../assets/images/image.png"
          alt="Logo"
          width="32"
          height="32"
          @error="handleBrandImageError"
        />
      </div> -->
      <div class="lh-1">
        <div class="d-flex mb-2 align-items-center">
          <img
            class="me-2 rounded-1"
            src="../assets/images/image.png"
            alt=""
            style="max-width: 17%"
          />
          <h5 class="m-0 fs-3">ពិភពទំនិញ</h5>
        </div>
        <small class="opacity-75">ផ្ទាំងគ្រប់គ្រង</small>
      </div>
    </router-link>

    <hr />

    <!-- Navigation -->
    <ul class="nav nav-pills flex-column mb-auto">
      <template v-for="section in sections" :key="section.key">
        <!-- Section Title -->
        <li
          v-if="section.title"
          class="mt-3 mb-1 px-3 text-uppercase small fw-bold opacity-50"
        >
          {{ section.title }}
        </li>

        <!-- Section Items -->
        <li v-for="item in section.items" :key="item.to">
          <router-link
            :to="item.to"
            class="nav-link text-white"
            active-class="active"
            :exact="item.exact"
            @click="emit('close')"
          >
            <i :class="`bi ${item.icon} me-2`"></i>
            {{ item.label }}
          </router-link>
        </li>
      </template>

      <!-- Logout -->
      <li>
        <a
          href="#"
          class="nav-link text-white"
          @click.prevent="emit('logout')"
        >
          <i class="bi bi-box-arrow-right me-2"></i>
          Logout
        </a>
      </li>
    </ul>

    <hr />

    <!-- User Dropdown at Bottom -->
    <div class="dropdown">
      <a
        href="#"
        class="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
        id="dropdownUser1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          v-if="hasAvatar"
          :src="userAvatar"
          class="rounded-circle object-fit-cover me-2"
          style="width: 32px; height: 32px"
          alt="Avatar"
        />
        <div
          v-else
          class="avatar-circle rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold me-2"
          style="width: 32px; height: 32px; font-size: 14px"
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
            @click="emit('close')"
          >
            Profile Settings
          </router-link>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <a class="dropdown-item" href="#" @click.prevent="emit('logout')">
            Logout
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<!-- <style scoped>
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

@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: none;
    z-index: 1;
  }
}

@media (max-width: 767.98px) {
  .sidebar.show {
    transform: translateX(0);
  }
}

.brand-link:hover {
  color: white;
  opacity: 0.9;
}

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

.avatar-circle {
  width: 32px;
  height: 32px;
  font-size: 14px;
}
</style> -->

<style scoped>
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

/* ── Desktop: full height, static position ── */
@media (min-width: 768px) {
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    transform: none;
    z-index: 1;
    flex-shrink: 0;
  }
}

/* ── Mobile: slide in from left ── */
@media (max-width: 767.98px) {
  .sidebar.show {
    transform: translateX(0);
  }
}

.brand-link:hover {
  color: white;
  opacity: 0.9;
}

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

.avatar-circle {
  width: 32px;
  height: 32px;
  font-size: 14px;
}
</style>