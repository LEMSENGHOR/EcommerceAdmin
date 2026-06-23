<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore'

import BaseNavbar from '../components/BaseNavbar.vue'
import BaseSidebar from '../components/BaseSidebar.vue'
import LogoutModal from '../components/LogoutModal.vue'

// ── Props ──────────────────────────────────────────────
const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard',
  },
})

// ── Router ─────────────────────────────────────────────
const router = useRouter()

// ── Stores ─────────────────────────────────────────────
const profileStore = useProfileStore()

// ── State ──────────────────────────────────────────────
const isMobileOpen = ref(false)
const showLogoutModal = ref(false)
const notificationCount = ref(0)

// ── Methods ────────────────────────────────────────────
function toggleMobileSidebar() {
  isMobileOpen.value = !isMobileOpen.value
}

function closeMobileSidebar() {
  isMobileOpen.value = false
}

function requestLogout() {
  closeMobileSidebar()
  showLogoutModal.value = true
}

async function handleLogout() {
  showLogoutModal.value = false

  localStorage.removeItem('token')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')

  router.push('/login')
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(async () => {
  try {
    await profileStore.fetchProfile()
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
})
</script>

<template>
  <div class="admin-layout min-vh-100 bg-light">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobileOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- Sidebar -->
    <BaseSidebar
      :is-open="isMobileOpen"
      @close="closeMobileSidebar"
      @logout="requestLogout"
    />

    <!-- Main Content Area -->
    <div class="main-content d-flex flex-column">
      <!-- Top Navbar -->
      <BaseNavbar
        :page-title="pageTitle"
        :notification-count="notificationCount"
        @toggle-sidebar="toggleMobileSidebar"
      />

      <!-- Page Content -->
      <div class="content-area p-4 overflow-auto">
        <slot></slot> 
        <!-- if not used slot is not see  -->
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <LogoutModal
      :show="showLogoutModal"
      @close="showLogoutModal = false"
      @confirm="handleLogout"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  position: relative;
}

.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .mobile-overlay {
    display: none !important;
  }
}
</style>