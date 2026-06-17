<template>
  <AdminLayout pageTitle="Devices">
    <div class="devices-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-display fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.total }}</div>
                <div class="stat-label small text-secondary">Total Devices</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-check-circle fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.activeCount }}</div>
                <div class="stat-label small text-secondary">Active Devices</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-phone fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ mobileCount }}</div>
                <div class="stat-label small text-secondary">Mobile Devices</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-laptop fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ desktopCount }}</div>
                <div class="stat-label small text-secondary">Desktop Devices</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="data-card bg-white border rounded-3 shadow-sm p-4">
        <!-- Header -->
        <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap grow">
            <h6 class="m-0 fw-bold">Registered Devices</h6>
            <div class="position-relative grow" style="max-width: 300px;">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
              <input
                type="text"
                class="form-control ps-5"
                style="border-radius: 8px;"
                placeholder="Search devices..."
                :value="store.searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="d-flex gap-2 align-items-center">
            <!-- Platform Filter -->
            <select class="form-select form-select-sm" style="width: auto;" v-model="platformFilter" @change="applyFilters">
              <option value="">All Platforms</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="windows">Windows</option>
              <option value="mac">Mac</option>
              <option value="linux">Linux</option>
            </select>
            
            <!-- Status Filter -->
            <select class="form-select form-select-sm" style="width: auto;" v-model="statusFilter" @change="applyFilters">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button
              class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="refreshData"
              :disabled="store.loading"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': store.loading }"></i>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="small text-uppercase text-secondary fw-bold" width="50">
                  <input type="checkbox" class="form-check-input" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th class="small text-uppercase text-secondary fw-bold">Device</th>
                <th class="small text-uppercase text-secondary fw-bold">Platform</th>
                <th class="small text-uppercase text-secondary fw-bold">Device ID</th>
                <th class="small text-uppercase text-secondary fw-bold">Status</th>
                <th class="small text-uppercase text-secondary fw-bold">Last Active</th>
                <th class="small text-uppercase text-secondary fw-bold">Created</th>
                <th class="small text-uppercase text-secondary fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="store.loading">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div> Loading devices...
                </td>
              </tr>
              <!-- Empty -->
              <tr v-else-if="!filteredDevices.length">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2">
                    <i class="bi bi-display fs-1"></i>
                  </div>
                  <span class="text-secondary fw-bold">No devices found</span>
                </td>
              </tr>
              <!-- Device Rows -->
              <tr
                v-else
                v-for="(device) in paginatedDevices"
                :key="device.id"
                :class="{ 'table-primary': selectedDevices.includes(device.id) }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    v-model="selectedDevices" 
                    :value="device.id"
                  >
                </td>
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="device-icon-box bg-light text-secondary rounded-2 d-flex align-items-center justify-content-center">
                      <i :class="getPlatformIcon(device.platform || device.os)"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ device.name || device.device_name || "Unknown Device" }}</div>
                      <div class="text-muted small" v-if="device.model">
                        {{ device.model }}
                      </div>
                      <div class="text-muted small" v-if="device.os_version">
                        {{ device.os_version }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i :class="getPlatformIcon(device.platform || device.os)"></i>
                    <span class="fw-medium">{{ device.platform || device.os || "Unknown" }}</span>
                  </div>
                </td>
                <td>
                  <div class="device-code-wrapper">
                    <code class="device-code bg-light text-dark border rounded px-2 py-1 small text-break">
                      {{ truncateDeviceId(device.device_id || device.uuid) }}
                    </code>
                    <button 
                      class="btn btn-sm btn-link text-decoration-none p-0 ms-1" 
                      @click="copyDeviceId(device.device_id || device.uuid)"
                      title="Copy Device ID"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill" :class="getStatusBadge(device.status)">
                    {{ device.status || "active" }}
                  </span>
                </td>
                <td>
                  <div class="text-secondary small">
                    {{ formatLastActive(device.last_active || device.updated_at) }}
                  </div>
                </td>
                <td>
                  <div class="text-secondary small">
                    {{ formatDate(device.created_at) }}
                  </div>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon"
                      @click="openViewModal(device)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                      @click="store.openEditModal(device)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                      @click="confirmDelete(device)"
                      title="Delete"
                      :disabled="store.deleting"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedDevices.length > 0" class="bulk-actions-bar bg-light border-top p-3 mt-3 rounded-2">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <span class="fw-semibold">{{ selectedDevices.length }} devices selected</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary rounded-2" @click="bulkUpdateStatus('active')">
                <i class="bi bi-check-circle me-1"></i> Activate
              </button>
              <button class="btn btn-sm btn-outline-secondary rounded-2" @click="bulkUpdateStatus('inactive')">
                <i class="bi bi-dash-circle me-1"></i> Deactivate
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-2" @click="bulkDelete">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="store.lastPage > 1" class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
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
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Device Name *</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.name" 
                placeholder="Enter device name" 
                required 
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Device ID</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control bg-light" 
                  :value="form.device_id" 
                  readonly 
                />
                <button class="btn btn-outline-secondary" type="button" @click="copyDeviceId(form.device_id)">
                  <i class="bi bi-clipboard"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Platform</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i :class="getPlatformIcon(form.platform)"></i>
                </span>
                <input type="text" class="form-control bg-light" :value="form.platform" readonly />
              </div>
            </div>

            <div class="mb-3" v-if="form.os_version">
              <label class="form-label fw-semibold text-secondary small">OS Version</label>
              <input type="text" class="form-control bg-light" :value="form.os_version" readonly />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Model</label>
              <input type="text" class="form-control bg-light" :value="form.model" readonly />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Status</label>
              <select class="form-select" v-model="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button 
                type="button" 
                class="btn btn-light fw-semibold rounded-2" 
                @click="store.closeFormModal"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary fw-semibold rounded-2" 
                :disabled="store.saving"
              >
                <span v-if="!store.saving">
                  <i class="bi bi-save me-1"></i> Save Changes
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span> Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Device Details Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showViewModal"
      @click.self="closeViewModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 600px;">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Device Details</h5>
          <button type="button" class="btn-close" @click="closeViewModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <div v-if="viewingDevice" class="text-center">
            <div class="device-icon-large bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 80px; height: 80px; font-size: 32px;">
              <i :class="getPlatformIcon(viewingDevice.platform || viewingDevice.os)"></i>
            </div>
            
            <h4 class="fw-bold mb-2">{{ viewingDevice.name || viewingDevice.device_name || "Unknown Device" }}</h4>
            
            <div class="mb-3">
              <span class="badge rounded-pill" :class="getStatusBadge(viewingDevice.status)">
                {{ viewingDevice.status || "active" }}
              </span>
              <span class="badge bg-primary ms-2">{{ viewingDevice.platform || viewingDevice.os || "Unknown" }}</span>
            </div>
            
            <div class="row mb-3">
              <div class="col-6">
                <div class="text-secondary small">Device ID</div>
                <div class="fw-semibold">{{ viewingDevice.device_id || viewingDevice.uuid || "—" }}</div>
              </div>
              <div class="col-6">
                <div class="text-secondary small">Model</div>
                <div class="fw-semibold">{{ viewingDevice.model || "—" }}</div>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-6">
                <div class="text-secondary small">OS Version</div>
                <div class="fw-semibold">{{ viewingDevice.os_version || "—" }}</div>
              </div>
              <div class="col-6">
                <div class="text-secondary small">Last Active</div>
                <div class="fw-semibold">{{ formatLastActive(viewingDevice.last_active || viewingDevice.updated_at) }}</div>
              </div>
            </div>
            
            <div class="text-muted small">
              <i class="bi bi-calendar"></i> Registered: {{ formatDate(viewingDevice.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="deleteTarget"
      @click.self="deleteTarget = null"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 400px;">
        <div class="p-4 text-center">
          <div class="mb-3 text-danger">
            <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem"></i>
          </div>
          <h5 class="fw-bold mb-2">Delete Device?</h5>
          <p class="text-secondary mb-4">
            Are you sure you want to delete <strong>{{ deleteTarget.name || deleteTarget.device_name }}</strong>? This action cannot be undone.
          </p>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-light rounded-2 px-4" @click="deleteTarget = null">
              Cancel
            </button>
            <button
              class="btn btn-danger rounded-2 px-4"
              :disabled="store.deleting"
              @click="handleDelete"
            >
              <span v-if="!store.deleting">
                <i class="bi bi-trash me-1"></i> Delete
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-1"></span> Deleting...
              </span>
            </button>
          </div>
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";
import AdminLayout from "@/layouts/AdminLayout.vue";

const store = useDeviceStore();

// State
const form = reactive({ name: "", device_id: "", status: "active", platform: "", os_version: "", model: "" });
const selectedDevices = ref([]);
const selectAll = ref(false);
const platformFilter = ref("");
const statusFilter = ref("");
const showViewModal = ref(false);
const viewingDevice = ref(null);
const deleteTarget = ref(null);

// Computed
const paginatedDevices = computed(() => {
  return store.filteredDevices;
});

const filteredDevices = computed(() => {
  let devices = store.filteredDevices;
  
  if (platformFilter.value) {
    devices = devices.filter(d => 
      (d.platform || d.os || '').toLowerCase().includes(platformFilter.value.toLowerCase())
    );
  }
  
  if (statusFilter.value) {
    devices = devices.filter(d => 
      (d.status || '').toLowerCase() === statusFilter.value.toLowerCase()
    );
  }
  
  return devices;
});

const mobileCount = computed(() => {
  return store.devices.filter(d => {
    const platform = (d.platform || d.os || '').toLowerCase();
    return platform.includes('android') || platform.includes('ios') || platform.includes('mobile');
  }).length;
});

const desktopCount = computed(() => {
  return store.devices.filter(d => {
    const platform = (d.platform || d.os || '').toLowerCase();
    return platform.includes('windows') || platform.includes('mac') || platform.includes('linux') || 
           platform.includes('desktop') || platform.includes('pc');
  }).length;
});

// Methods
const getPlatformIcon = (platform) => {
  if (!platform) return "bi-display";
  const p = platform.toLowerCase();
  if (p.includes("android")) return "bi-android2 text-success";
  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad")) return "bi-apple text-dark";
  if (p.includes("windows")) return "bi-windows text-primary";
  if (p.includes("mac")) return "bi-laptop text-dark";
  if (p.includes("linux")) return "bi-ubuntu text-warning";
  if (p.includes("mobile") || p.includes("phone")) return "bi-phone text-success";
  if (p.includes("desktop") || p.includes("pc")) return "bi-display text-primary";
  if (p.includes("laptop")) return "bi-laptop text-dark";
  if (p.includes("tablet") || p.includes("ipad")) return "bi-tablet text-primary";
  return "bi-display text-secondary";
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
  });
};

const formatLastActive = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateString);
};

