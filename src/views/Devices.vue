<template>
  <AdminLayout pageTitle="Devices">
    <div class="devices-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px"><i class="bi bi-display fs-5"></i></div>
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
              <div class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px"><i class="bi bi-check-circle fs-5"></i></div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.total }}</div>
                <div class="stat-label small text-secondary">Active Sessions</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px"><i class="bi bi-phone fs-5"></i></div>
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
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px"><i class="bi bi-laptop fs-5"></i></div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ desktopCount }}</div>
                <div class="stat-label small text-secondary">Desktop/Browser</div>
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
              <!-- FIXED: Changed :value to v-model to allow typing -->
              <input type="text" class="form-control ps-5" style="border-radius: 8px;" placeholder="Search by IP or Location..." v-model="store.searchQuery" @input="handleSearch" />
            </div>
          </div>
          
          <button class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="refreshData" :disabled="store.loading">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': store.loading }"></i>
          </button>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="small text-uppercase text-secondary fw-bold">Device</th>
                <th class="small text-uppercase text-secondary fw-bold">IP Address</th>
                <th class="small text-uppercase text-secondary fw-bold">Location</th>
                <th class="small text-uppercase text-secondary fw-bold text-center">Type</th>
                <th class="small text-uppercase text-secondary fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.loading">
                <td colspan="5" class="text-center text-secondary py-5"><div class="spinner-border spinner-border-sm me-2"></div> Loading devices...</td>
              </tr>
              <tr v-else-if="!store.filteredDevices.length">
                <td colspan="5" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2"><i class="bi bi-display fs-1"></i></div>
                  <span class="text-secondary fw-bold">No devices found</span>
                </td>
              </tr>
              <tr v-else v-for="device in store.filteredDevices" :key="device.id">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="device-icon-box bg-light text-secondary rounded-2 d-flex align-items-center justify-content-center">
                      <i :class="getDeviceTypeIcon(device.device_type)"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ device.device_name || 'Unknown Device' }}</div>
                      <div class="text-muted small">{{ device.browser }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <code class="bg-light text-dark border rounded px-2 py-1 small">{{ device.ip || '—' }}</code>
                </td>
                <td class="text-secondary small">{{ device.location || '—' }}</td>
                <td class="text-center">
                  <span class="badge bg-primary bg-opacity-10 text-primary">{{ getDeviceTypeText(device.device_type) }}</span>
                </td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon" @click="openViewModal(device)" title="View"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon" @click="confirmDelete(device)" title="Delete" :disabled="store.deleting"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="store.lastPage > 1" class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <small class="text-secondary">Page {{ store.currentPage }} of {{ store.lastPage }} · {{ store.total }} devices</small>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-light rounded-2" :disabled="store.currentPage === 1" @click="store.setPage(store.currentPage - 1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-sm btn-light rounded-2" :disabled="store.currentPage === store.lastPage" @click="store.setPage(store.currentPage + 1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Device Details Modal -->
    <div class="modal-overlay fade show d-flex align-items-center justify-content-center" v-if="showViewModal" @click.self="closeViewModal">
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 600px;">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Device Details</h5>
          <button type="button" class="btn-close" @click="closeViewModal"></button>
        </div>
        <div class="modal-body-custom p-4" v-if="viewingDevice">
          <div class="text-center mb-4">
            <div class="device-icon-large bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 80px; height: 80px; font-size: 32px;">
              <i :class="getDeviceTypeIcon(viewingDevice.device_type)"></i>
            </div>
            <h4 class="fw-bold mb-2">{{ viewingDevice.device_name || 'Unknown Device' }}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary">{{ getDeviceTypeText(viewingDevice.device_type) }}</span>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-6"><div class="text-secondary small">IP Address</div><div class="fw-semibold">{{ viewingDevice.ip || '—' }}</div></div>
            <div class="col-6"><div class="text-secondary small">Location</div><div class="fw-semibold">{{ viewingDevice.location || '—' }}</div></div>
            <div class="col-6"><div class="text-secondary small">Browser / OS</div><div class="fw-semibold">{{ viewingDevice.browser || '0' }} / {{ viewingDevice.os || '0' }}</div></div>
            <div class="col-6"><div class="text-secondary small">Device ID</div><div class="fw-semibold">{{ viewingDevice.device_id || '—' }}</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay fade show d-flex align-items-center justify-content-center" v-if="deleteTarget" @click.self="deleteTarget = null">
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 400px;">
        <div class="p-4 text-center">
          <div class="mb-3 text-danger"><i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i></div>
          <h5 class="fw-bold mb-2">Delete Device?</h5>
          <p class="text-secondary mb-4">Are you sure you want to delete this device?</p>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-light rounded-2 px-4" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger rounded-2 px-4" :disabled="store.deleting" @click="handleDelete">
              <span v-if="!store.deleting"><i class="bi bi-trash me-1"></i> Delete</span>
              <span v-else><span class="spinner-border spinner-border-sm me-1"></span></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-container position-fixed top-0 end-0 p-3" v-if="store.toast.show" style="z-index: 1060;">
      <div class="toast show align-items-center text-white border-0" :class="store.toast.type === 'success' ? 'bg-success' : 'bg-danger'" role="alert">
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
import { ref, computed, onMounted } from "vue";
// Ensure correct casing matching your file
import { useDeviceStore } from "../stores/deviceStore"; 
import AdminLayout from "@/layouts/AdminLayout.vue";

const store = useDeviceStore();

// State
const showViewModal = ref(false);
const viewingDevice = ref(null);
const deleteTarget = ref(null);

// Computed (Calculating locally since your JSON doesn't have these fields)
const mobileCount = computed(() => {
  return store.devices.filter(d => d.device_type === 2).length;
});

const desktopCount = computed(() => {
  return store.devices.filter(d => d.device_type === 1 || d.device_type === 3).length;
});

// Methods adapted for your exact JSON fields
const getDeviceTypeText = (type) => {
  if (type === 1) return "Browser";
  if (type === 2) return "Mobile";
  return "Other";
};

const getDeviceTypeIcon = (type) => {
  if (type === 1) return "bi-window-fullscreen text-primary";
  if (type === 2) return "bi-phone text-success";
  return "bi-display text-secondary";
};

const handleSearch = () => {
  store.fetchDevices(); // store.searchQuery is automatically updated by v-model
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
  const id = deleteTarget.value.id;
  const success = await store.deleteDevice(id);
  if (success) {
    deleteTarget.value = null;
  }
};

onMounted(() => store.fetchDevices());
</script>

<style scoped>
.devices-page { animation: fadeIn 0.3s ease-in-out; }
.stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important; }
.data-card { transition: box-shadow 0.2s ease; }
.data-card:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important; }
.device-icon-box { width: 40px; height: 40px; font-size: 18px; }
.btn-action-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
.btn-action-icon:hover { transform: scale(1.1); }

/* Added Modal Scroll Styles */
.modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1055; backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; padding:1rem; animation: fadeIn 0.2s ease; }
.modal-custom { width:100%; max-width:500px; background:white; border-radius:1rem; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:90vh; animation: slideUp 0.3s ease;}
.modal-header-custom { flex-shrink:0; position:sticky; top:0; z-index:10; background:white; padding:1rem; border-bottom:1px solid #dee2e6; border-top-left-radius:1rem; border-top-right-radius:1rem; display:flex; justify-content:space-between; align-items:center;}
.modal-body-custom { flex-grow:1; overflow-y:auto; padding:1.5rem; }

@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
@keyframes spin { 100% { transform: rotate(360deg); } }
.spin-animation { animation: spin 1s linear infinite; }

@media (max-width: 768px) {
  .modal-custom { max-width: 100%; margin: 1rem; }
}
</style>