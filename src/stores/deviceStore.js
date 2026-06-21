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
    perPage: 6,
    total: 0,
    lastPage: 1,

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // Updated to match your actual JSON fields (ip, location, device_name)
    filteredDevices: (state) => {
      if (!state.searchQuery) return state.devices;
      const q = state.searchQuery.toLowerCase();
      return state.devices.filter(
        (d) =>
          (d.device_name || "").toLowerCase().includes(q) ||
          String(d.device_id || "")
            .toLowerCase()
            .includes(q) ||
          (d.ip || "").toLowerCase().includes(q) ||
          (d.location || "").toLowerCase().includes(q) ||
          (d.browser || "").toLowerCase().includes(q),
      );
    },

    hasDevices: (state) => state.devices.length > 0,

    // Helper to format device type text
    formattedDevices: (state) => {
      return state.devices.map((d) => ({
        ...d,
        displayType:
          d.device_type === 1
            ? "Browser"
            : d.device_type === 2
              ? "Mobile"
              : "Other",
      }));
    },
  },

  actions: {
    // ───────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => (this.toast.show = false), 3000);
    },

    // ───────────────────────────────────────────────
    // 1. FETCH DEVICES
    //    GET /api/profile/devices?page=1&per_page=20
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

        const payload = response.data;

        // Handle your specific JSON structure
        if (payload.result && payload.data) {
          this.devices = payload.data;

          // FIX: Read pagination from the 'paginate' object
          if (payload.paginate) {
            this.total = payload.paginate.total;
            this.lastPage = payload.paginate.last_page;
            this.currentPage = payload.paginate.current_page;
          } else {
            this.total = payload.data.length;
            this.lastPage = 1;
          }
        } else {
          this.devices = [];
          this.total = 0;
        }
      } catch (err) {
        this.handleError(err, "Failed to load devices");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. UPDATE DEVICE (Optional)
    //    PUT /api/devices/:id
    // ───────────────────────────────────────────────
    async updateDevice(id, payload) {
      this.saving = true;
      try {
        const response = await api.put(`/devices/${id}`, payload);

        // Update local state optimistically
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
    // 3. DELETE DEVICE
    //    DELETE /api/devices/1
    // ───────────────────────────────────────────────
    async deleteDevice(id) {
      this.deleting = true;
      try {
        await api.delete(`/devices/${id}`);

        // Remove from local array
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
    // MODAL HELPERS
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
    // SEARCH & PAGINATION
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
    // ERROR HANDLER (Matches your custom API format)
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const payload = err.response?.data;

      if (status === 422) {
        let errorMsg = null;

        // 1. Standard Laravel: { errors: { name: ["..."] } }
        if (payload?.errors) {
          errorMsg = Object.values(payload.errors)[0]?.[0];
        }
        // 2. Your Custom API: { data: { name: ["..."] } }
        else if (payload?.data && typeof payload.data === "object") {
          const firstKey = Object.keys(payload.data)[0];
          if (Array.isArray(payload.data[firstKey])) {
            errorMsg = payload.data[firstKey][0];
          }
        }

        this.showToast(
          errorMsg || payload?.message || fallbackMessage,
          "error",
        );
        return;
      }

      if (status === 403) {
        this.showToast("You don't have permission for this action.", "error");
        return;
      }

      this.showToast(payload?.message || fallbackMessage, "error");
    },
  },
});
