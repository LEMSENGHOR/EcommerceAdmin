<template>
  <AdminLayout pageTitle="Payments">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div
        class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
      >
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="m-0 fw-bold">Payment Transactions</h6>

          <!-- Filter Tabs -->
          <div class="filter-tabs bg-light p-1 rounded-3 d-flex gap-1">
            <button
              class="filter-tab btn border-0 rounded-pill px-3 small"
              :class="{
                'bg-white shadow-sm text-primary fw-semibold':
                  activeFilter === 'all',
                'text-secondary fw-medium': activeFilter !== 'all',
              }"
              @click="activeFilter = 'all'"
            >
              All
            </button>
            <button
              class="filter-tab btn border-0 rounded-pill px-3 small"
              :class="{
                'bg-white shadow-sm text-primary fw-semibold':
                  activeFilter === 'pending',
                'text-secondary fw-medium': activeFilter !== 'pending',
              }"
              @click="activeFilter = 'pending'"
            >
              Pending
            </button>
            <button
              class="filter-tab btn border-0 rounded-pill px-3 small"
              :class="{
                'bg-white shadow-sm text-primary fw-semibold':
                  activeFilter === 'approved',
                'text-secondary fw-medium': activeFilter !== 'approved',
              }"
              @click="activeFilter = 'approved'"
            >
              Approved
            </button>
            <button
              class="filter-tab btn border-0 rounded-pill px-3 small"
              :class="{
                'bg-white shadow-sm text-primary fw-semibold':
                  activeFilter === 'rejected',
                'text-secondary fw-medium': activeFilter !== 'rejected',
              }"
              @click="activeFilter = 'rejected'"
            >
              Rejected
            </button>
          </div>
        </div>

        <!-- Upload Button -->
        <button
          class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
          @click="openUploadModal"
        >
          <i class="bi bi-upload"></i> Upload Transaction
        </button>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="small text-uppercase text-secondary fw-bold">#</th>
              <th class="small text-uppercase text-secondary fw-bold">
                Transaction ID
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Customer
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Amount
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Method
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Status
              </th>
              <th class="small text-uppercase text-secondary fw-bold">Date</th>
              <th class="small text-uppercase text-secondary fw-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="8" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading...
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-else-if="filteredPayments.length === 0">
              <td colspan="8" class="text-center text-secondary py-4">
                No transactions found
              </td>
            </tr>
            <!-- Payment Rows -->
            <tr v-else v-for="(pay, index) in filteredPayments" :key="pay.id">
              <td>{{ index + 1 }}</td>
              <td>
                <code
                  class="txn-code bg-light text-dark border rounded px-2 py-1 small"
                >
                  {{ pay.transaction_id || pay.id }}
                </code>
              </td>
              <td class="fw-semibold">
                {{ pay.user?.name || pay.customer || "N/A" }}
              </td>
              <td class="fw-semibold text-primary">${{ pay.amount }}</td>
              <td>
                <span
                  class="badge bg-info bg-opacity-10 text-info border border-info-subtle rounded-pill small fw-semibold text-capitalize"
                >
                  {{ pay.method || pay.payment_method || "N/A" }}
                </span>
              </td>
              <td>
                <span
                  class="badge rounded-pill border"
                  :class="getStatusBadge(pay.status)"
                >
                  {{ pay.status || "pending" }}
                </span>
              </td>
              <td class="text-secondary small">
                {{ formatDate(pay.created_at) }}
              </td>
              <td>
                <div class="d-flex gap-2" v-if="pay.status === 'pending'">
                  <button
                    class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon"
                    @click="handleApprove(pay.id)"
                    title="Approve"
                  >
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                    @click="openRejectModal(pay.id)"
                    title="Reject"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <span v-else class="text-secondary small fst-italic"
                  >Processed</span
                >
              </td>
            </tr>
          </tbody>
        </table>
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
          <button
            type="button"
            class="btn-close"
            @click="closeUploadModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleUpload">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="txnId"
                v-model="uploadForm.transaction_id"
                placeholder="Transaction ID"
                required
              />
              <label for="txnId">Transaction ID</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="number"
                step="0.01"
                class="form-control"
                id="txnAmount"
                v-model="uploadForm.amount"
                placeholder="Amount"
                required
              />
              <label for="txnAmount">Amount ($)</label>
            </div>
            <div class="form-floating mb-3">
              <select
                class="form-select"
                id="txnMethod"
                v-model="uploadForm.method"
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="aba">ABA Pay</option>
                <option value="wing">Wing</option>
                <option value="cash">Cash</option>
              </select>
              <label for="txnMethod">Payment Method</label>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"
                >Transaction File / Receipt</label
              >
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
                :disabled="uploading"
              >
                <span v-if="!uploading">
                  <i class="bi bi-upload me-1"></i> Upload
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Uploading...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reject Reason Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showRejectModal"
      @click.self="closeRejectModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Reject Payment</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeRejectModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleReject">
            <div class="form-floating mb-3">
              <textarea
                class="form-control"
                id="rejectReason"
                v-model="rejectForm.reason"
                placeholder="Reason"
                style="height: 100px"
                required
              ></textarea>
              <label for="rejectReason">Rejection Reason</label>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="closeRejectModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-danger text-white fw-semibold rounded-2"
                :disabled="rejecting"
              >
                <span v-if="!rejecting">Reject Payment</span>
                <span v-else
                  ><span class="spinner-border spinner-border-sm"></span
                ></span>
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
const payments = ref([]);
const loading = ref(true);
const uploading = ref(false);
const rejecting = ref(false);
const activeFilter = ref("all");

