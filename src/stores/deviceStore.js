import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useDeviceStore = defineStore("device", {
  state: () => ({
    // ── Data ──
    devices: [], // នឹងរក្សាទុកទិន្នន័យទាំងអស់ដែលទាញពី API
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
    perPage: 6, // កំណត់ថាចង់បាន ៦ ជួរក្នុងមួយទំព័រ
    total: 0,
    // លុបចេញពីកន្លែងនេះ: lastPage: 1 

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    filteredDevices: (state) => {
      if (!state.searchQuery) return state.devices;
      const q = state.searchQuery.toLowerCase();
      return state.devices.filter(
        (d) =>
          (d.device_name || "").toLowerCase().includes(q) ||
          String(d.device_id || "").toLowerCase().includes(q) ||
          (d.ip || "").toLowerCase().includes(q) ||
          (d.location || "").toLowerCase().includes(q) ||
          (d.browser || "").toLowerCase().includes(q),
      );
    },

    hasDevices: (state) => state.devices.length > 0,

    formattedDevices: (state) => {
      return state.devices.map((d) => ({
        ...d,
        displayType: d.device_type === 1 ? "Browser" : d.device_type === 2 ? "Mobile" : "Other",
      }));
    },

    // ⬅️ ថ្មី: គណនាចំនួនទំព័រសរុប
    totalPages: (state) => {
      return Math.ceil(state.filteredDevices.length / state.perPage) || 1;
    },

    // ⬅️ ថ្មី: កាត់ទិន្នន័យយកតែ ៦ របស់តាមទំព័របច្ចុប្បន្ន
    paginatedDevices: (state) => {
      const start = (state.currentPage - 1) * state.perPage;
      const end = start + state.perPage;
      return state.filteredDevices.slice(start, end);
    },
  },

  actions: {
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => (this.toast.show = false), 3000);
    },

    // ⬅️ កែសម្រួល: ទាញទិន្នន័យសរុបមកទាំងអស់ មិនបញ្ជូន page/per_page ទៅកាន់ Backend ទេ
    async fetchDevices() {
      this.loading = true;
      try {
        const response = await api.get("/profile/devices"); // លុប params ចេញ
        const payload = response.data;

        if (payload.result && payload.data) {
          this.devices = Array.isArray(payload.data) ? payload.data : [];
        } else if (Array.isArray(payload)) {
          this.devices = payload;
        } else {
          this.devices = [];
        }
        
        // កំណត់ Total ដោយផ្អែកលើទិន្នន័យដែលទាញមកពិតប្រាកដ
        this.total = this.devices.length;
      } catch (err) {
        this.handleError(err, "Failed to load devices");
      } finally {
        this.loading = false;
      }
    },

    async updateDevice(id, payload) {
      this.saving = true;
      try {
        const response = await api.put(`/devices/${id}`, payload);
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

    // ⬅️ កែសម្រួល: បន្ថែមការពិនិត្យថាកុំឲ្យទំព័រនៅឃើញចុងក្រោមមិនមានអ្វីបន្ទាប់ពីលុប
    async deleteDevice(id) {
      this.deleting = true;
      try {
        await api.delete(`/devices/${id}`);
        this.devices = this.devices.filter((d) => d.id !== id);
        
        // បើលុបហើយ ទំព័រចុងក្រោមទម្លាក់ទៅលើទំព័រមុន វានឹងត្រលប់ទៅទំព័រមុនដោយស្វ័យប្រវត្តិ
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }

        this.showToast("Device deleted successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete device");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    openEditModal(device) {
      this.selectedDevice = { ...device };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedDevice = null;
    },

    // ⬅️ លុបចោល setPage ដែលទាក់ទងនឹង API ចេញពីទីនេះ
  },

  // handleError នៅតែដដែគ្មានការផ្លាស់ប្តូរ
  handleError(err, fallbackMessage) {
    const status = err.response?.status;
    const payload = err.response?.data;

    if (status === 422) {
      let errorMsg = null;
      if (payload?.errors) {
        errorMsg = Object.values(payload.errors)[0]?.[0];
      } else if (payload?.data && typeof payload.data === "object") {
        const firstKey = Object.keys(payload.data)[0];
        if (Array.isArray(payload.data[firstKey])) {
          errorMsg = payload.data[firstKey][0];
        }
      }
      this.showToast(errorMsg || payload?.message || fallbackMessage, "error");
      return;
    }

    if (status === 403) {
      this.showToast("You don't have permission for this action.", "error");
      return;
    }

    this.showToast(payload?.message || fallbackMessage, "error");
  },
});