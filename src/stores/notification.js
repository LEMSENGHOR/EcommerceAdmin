import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    // ── Data ──
    notifications: [],
    selectedNotification: null,

    // ── UI Flags ──
    loading: false,
    markingAsRead: false,
    deleting: false,
    clearing: false,

    // ── Pagination ──
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,

    // ── Filters ──
    statusFilter: "all", // 'all', 'unread', 'read'
    typeFilter: "all", // 'all', 'success', 'error', 'warning', 'info'

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // Filtered notifications
    filteredNotifications: (state) => {
      let notifications = state.notifications;

      // Filter by status
      if (state.statusFilter === "unread") {
        notifications = notifications.filter((n) => !n.read);
      } else if (state.statusFilter === "read") {
        notifications = notifications.filter((n) => n.read);
      }

      // Filter by type
      if (state.typeFilter !== "all") {
        notifications = notifications.filter(
          (n) => n.type === state.typeFilter,
        );
      }

      return notifications;
    },

    // Unread count
    unreadCount: (state) => {
      return state.notifications.filter((n) => !n.read).length;
    },

    // Read count
    readCount: (state) => {
      return state.notifications.filter((n) => n.read).length;
    },

    // Total count
    totalCount: (state) => state.notifications.length,

    // Get notification by ID
    getNotificationById: (state) => (id) => {
      return state.notifications.find((n) => n.id === id);
    },

    // Latest unread
    latestUnread: (state) => {
      return state.notifications.filter((n) => !n.read)[0];
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
    // 1. FETCH NOTIFICATIONS
    //    GET /notifications
    // ───────────────────────────────────────────────
    async fetchNotifications() {
      this.loading = true;
      try {
        const response = await api.get("/notifications", {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
          },
        });

        const payload = response.data;

        // Support multiple response shapes
        if (payload.data && Array.isArray(payload.data)) {
          this.notifications = payload.data;
          this.total = payload.total ?? payload.data.length;
          this.lastPage = payload.last_page ?? 1;
          this.currentPage = payload.current_page ?? this.currentPage;
        } else if (Array.isArray(payload)) {
          this.notifications = payload;
          this.total = payload.length;
          this.lastPage = 1;
        } else {
          this.notifications = [];
          this.total = 0;
          this.lastPage = 1;
        }
      } catch (err) {
        this.handleError(err, "Failed to load notifications");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. MARK AS READ
    //    PUT /notifications/{id}/read
    // ───────────────────────────────────────────────
    async markAsRead(id) {
      try {
        const response = await api.put(`/notifications/${id}/read`);

        // Update local state optimistically
        const notification = this.notifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
          notification.read_at = new Date().toISOString();
        }

        this.showToast("សម្គាល់ថាបានអាន");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to mark as read");
        return false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. DELETE NOTIFICATION
    //    DELETE /notifications/{id}
    // ───────────────────────────────────────────────
    async deleteNotification(id) {
      this.deleting = true;
      try {
        await api.delete(`/notifications/${id}`);

        // Remove from local state
        this.notifications = this.notifications.filter((n) => n.id !== id);

        this.showToast("ការជូនដំណឹងត្រូវបានលុប");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete notification");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    // ───────────────────────────────────────────────
    // 4. MARK ALL AS READ
    //    PUT /notifications/mark-all-read
    // ───────────────────────────────────────────────
    async markAllAsRead() {
      this.markingAsRead = true;
      try {
        await api.put("/notifications/mark-all-read");

        // Update local state
        this.notifications.forEach((notification) => {
          notification.read = true;
          notification.read_at = new Date().toISOString();
        });

        this.showToast("សម្គាល់ការជូនដំណឹងទាំងអស់");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to mark all as read");
        return false;
      } finally {
        this.markingAsRead = false;
      }
    },

    // ───────────────────────────────────────────────
    // 5. CLEAR ALL NOTIFICATIONS
    //    DELETE /notifications/clear-all
    // ───────────────────────────────────────────────
    async clearAllNotifications() {
      this.clearing = true;
      try {
        await api.delete("/notifications/clear-all");

        // Clear local state
        this.notifications = [];
        this.total = 0;
        this.lastPage = 1;
        this.currentPage = 1;

        this.showToast("លុបការជូនដំណឹងទាំងអស់");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to clear notifications");
        return false;
      } finally {
        this.clearing = false;
      }
    },

    // ───────────────────────────────────────────────
    // 6. CREATE NOTIFICATION (for system use)
    //    POST /notifications
    // ───────────────────────────────────────────────
    async createNotification(payload) {
      try {
        const response = await api.post("/notifications", {
          title: payload.title,
          message: payload.message,
          type: payload.type || "info",
          link: payload.link || null,
          data: payload.data || null,
        });

        const newNotification = response.data.data || response.data;
        this.notifications.unshift(newNotification);

        return newNotification;
      } catch (err) {
        this.handleError(err, "Failed to create notification");
        return null;
      }
    },

    // ───────────────────────────────────────────────
    // Filter & Pagination helpers
    // ───────────────────────────────────────────────
    setFilter(status) {
      this.statusFilter = status;
      this.currentPage = 1;
      this.fetchNotifications();
    },

    setTypeFilter(type) {
      this.typeFilter = type;
      this.currentPage = 1;
      this.fetchNotifications();
    },

    setPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchNotifications();
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
