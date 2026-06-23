<template>
  <AdminLayout pageTitle="ឧបករណ៍">
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
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <!-- Header -->
        <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white p-3 border-bottom">
          <div class="position-relative" style="max-width: 300px">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
            <input type="text" class="form-control ps-5" style="border-radius: 8px;" placeholder="Search by IP or Location..." v-model="store.searchQuery" @input="handleSearch" />
          </div>
          <button class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="refreshData" :disabled="store.loading">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': store.loading }"></i> Refresh
          </button>
        </div>

        <!-- ⬅️⬅️⬅️ ប្រើ BaseTable ដូចគ្នានឹង Category ⬅️⬅️⬅️ -->
        <div class="p-3">
          <BaseTable 
            :columns="tableColumns" 
            :rows="store.paginatedDevices" 
            :loading="store.loading" 
            emptyMessage="No devices found"
            :currentPage="store.currentPage"
            :lastPage="store.totalPages"
            :totalItems="store.filteredDevices.length"
            :perPage="store.perPage"
            @change-page="handlePageChange"
          >
            <template #cell(device)="{ row }">
              <div class="d-flex align-items-center gap-3">
                <div class="device-icon-box bg-light text-secondary rounded-2 d-flex align-items-center justify-content-center">
                  <i :class="getDeviceTypeIcon(row.device_type)"></i>
                </div>
                <div>
                  <div class="fw-semibold text-dark">{{ row.device_name || 'Unknown Device' }}</div>
                  <div class="text-muted small">{{ row.browser }}</div>
                </div>
              </div>
            </template>

            <template #cell(ip)="{ value }">
              <code class="bg-light text-dark border rounded px-2 py-1 small">{{ value || '—' }}</code>
            </template>

            <template #cell(location)="{ value }">
              <span class="text-secondary small">{{ value || '—' }}</span>
            </template>

            <template #cell(type)="{ row }">
              <span class="badge bg-primary bg-opacity-10 text-primary">{{ getDeviceTypeText(row.device_type) }}</span>
            </template>

            <template #cell(actions)="{ row }">
              <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon" @click="openViewModal(row)" title="View"><i class="bi bi-eye"></i></button>
                <!-- <button class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon" @click="confirmDelete(row)" title="Delete" :disabled="store.deleting"><i class="bi bi-trash"></i></button> -->
              </div>
            </template>
          </BaseTable>
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
import { useDeviceStore } from "../stores/deviceStore"; 
import AdminLayout from "@/layouts/AdminLayout.vue";
import BaseTable from "@/components/BaseTable.vue"; // ⬅️ Import BaseTable

const store = useDeviceStore();

// ⬅️ កំណត់ជួរៈទាំងឡាយណាដែលត្រូវបង្ហាញនៅលើតារាង
const tableColumns = [
  { key: "device", label: "Device" },
  { key: "ip", label: "IP Address" },
  { key: "location", label: "Location" },
  { key: "type", label: "Type", align: "center" },
  { key: "actions", label: "Actions", align: "center" },
];

// State
const showViewModal = ref(false);
const viewingDevice = ref(null);
const deleteTarget = ref(null);

// Computed
const mobileCount = computed(() => store.devices.filter(d => d.device_type === 2).length);
const desktopCount = computed(() => store.devices.filter(d => d.device_type === 1 || d.device_type === 3).length);

// Methods
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

// ⬅️ ដូចគ្នានឹង Category
const handlePageChange = (page) => {
  store.currentPage = page;
};

const handleSearch = () => {
  store.currentPage = 1; // ស្វែងរកថ្មីត្រូវត្រលប់ទៅទំព័រ ១
  store.fetchDevices();
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
.device-icon-box { width: 40px; height: 40px; font-size: 18px; flex-shrink: 0; }
.device-icon-large { transition: transform 0.2s ease; }
.device-icon-large:hover { transform: scale(1.05); }
.btn-action-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
.btn-action-icon:hover { transform: scale(1.1); }

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