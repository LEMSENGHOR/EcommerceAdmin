<script setup>
import { useUser } from '../composables/useUser'

const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard',
  },
  notificationCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['toggle-sidebar'])

const { userName, userInitial, hasAvatar, userAvatar } = useUser()
</script>

<template>
  <header class="header bg-white border-bottom p-3 sticky-top">
    <div class="d-flex justify-content-between align-items-center">
      <!-- Left: Toggle + Title -->
      <div class="d-flex align-items-center gap-3">
        <button
          class="btn btn-outline-secondary d-md-none border-0"
          @click="emit('toggle-sidebar')"
          aria-label="Toggle navigation"
        >
          <i class="bi bi-list fs-4"></i>
        </button>
        <h4 class="m-0 page-title fw-bold text-dark">{{ pageTitle }}</h4>
      </div>

      <!-- Right: Actions -->
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
        <button class="btn btn-outline-secondary position-relative border-0">
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
          <img
            v-if="hasAvatar"
            :src="userAvatar"
            class="rounded-circle object-fit-cover me-2"
            style="width: 40px; height: 40px"
            alt="Avatar"
          />
          <div
            v-else
            class="avatar-circle rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold"
            style="width: 40px; height: 40px; font-size: 0.9rem"
          >
            {{ userInitial }}
          </div>
          <span class="fw-bold small">{{ userName }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  z-index: 1000;
}

.search-box .form-control {
  border-radius: 20px 0 0 20px;
  max-width: 220px;
}

.search-box .input-group-text {
  border-radius: 0 20px 20px 0;
  background-color: #f8f9fa;
}

.search-box .form-control:focus {
  box-shadow: none;
  border-color: #dee2e6;
}

.header .btn-outline-secondary:hover {
  color: var(--bs-primary);
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1rem;
  }
  .header-actions {
    gap: 1rem;
  }
}
</style>