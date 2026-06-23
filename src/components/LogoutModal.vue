<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <div class="modal-box">
        <!-- Icon -->
        <div class="modal-icon">
          <i class="bi bi-box-arrow-right"></i>
        </div>

        <!-- Content -->
        <h3 class="modal-title-custom">Logout</h3>
        <p class="modal-text">Are you sure you want to logout?</p>

        <!-- Buttons -->
        <div class="modal-actions">
          <button class="btn-cancel" @click="emit('close')">Cancel</button>
          <button class="btn-logout" @click="emit('confirm')">Yes, Logout</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
}

.modal-title-custom {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.modal-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-logout {
  background: #dc2626;
  color: #fff;
}

.btn-logout:hover {
  background: #b91c1c;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.9) translateY(10px);
  opacity: 0;
}
</style>