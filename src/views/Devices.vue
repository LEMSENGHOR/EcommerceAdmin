<template>
  <AdminLayout pageTitle="Devices">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div
        class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
      >
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="m-0 fw-bold">Registered Devices</h6>
          <!-- Search Input -->
          <div class="position-relative">
            <i
              class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"
            ></i>
            <input
              type="text"
              class="form-control ps-5"
              style="width: 240px; border-radius: 8px"
              placeholder="Search devices..."
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Refresh Button -->
        <button
          class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
          @click="fetchDevices"
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
              <th class="small text-uppercase text-secondary fw-bold">
                Device Name
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Device ID
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Platform
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Status
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Last Active
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="7" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading...
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-else-if="filteredDevices.length === 0">
              <td colspan="7" class="text-center text-secondary py-4">
                No devices found
              </td>
            </tr>
            <!-- Device Rows -->
            <tr
              v-else
              v-for="(device, index) in filteredDevices"
              :key="device.id"
            >
              <td>{{ index + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div
                    class="device-icon-box bg-light text-secondary rounded-2 d-flex align-items-center justify-content-center"
                  >
                    <i
                      :class="getPlatformIcon(device.platform || device.os)"
                    ></i>
                  </div>
                  <div class="fw-semibold">
                    {{ device.name || device.device_name || "Unknown" }}
                  </div>
                </div>
              </td>
              <td>
                <code
                  class="device-code bg-light text-dark border rounded px-2 py-1 small"
                >
                  {{ device.device_id || device.uuid || "—" }}
                </code>
              </td>
              <td>{{ device.platform || device.os || "Unknown" }}</td>
              <td>
                <span
                  class="badge rounded-pill border"
                  :class="getStatusBadge(device.status)"
                >
                  {{ device.status || "active" }}
                </span>
              </td>
              <td class="text-secondary small">
                {{ formatDate(device.last_active || device.updated_at) }}
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                  @click="openEditModal(device)"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showFormModal"
      @click.self="closeFormModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Edit Device</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeFormModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="deviceName"
                v-model="form.name"
                placeholder="Device Name"
                required
              />
              <label for="deviceName">Device Name</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control bg-light"
                id="deviceId"
                :value="form.device_id"
                placeholder="Device ID"
                readonly
              />
              <label for="deviceId">Device ID (Read-only)</label>
            </div>

            <div class="form-floating mb-3">
              <select
                class="form-select"
                id="deviceStatus"
                v-model="form.status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label for="deviceStatus">Status</label>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="closeFormModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary fw-semibold rounded-2"
                :disabled="saving"
              >
                <span v-if="!saving">
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
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      v-if="toast.show"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i
              class="bi"
              :class="
                toast.type === 'success'
                  ? 'bi-check-circle-fill'
                  : 'bi-x-circle-fill'
              "
            ></i>
            {{ toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "@/api/api.js";
import AdminLayout from "@/layouts/AdminLayout.vue";

// State
const devices = ref([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref("");

// Modal State
const showFormModal = ref(false);
const selectedId = ref(null);
const form = reactive({ name: "", device_id: "", status: "active" });

// Toast
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// Computed Search
const filteredDevices = computed(() => {
  if (!searchQuery.value) return devices.value;
  const query = searchQuery.value.toLowerCase();
  return devices.value.filter(
    (d) =>
      (d.name || "").toLowerCase().includes(query) ||
      (d.device_id || "").toLowerCase().includes(query),
  );
});

// Helper: Platform Icons (Bootstrap Icons)
const getPlatformIcon = (platform) => {
  if (!platform) return "bi-display";
  const p = platform.toLowerCase();
  // Using generic icons to ensure compatibility without brand packs
  if (p.includes("android") || p.includes("mobile")) return "bi-phone";
  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad"))
    return "bi-phone";
  if (p.includes("windows") || p.includes("desktop") || p.includes("pc"))
    return "bi-laptop";
  if (p.includes("linux") || p.includes("mac")) return "bi-laptop";
  return "bi-display";
};

// Helper: Status Badge
const getStatusBadge = (status) => {
  // Returns Bootstrap classes for badge
  return status === "active"
    ? "bg-success bg-opacity-10 text-success border border-success-subtle"
    : "bg-danger bg-opacity-10 text-danger border border-danger-subtle";
};

// Helper: Format Date
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// 1. GET /api/profile/devices (Updated Endpoint)
const fetchDevices = async () => {
  loading.value = true;
  try {
    // Updated endpoint as requested
    const response = await api.get("/api/profile/devices?page=1&per_page=20");

    // Handle response: Usually Laravel returns data inside 'data' key, or direct array.
    devices.value = response.data.data || response.data || [];
  } catch (err) {
    showToast("Failed to load devices", "error");
  } finally {
    loading.value = false;
  }
};

// Modal Logic
const openEditModal = (device) => {
  selectedId.value = device.id;
  form.name = device.name || device.device_name || "";
  form.device_id = device.device_id || device.uuid || "";
  form.status = device.status || "active";
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

// 2. PUT /devices/:id (Assuming update endpoint remains standard)
const handleSave = async () => {
  saving.value = true;
  try {
    await api.put(`/devices/${selectedId.value}`, {
      name: form.name,
      status: form.status,
    });
    showToast("Device updated successfully");
    closeFormModal();
    fetchDevices(); // Refresh list
  } catch (err) {
    showToast(
      err.response?.data?.message || "Failed to update device",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchDevices();
});
</script>

<style scoped>
/* Action Button */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-action-icon:hover {
  transform: scale(1.1);
}

/* Device Icon Box */
.device-icon-box {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  backdrop-filter: blur(2px);
}

.modal-custom {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

/* Animations */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
