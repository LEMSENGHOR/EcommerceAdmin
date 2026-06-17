import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useDeviceStore = defineStore("device", {
  state: () => ({
    // ── Data ──
    devices: [],
    selectedDevice: null,

    // ── UI Flags ──
    loading: false,
    saving: false,
    deleting: false,

    // ── Modal ──
    showFormModal: false,

    // ── Search & Pagination ──
    searchQuery: "",
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,

    // ── Toast (shared) ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    filteredDevices: (state) => {
      if (!state.searchQuery) return state.devices;
      const q = state.searchQuery.toLowerCase();
      return state.devices.filter(
        (d) =>
          (d.name || d.device_name || "").toLowerCase().includes(q) ||
          (d.device_id || d.uuid || "").toLowerCase().includes(q) ||
          (d.platform || d.os || "").toLowerCase().includes(q),
      );
    },

    hasDevices: (state) => state.devices.length > 0,
    activeCount: (state) =>
      state.devices.filter((d) => (d.status || "active") === "active").length,
    inactiveCount: (state) =>
      state.devices.filter((d) => d.status === "inactive").length,

    // Device by ID getter
    getDeviceById: (state) => (id) => {
      return state.devices.find((d) => d.id === id);
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
    // 1. FETCH DEVICES
    //    GET /profile/devices?page=1&per_page=20
    // ───────────────────────────────────────────────
    async fetchDevices() {
      this.loading = true;
      try {
        const response = await api.get("/profile/devices", {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
          },
        });

        // Support both paginated & non-paginated responses
        const payload = response.data;
        if (Array.isArray(payload)) {
          this.devices = payload;
          this.total = payload.length;
          this.lastPage = 1;
        } else if (payload.data && Array.isArray(payload.data)) {
          this.devices = payload.data;
          this.total = payload.total ?? payload.data.length;
          this.lastPage = payload.last_page ?? 1;
          this.currentPage = payload.current_page ?? this.currentPage;
        } else {
          this.devices = [];
          this.total = 0;
          this.lastPage = 1;
        }
      } catch (err) {
        this.handleError(err, "Failed to load devices");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. UPDATE DEVICE
    //    PUT /devices/:id
    // ───────────────────────────────────────────────
    async updateDevice(id, payload) {
      this.saving = true;
      try {
        await api.put(`/devices/${id}`, payload);

        // Update local state immediately (optimistic UI)
        const idx = this.devices.findIndex((d) => d.id === id);
        if (idx !== -1) {
          this.devices[idx] = { ...this.devices[idx], ...payload };
        }

        this.showToast("Device updated successfully");
        this.showFormModal = false;
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update device");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. DELETE DEVICE (optional but useful for admin)
    //    DELETE /devices/:id
    // ───────────────────────────────────────────────
    async deleteDevice(id) {
      this.deleting = true;
      try {
        await api.delete(`/devices/${id}`);
        this.devices = this.devices.filter((d) => d.id !== id);
        this.showToast("Device deleted successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete device");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    // ───────────────────────────────────────────────
    // Modal helpers
    // ───────────────────────────────────────────────
    openEditModal(device) {
      this.selectedDevice = { ...device };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedDevice = null;
    },

    // ───────────────────────────────────────────────
    // Search & Pagination
    // ───────────────────────────────────────────────
    setSearchQuery(q) {
      this.searchQuery = q;
    },

    setPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchDevices();
    },

    // ───────────────────────────────────────────────
    // Centralized error handler
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const message = err.response?.data?.message || fallbackMessage;

      // Note: 401 errors are handled by the axios interceptor
      // This focuses on UI error feedback
      if (status === 403) {
        this.showToast("You don't have permission for this action.", "error");
        return;
      }

      // 422 → validation
      if (status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        this.showToast(firstError || message, "error");
        return;
      }

      this.showToast(message, "error");
    },
  },
});