const truncateDeviceId = (deviceId) => {
  if (!deviceId) return "—";
  if (deviceId.length <= 20) return deviceId;
  return `${deviceId.substring(0, 10)}...${deviceId.substring(deviceId.length - 8)}`;
};

const copyDeviceId = async (deviceId) => {
  try {
    await navigator.clipboard.writeText(deviceId);
    // Show toast notification
    store.showToast("Device ID copied to clipboard", "success");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const handleSearch = () => {
  store.setSearchQuery(store.searchQuery);
  store.fetchDevices();
};

const applyFilters = () => {
  // Filters are applied via computed property
};

const refreshData = async () => {
  await store.fetchDevices();
};

const openViewModal = (device) => {
  viewingDevice.value = device;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingDevice.value = null;
};

const confirmDelete = (device) => {
  deleteTarget.value = device;
};

const handleDelete = async () => {
  const success = await store.deleteDevice(deleteTarget.value.id);
  if (success) {
    deleteTarget.value = null;
    selectedDevices.value = selectedDevices.value.filter(id => id !== deleteTarget.value.id);
  }
};

const handleSave = async () => {
  const success = await store.updateDevice(store.selectedDevice.id, {
    name: form.name,
    status: form.status,
  });
  if (success) {
    store.closeFormModal();
    await refreshData();
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedDevices.value = paginatedDevices.value.map(d => d.id);
  } else {
    selectedDevices.value = [];
  }
};

const bulkUpdateStatus = async (status) => {
  // Implement bulk status update
  console.log('Bulk update status:', status, selectedDevices.value);
};

const bulkDelete = async () => {
  // Implement bulk delete
  console.log('Bulk delete:', selectedDevices.value);
};

// Watch for changes
watch(
  () => store.selectedDevice,
  (device) => {
    if (!device) return;
    form.name = device.name || device.device_name || "";
    form.device_id = device.device_id || device.uuid || "";
    form.platform = device.platform || device.os || "";
    form.os_version = device.os_version || "";
    form.model = device.model || "";
    form.status = device.status || "active";
  },
);

watch(selectedDevices, (newVal) => {
  selectAll.value = newVal.length === paginatedDevices.value.length && paginatedDevices.value.length > 0;
});

onMounted(() => store.fetchDevices());
</script>

<style scoped>
.devices-page {
  animation: fadeIn 0.3s ease-in-out;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Data Card */
.data-card {
  transition: box-shadow 0.2s ease-in-out;
}

.data-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* Device Icon */
.device-icon-box {
  width: 40px;
  height: 40px;
  font-size: 20px;
  transition: transform 0.2s ease-in-out;
}

.device-icon-box:hover {
  transform: scale(1.1);
}

.device-icon-large {
  transition: transform 0.2s ease-in-out;
}

.device-icon-large:hover {
  transform: scale(1.1);
}

/* Device Code */
.device-code-wrapper {
  display: flex;
  align-items: center;
}

.device-code {
  max-width: 120px;
  font-family: monospace;
  font-size: 11px;
}

/* Action Buttons */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
}

.btn-action-icon:hover {
  transform: scale(1.1);
}

/* Table Styles */
.table thead th {
  border-bottom: 2px solid #dee2e6;
  background-color: #fafafa;
}

.table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-in-out;
}

.modal-custom {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

/* Bulk Actions */
.bulk-actions-bar {
  animation: slideDown 0.3s ease;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

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

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-custom {
    max-width: 100%;
    margin: 1rem;
  }
  
  .device-code {
    max-width: 80px;
  }
}
</style>