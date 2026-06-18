<template>
  <AdminLayout pageTitle="Payments">
    <div class="payments-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-credit-card fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.total }}</div>
                <div class="stat-label small text-secondary">Total Payments</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-clock-history fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.pendingCount }}</div>
                <div class="stat-label small text-secondary">Pending</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-currency-dollar fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">${{ formatNumber(store.totalRevenue) }}</div>
                <div class="stat-label small text-secondary">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-check-circle fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ approvedCount }}</div>
                <div class="stat-label small text-secondary">Approved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="data-card bg-white border rounded-3 shadow-sm p-4">
        <!-- Header -->
        <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <h6 class="m-0 fw-bold">Payment Transactions</h6>

            <!-- Filter Tabs -->
            <div class="filter-tabs bg-light p-1 rounded-3 d-flex gap-1">
              <button
                class="filter-tab btn border-0 rounded-pill px-3 small"
                :class="{
                  'bg-white shadow-sm text-primary fw-semibold':
                    store.statusFilter === 'all',
                  'text-secondary fw-medium': store.statusFilter !== 'all',
                }"
                @click="store.setFilter('all')"
              >
                All
              </button>
              <button
                class="filter-tab btn border-0 rounded-pill px-3 small"
                :class="{
                  'bg-white shadow-sm text-primary fw-semibold':
                    store.statusFilter === 'pending',
                  'text-secondary fw-medium': store.statusFilter !== 'pending',
                }"
                @click="store.setFilter('pending')"
              >
                Pending
              </button>
              <button
                class="filter-tab btn border-0 rounded-pill px-3 small"
                :class="{
                  'bg-white shadow-sm text-primary fw-semibold':
                    store.statusFilter === 'approved',
                  'text-secondary fw-medium': store.statusFilter !== 'approved',
                }"
                @click="store.setFilter('approved')"
              >
                Approved
              </button>
              <button
                class="filter-tab btn border-0 rounded-pill px-3 small"
                :class="{
                  'bg-white shadow-sm text-primary fw-semibold':
                    store.statusFilter === 'rejected',
                  'text-secondary fw-medium': store.statusFilter !== 'rejected',
                }"
                @click="store.setFilter('rejected')"
              >
                Rejected
              </button>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="refreshData"
              :disabled="store.loading"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': store.loading }"></i>
            </button>
            <button
              class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="openUploadModal"
            >
              <i class="bi bi-upload"></i> Upload Transaction
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
                <th class="small text-uppercase text-secondary fw-bold">Transaction ID</th>
                <th class="small text-uppercase text-secondary fw-bold">Customer</th>
                <th class="small text-uppercase text-secondary fw-bold">Amount</th>
                <th class="small text-uppercase text-secondary fw-bold">Method</th>
                <th class="small text-uppercase text-secondary fw-bold">Status</th>
                <th class="small text-uppercase text-secondary fw-bold">Date</th>
                <th class="small text-uppercase text-secondary fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="store.loading">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2"></div> Loading payments...
                </td>
              </tr>
              <!-- Empty State -->
              <tr v-else-if="store.filteredPayments.length === 0">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2">
                    <i class="bi bi-credit-card fs-1"></i>
                  </div>
                  <span class="text-secondary fw-bold">No transactions found</span>
                </td>
              </tr>
              <!-- Payment Rows -->
              <tr
                v-else
                v-for="(pay) in paginatedPayments"
                :key="pay.id"
                :class="{ 'table-primary': selectedPayments.includes(pay.id) }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    v-model="selectedPayments" 
                    :value="pay.id"
                  >
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <code
                      class="txn-code bg-light text-dark border rounded px-2 py-1 small"
                    >
                      {{ pay.transaction_id || pay.id }}
                    </code>
                    <button 
                      class="btn btn-sm btn-link text-decoration-none p-0" 
                      @click="copyTransactionId(pay.transaction_id || pay.id)"
                      title="Copy ID"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <div class="fw-semibold">{{ pay.user?.name || pay.customer_name || "N/A" }}</div>
                  <div class="text-muted small">{{ pay.user?.email || pay.customer_email || "" }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-primary fs-5">${{ formatNumber(pay.amount) }}</div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i :class="getMethodIcon(pay.method || pay.payment_method)"></i>
                    <span class="fw-medium">{{ getMethodName(pay.method || pay.payment_method) }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill border" :class="getStatusBadge(pay.status)">
                    {{ pay.status || "pending" }}
                  </span>
                </td>
                <td>
                  <div class="text-secondary small">
                    {{ formatDate(pay.created_at) }}
                  </div>
                  <div class="text-muted small" v-if="pay.last_active">
                    {{ formatLastActive(pay.last_active) }}
                  </div>
                </td>
                <td class="text-end">
                  <div class="d-flex gap-2 justify-content-end">
                    <button
                      class="btn btn-sm btn-outline-info border-0 rounded-2 btn-action-icon"
                      @click="openDetailModal(pay)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <template v-if="pay.status === 'pending'">
                      <button
                        class="btn btn-sm btn-outline-success border-0 rounded-2 btn-action-icon"
                        @click="handleApprove(pay.id)"
                        title="Approve"
                        :disabled="store.processing"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                        @click="openRejectModal(pay.id)"
                        title="Reject"
                        :disabled="store.processing"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </template>
                    <span v-else class="text-secondary small fst-italic">
                      Processed
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedPayments.length > 0" class="bulk-actions-bar bg-light border-top p-3 mt-3 rounded-2">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <span class="fw-semibold">{{ selectedPayments.length }} payments selected</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success rounded-2" @click="bulkApprove">
                <i class="bi bi-check-circle me-1"></i> Approve All
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-2" @click="bulkReject">
                <i class="bi bi-x-circle me-1"></i> Reject All
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="store.lastPage > 1" class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <small class="text-secondary">
            Page {{ store.currentPage }} of {{ store.lastPage }} · {{ store.total }} payments
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

    <!-- Upload Transaction Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showUploadModal"
      @click.self="closeUploadModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Upload Transaction File</h5>
          <button type="button" class="btn-close" @click="closeUploadModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleUpload">
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Transaction ID *</label>
              <input
                type="text"
                class="form-control"
                id="txnId"
                v-model="uploadForm.transaction_id"
                placeholder="Enter transaction ID"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                class="form-control"
                id="txnAmount"
                v-model="uploadForm.amount"
                placeholder="0.00"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Payment Method *</label>
              <select
                class="form-select"
                id="txnMethod"
                v-model="uploadForm.method"
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="aba">ABA Pay</option>
                <option value="wing">Wing</option>
                <option value="true_money">True Money</option>
                <option value="acleda">ACLEDA</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Transaction File / Receipt *</label>
              <input
                type="file"
                class="form-control"
                @change="handleFileUpload"
                accept="image/*,.pdf"
                required
              />
              <div class="form-text text-muted small mt-1">
                Accept: JPG, PNG, PDF (max 5MB)
              </div>
              <div v-if="filePreview" class="mt-2">
                <img
                  v-if="isImageFile(uploadForm.file)"
                  :src="filePreview"
                  alt="Preview"
                  class="rounded-3 border"
                  style="max-width: 200px; max-height: 200px;"
                />
                <div v-else class="bg-light p-3 rounded-3">
                  <i class="bi bi-file-earmark-pdf text-danger fs-1"></i>
                  <p class="small mb-0 mt-2">{{ uploadForm.file.name }}</p>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="closeUploadModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary fw-semibold rounded-2"
                :disabled="store.uploading"
              >
                <span v-if="!store.uploading">
                  <i class="bi bi-upload me-1"></i> Upload
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span> Uploading...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Payment Details Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="store.showDetailModal"
      @click.self="store.closeDetailModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 600px;">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Payment Details</h5>
          <button type="button" class="btn-close" @click="store.closeDetailModal"></button>
        </div>
        <div class="modal-body-custom p-4" v-if="store.selectedPayment">
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="text-secondary small">Transaction ID</div>
              <div class="fw-semibold">{{ store.selectedPayment.transaction_id || store.selectedPayment.id }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary small">Status</div>
              <span class="badge rounded-pill border" :class="getStatusBadge(store.selectedPayment.status)">
                {{ store.selectedPayment.status || "pending" }}
              </span>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="text-secondary small">Amount</div>
              <div class="fs-4 fw-bold text-primary">${{ formatNumber(store.selectedPayment.amount) }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary small">Payment Method</div>
              <div class="fw-semibold d-flex align-items-center gap-2">
                <i :class="getMethodIcon(store.selectedPayment.method)"></i>
                {{ getMethodName(store.selectedPayment.method) }}
              </div>
            </div>
          </div>
          <div class="mb-3">
            <div class="text-secondary small">Customer</div>
            <div class="fw-semibold">{{ store.selectedPayment.user?.name || store.selectedPayment.customer_name || "N/A" }}</div>
            <div class="text-muted small">{{ store.selectedPayment.user?.email || store.selectedPayment.customer_email || "" }}</div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="text-secondary small">Created</div>
              <div class="fw-semibold">{{ formatDate(store.selectedPayment.created_at) }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary small">Last Updated</div>
              <div class="fw-semibold">{{ formatDate(store.selectedPayment.updated_at) }}</div>
            </div>
          </div>
          <div v-if="store.selectedPayment.rejection_reason" class="mb-3">
            <div class="text-secondary small">Rejection Reason</div>
            <div class="text-danger">{{ store.selectedPayment.rejection_reason }}</div>
          </div>
          <div v-if="store.selectedPayment.transaction_file" class="mb-3">
            <div class="text-secondary small">Transaction File</div>
            <a :href="store.selectedPayment.transaction_file" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-download me-1"></i> Download
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Reason Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="store.showRejectModal"
      @click.self="store.closeRejectModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Reject Payment</h5>
          <button
            type="button"
            class="btn-close"
            @click="store.closeRejectModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleReject">
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Rejection Reason *</label>
              <textarea
                class="form-control"
                id="rejectReason"
                v-model="store.rejectForm.reason"
                placeholder="Enter reason for rejection"
                style="height: 100px"
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="store.closeRejectModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-danger text-white fw-semibold rounded-2"
                :disabled="store.processing"
              >
                <span v-if="!store.processing">
                  <i class="bi bi-x-circle me-1"></i> Reject Payment
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span> Processing...
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
      v-if="store.toast.show"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="store.toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i
              class="bi"
              :class="
                store.toast.type === 'success'
                  ? 'bi-check-circle-fill'
                  : 'bi-x-circle-fill'
              "
            ></i>
            {{ store.toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { usePaymentStore } from "../stores/PaymentStore";
import AdminLayout from "@/layouts/AdminLayout.vue";

// Store
const store = usePaymentStore();

// Local State
const showUploadModal = ref(false);
const selectedPayments = ref([]);
const selectAll = ref(false);
const filePreview = ref(null);

// Upload Form
const uploadForm = ref({
  transaction_id: "",
  amount: "",
  method: "aba",
  file: null,
});

// Computed
const paginatedPayments = computed(() => {
  return store.filteredPayments;
});

const approvedCount = computed(() => {
  return store.payments.filter((p) => p.status === "approved").length;
});

// Methods
const formatNumber = (num) => {
  if (!num) return "0.00";
  return parseFloat(num).toFixed(2);
};

const getStatusBadge = (status) => {
  const map = {
    pending: "bg-warning bg-opacity-10 text-warning border border-warning-subtle",
    approved: "bg-success bg-opacity-10 text-success border border-success-subtle",
    rejected: "bg-danger bg-opacity-10 text-danger border border-danger-subtle",
  };
  return map[status] || "bg-warning bg-opacity-10 text-warning";
};

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

const formatLastActive = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const getMethodIcon = (method) => {
  if (!method) return "bi-credit-card text-secondary";
  const m = method.toLowerCase();
  if (m.includes("aba")) return "bi-bank text-primary";
  if (m.includes("wing")) return "bi-bank2 text-success";
  if (m.includes("true_money")) return "bi-wallet2 text-warning";
  if (m.includes("acleda")) return "bi-building text-info";
  if (m.includes("bank")) return "bi-bank text-dark";
  if (m.includes("cash")) return "bi-cash text-success";
  return "bi-credit-card text-secondary";
};

const getMethodName = (method) => {
  if (!method) return "N/A";
  const m = method.toLowerCase();
  if (m.includes("aba")) return "ABA Pay";
  if (m.includes("wing")) return "Wing";
  if (m.includes("true_money")) return "True Money";
  if (m.includes("acleda")) return "ACLEDA";
  if (m.includes("bank")) return "Bank Transfer";
  if (m.includes("cash")) return "Cash";
  return method;
};

const isImageFile = (file) => {
  if (!file) return false;
  return file.type.startsWith("image/");
};

const copyTransactionId = async (id) => {
  try {
    await navigator.clipboard.writeText(id);
    store.showToast("Transaction ID copied to clipboard", "success");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadForm.value.file = file;
    if (isImageFile(file)) {
      filePreview.value = URL.createObjectURL(file);
    } else {
      filePreview.value = null;
    }
  }
};

const refreshData = async () => {
  await store.fetchPayments();
};

const openUploadModal = () => {
  uploadForm.value = {
    transaction_id: "",
    amount: "",
    method: "aba",
    file: null,
  };
  filePreview.value = null;
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  uploadForm.value = {
    transaction_id: "",
    amount: "",
    method: "aba",
    file: null,
  };
  filePreview.value = null;
};

const openDetailModal = (payment) => {
  store.openDetailModal(payment);
};

const handleUpload = async () => {
  if (!uploadForm.value.file) {
    store.showToast("Please attach a file", "error");
    return;
  }

  // For now, this is a placeholder - you need to implement the actual upload endpoint
  store.showToast("Transaction uploaded successfully");
  closeUploadModal();
  await refreshData();
};

const handleApprove = async (id) => {
  await store.approvePayment(id);
  selectedPayments.value = selectedPayments.value.filter(pId => pid !== id);
};

const openRejectModal = (id) => {
  store.openRejectModal(store.getPaymentById(id));
};

const handleReject = async () => {
  if (store.selectedPayment) {
    await store.rejectPayment(store.selectedPayment.id);
    selectedPayments.value = selectedPayments.value.filter(pId => pid !== store.selectedPayment.id);
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPayments.value = paginatedPayments.value.map(p => p.id);
  } else {
    selectedPayments.value = [];
  }
};

const bulkApprove = async () => {
  for (const id of selectedPayments.value) {
    await store.approvePayment(id);
  }
  selectedPayments.value = [];
};

const bulkReject = async () => {
  store.rejectForm.reason = "Bulk rejection - Reason required";
  for (const id of selectedPayments.value) {
    const payment = store.getPaymentById(id);
    if (payment && payment.status === "pending") {
      await store.rejectPayment(id);
    }
  }
  selectedPayments.value = [];
};

// Watch for changes
watch(selectedPayments, (newVal) => {
  selectAll.value = newVal.length === paginatedPayments.value.length && paginatedPayments.value.length > 0;
});

// Lifecycle
onMounted(() => {
  store.fetchPayments();
});
</script>

<style scoped>
.payments-page {
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

/* Filter Tabs */
.filter-tabs {
  transition: background-color 0.2s ease-in-out;
}

.filter-tab {
  transition: all 0.2s ease-in-out;
}

.filter-tab:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Transaction Code */
.txn-code {
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
  .filter-tabs {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-tab {
    flex: 1;
    font-size: 11px;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-custom {
    max-width: 100%;
    margin: 1rem;
  }
}
</style>