// Modals
const showUploadModal = ref(false);
const showRejectModal = ref(false);
const selectedId = ref(null);

// Forms
const uploadForm = reactive({
  transaction_id: "",
  amount: "",
  method: "aba",
  file: null,
});
const rejectForm = reactive({ reason: "" });

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

// Computed Filter
const filteredPayments = computed(() => {
  if (activeFilter.value === "all") return payments.value;
  return payments.value.filter(
    (p) => (p.status || "pending") === activeFilter.value,
  );
});

// Helpers
const getStatusBadge = (status) => {
  const map = {
    pending:
      "bg-warning bg-opacity-10 text-warning border border-warning-subtle",
    approved:
      "bg-success bg-opacity-10 text-success border border-success-subtle",
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
  });
};

const handleFileUpload = (event) => {
  uploadForm.file = event.target.files[0];
};

// 1. GET /payments
const fetchPayments = async () => {
  loading.value = true;
  try {
    const response = await api.get("/payments");
    payments.value = response.data.data || response.data || [];
  } catch (err) {
    showToast("Failed to load payments", "error");
  } finally {
    loading.value = false;
  }
};

// 2. POST /payments/upload (FormData)
const handleUpload = async () => {
  if (!uploadForm.file) {
    showToast("Please attach a file", "error");
    return;
  }
  uploading.value = true;

  const formData = new FormData();
  formData.append("transaction_id", uploadForm.transaction_id);
  formData.append("amount", uploadForm.amount);
  formData.append("method", uploadForm.method);
  formData.append("file", uploadForm.file);

  try {
    await api.post("/payments/upload", formData);
    showToast("Transaction uploaded successfully");
    closeUploadModal();
    fetchPayments();
  } catch (err) {
    showToast(err.response?.data?.message || "Upload failed", "error");
  } finally {
    uploading.value = false;
  }
};

// 3. PUT /payments/:id/approve
const handleApprove = async (id) => {
  try {
    await api.put(`/payments/${id}/approve`);
    showToast("Payment approved successfully");
    fetchPayments();
  } catch (err) {
    showToast(err.response?.data?.message || "Approval failed", "error");
  }
};

// 4. PUT /payments/:id/reject
const handleReject = async () => {
  rejecting.value = true;
  try {
    // Fixed: Use selectedId.value instead of undefined 'id'
    await api.put(`/payments/${selectedId.value}/reject`, {
      reason: rejectForm.reason,
    });
    showToast("Payment rejected");
    closeRejectModal();
    fetchPayments();
  } catch (err) {
    showToast(err.response?.data?.message || "Rejection failed", "error");
  } finally {
    rejecting.value = false;
  }
};

// Modal Controls
const openUploadModal = () => {
  uploadForm.transaction_id = "";
  uploadForm.amount = "";
  uploadForm.method = "aba";
  uploadForm.file = null;
  showUploadModal.value = true;
};
const closeUploadModal = () => {
  showUploadModal.value = false;
};
const openRejectModal = (id) => {
  selectedId.value = id;
  rejectForm.reason = "";
  showRejectModal.value = true;
};
const closeRejectModal = () => {
  showRejectModal.value = false;
};

onMounted(() => {
  fetchPayments();
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
