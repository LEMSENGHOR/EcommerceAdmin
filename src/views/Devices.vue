<template>
  <AdminLayout pageTitle="Devices">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="m-0 fw-bold">Registered Devices</h6>
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
            <input
              type="text"
              class="form-control ps-5"
              style="width: 240px; border-radius: 8px"
              placeholder="Search devices..."
              :value="store.searchQuery"
              @input="store.setSearchQuery($event.target.value)"
            />
          </div>
        </div>
        <button
          class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
          @click="store.fetchDevices"
          :disabled="store.loading"
        >
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="small text-uppercase text-secondary fw-bold">#</th>
              <th class="small text-uppercase text-secondary fw-bold">Device Name</th>
              <th class="small text-uppercase text-secondary fw-bold">Device ID</th>
              <th class="small text-uppercase text-secondary fw-bold">Platform</th>
              <th class="small text-uppercase text-secondary fw-bold">Status</th>
              <th class="small text-uppercase text-secondary fw-bold">Last Active</th>
              <th class="small text-uppercase text-secondary fw-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="7" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading...
              </td>
            </tr>
            <tr v-else-if="!store.filteredDevices.length">
              <td colspan="7" class="text-center text-secondary py-4">
                No devices found
              </td>
            </tr>
            <tr v-else v-for="(device, index) in store.filteredDevices" :key="device.id">
              <td>{{ index + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="device-icon-box bg-light text-secondary rounded-2 d-flex align-items-center justify-content-center">
                    <i :class="getPlatformIcon(device.platform || device.os)"></i>
                  </div>
                  <div class="fw-semibold">
                    {{ device.name || device.device_name || "Unknown" }}
                  </div>
                </div>
              </td>
              <td>
                <code class="device-code bg-light text-dark border rounded px-2 py-1 small">
                  {{ device.device_id || device.uuid || "—" }}
                </code>
              </td>
              <td>{{ device.platform || device.os || "Unknown" }}</td>
              <td>
                <span class="badge rounded-pill border" :class="getStatusBadge(device.status)">
                  {{ device.status || "active" }}
                </span>
              </td>
              <td class="text-secondary small">
                {{ formatDate(device.last_active || device.updated_at) }}
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                  @click="store.openEditModal(device)"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (optional) -->
      <div v-if="store.lastPage > 1" class="d-flex justify-content-between align-items-center mt-4">
        <small class="text-secondary">
          Page {{ store.currentPage }} of {{ store.lastPage }} · {{ store.total }} devices
        </small>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-light rounded-2"
            :disabled="store.currentPage === 1"
            @click="store.setPage(store.currentPage - 1)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            class="btn btn-sm btn-light rounded-2"
            :disabled="store.currentPage === store.lastPage"
            @click="store.setPage(store.currentPage + 1)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="store.showFormModal"
      @click.self="store.closeFormModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Edit Device</h5>
          <button type="button" class="btn-close" @click="store.closeFormModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="deviceName" v-model="form.name" placeholder="Device Name" required />
              <label for="deviceName">Device Name</label>
            </div>

            <div class="form-floating mb-3">
              <input type="text" class="form-control bg-light" id="deviceId" :value="form.device_id" placeholder="Device ID" readonly />
              <label for="deviceId">Device ID (Read-only)</label>
            </div>

            <div class="form-floating mb-3">
              <select class="form-select" id="deviceStatus" v-model="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label for="deviceStatus">Status</label>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light fw-semibold rounded-2" @click="store.closeFormModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fw-semibold rounded-2" :disabled="store.saving">
                <span v-if="!store.saving">
                  <i class="bi bi-save me-1"></i> Save Changes
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-container position-fixed top-0 end-0 p-3" v-if="store.toast.show">
      <div
        class="toast show align-items-center text-white border-0"
        :class="store.toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi" :class="store.toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
            {{ store.toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive, watch, onMounted } from "vue";
import { useDeviceStore } from "@/stores/deviceStore.js";
import AdminLayout from "@/layouts/AdminLayout.vue";

const store = useDeviceStore();

// Local form mirror — synced from store.selectedDevice when modal opens
const form = reactive({ name: "", device_id: "", status: "active" });

watch(
  () => store.selectedDevice,
  (device) => {
    if (!device) return;
    form.name = device.name || device.device_name || "";
    form.device_id = device.device_id || device.uuid || "";
    form.status = device.status || "active";
  },
);

// Helper: Platform Icons
const getPlatformIcon = (platform) => {
  if (!platform) return "bi-display";
  const p = platform.toLowerCase();
  if (p.includes("android") || p.includes("mobile")) return "bi-phone";
  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad")) return "bi-phone";
  if (p.includes("windows") || p.includes("desktop") || p.includes("pc")) return "bi-laptop";
  if (p.includes("linux") || p.includes("mac")) return "bi-laptop";
  return "bi-display";
};

const getStatusBadge = (status) =>
  status === "active"
    ? "bg-success bg-opacity-10 text-success border border-success-subtle"
    : "bg-danger bg-opacity-10 text-danger border border-danger-subtle";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleSave = async () => {
  await store.updateDevice(store.selectedDevice.id, {
    name: form.name,
    status: form.status,
  });
};

onMounted(() => store.fetchDevices());
</script>

<style scoped>
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-action-icon:hover { transform: scale(1.1); }

.device-icon-box { width: 40px; height: 40px; font-size: 20px; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  backdrop-filter: blur(2px);
}
.modal-custom {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>