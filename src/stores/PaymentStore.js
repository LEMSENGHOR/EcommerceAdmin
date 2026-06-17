import { defineStore } from "pinia";
import api from "@/api/api.js";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    // ── Data ──
    payments: [],
    selectedPayment: null,

    // ── UI Flags ──
    loading: false,
    uploading: false,
    processing: false,

    // ── Modal ──
    showDetailModal: false,
    showRejectModal: false,

    // ── Filters & Pagination ──
    statusFilter: "all", // 'all', 'pending', 'approved', 'rejected'
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,

    // ── Form ──
    rejectForm: {
      reason: "",
    },

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // Filter payments based on status
    filteredPayments: (state) => {
      if (state.statusFilter === "all") return state.payments;
      return state.payments.filter((p) => p.status === state.statusFilter);
    },

    // Count pending payments
    pendingCount: (state) =>
      state.payments.filter((p) => p.status === "pending").length,

    // Total approved revenue
    totalRevenue: (state) =>
      state.payments
        .filter((p) => p.status === "approved")
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),

    getPaymentById: (state) => (id) => {
      return state.payments.find((p) => p.id === id);
    },
  },

  actions: {
    // ───────────────────────────────────────────────
    // Toast helper
    // ───────────────────────────────────────────────
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    // ───────────────────────────────────────────────
    // 1. FETCH PAYMENTS
    //    GET /payments
    // ───────────────────────────────────────────────
    async fetchPayments() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
        };

        if (this.statusFilter !== "all") {
          params.status = this.statusFilter;
        }

        const response = await api.get("/payments", { params });
        const payload = response.data;

        // Support multiple response shapes
        if (payload.data && Array.isArray(payload.data)) {
          this.payments = payload.data;
          this.total = payload.total ?? payload.data.length;
          this.lastPage = payload.last_page ?? 1;
          this.currentPage = payload.current_page ?? this.currentPage;
        } else if (Array.isArray(payload)) {
          this.payments = payload;
          this.total = payload.length;
          this.lastPage = 1;
        } else {
          this.payments = [];
          this.total = 0;
          this.lastPage = 1;
        }
      } catch (err) {
        this.handleError(err, "Failed to load payments");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. UPLOAD TRANSACTION FILE
    //    POST /payments/transaction-file/{id}
    // ───────────────────────────────────────────────
    async uploadTransactionFile(paymentId, file) {
      if (!file) return false;

      this.uploading = true;
      try {
        const formData = new FormData();
        formData.append("file", file);
        // Optional: append any additional metadata if your API requires it
        // formData.append("notes", "Updated transaction proof");

        const response = await api.post(
          `/payments/transaction-file/${paymentId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Update local state
        const idx = this.payments.findIndex((p) => p.id === paymentId);
        if (idx !== -1) {
          const updated = response.data.data || response.data;
          this.payments[idx] = {
            ...this.payments[idx],
            ...updated,
          };
        }

        this.showToast("Transaction proof uploaded successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to upload transaction file");
        return false;
      } finally {
        this.uploading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. APPROVE PAYMENT
    //    PUT /payments/approve/{id}
    // ───────────────────────────────────────────────
    async approvePayment(paymentId) {
      this.processing = true;
      try {
        const response = await api.put(`/payments/approve/${paymentId}`);

        // Update local state optimistically
        const idx = this.payments.findIndex((p) => p.id === paymentId);
        if (idx !== -1) {
          const updated = response.data.data || response.data;
          this.payments[idx] = {
            ...this.payments[idx],
            ...updated,
            status: "approved",
          };
        }

        // Update selected payment if it's open in modal
        if (this.selectedPayment?.id === paymentId) {
          this.selectedPayment.status = "approved";
        }

        this.showToast("Payment approved successfully");
        this.closeRejectModal(); // Ensure modals are closed
        return true;
      } catch (err) {
        this.handleError(err, "Failed to approve payment");
        return false;
      } finally {
        this.processing = false;
      }
    },

    // ───────────────────────────────────────────────
    // 4. REJECT PAYMENT
    //    PUT /payments/reject/{id}
    // ───────────────────────────────────────────────
    async rejectPayment(paymentId) {
      this.processing = true;
      try {
        const payload = {};
        if (this.rejectForm.reason) {
          payload.reason = this.rejectForm.reason;
        }

        const response = await api.put(
          `/payments/reject/${paymentId}`,
          payload,
        );

        // Update local state
        const idx = this.payments.findIndex((p) => p.id === paymentId);
        if (idx !== -1) {
          const updated = response.data.data || response.data;
          this.payments[idx] = {
            ...this.payments[idx],
            ...updated,
            status: "rejected",
          };
        }

        // Update selected payment if it's open in modal
        if (this.selectedPayment?.id === paymentId) {
          this.selectedPayment.status = "rejected";
          this.selectedPayment.rejection_reason = this.rejectForm.reason;
        }

        this.showToast("Payment rejected successfully");
        this.closeRejectModal();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to reject payment");
        return false;
      } finally {
        this.processing = false;
      }
    },

    // ───────────────────────────────────────────────
    // 5. FETCH PAYMENT DETAILS
    //    GET /payments/{id}
    // ───────────────────────────────────────────────
    async fetchPaymentDetails(id) {
      this.loading = true;
      try {
        const response = await api.get(`/payments/${id}`);
        this.selectedPayment = response.data.data || response.data;
        return this.selectedPayment;
      } catch (err) {
        this.handleError(err, "Failed to load payment details");
        return null;
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // Modal helpers
    // ───────────────────────────────────────────────
    openDetailModal(payment) {
      this.selectedPayment = { ...payment };
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedPayment = null;
    },

    openRejectModal(payment) {
      this.selectedPayment = { ...payment };
      this.rejectForm.reason = "";
      this.showRejectModal = true;
    },

    closeRejectModal() {
      this.showRejectModal = false;
      this.selectedPayment = null;
      this.rejectForm.reason = "";
    },

    // ───────────────────────────────────────────────
    // Filter & Pagination helpers
    // ───────────────────────────────────────────────
    setFilter(status) {
      this.statusFilter = status;
      this.currentPage = 1;
      this.fetchPayments();
    },

    setPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchPayments();
    },

    // ───────────────────────────────────────────────
    // Centralized error handler
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const message = err.response?.data?.message || fallbackMessage;

      // Note: 401 errors are handled by the axios interceptor
      if (status === 403) {
        this.showToast("You don't have permission for this action.", "error");
        return;
      }

      if (status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        this.showToast(firstError || message, "error");
        return;
      }

      this.showToast(message, "error");
    },
  },
});
