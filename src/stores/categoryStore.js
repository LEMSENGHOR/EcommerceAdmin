import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    // ── Data ──
    categories: [],
    selectedCategory: null,

    // ── UI Flags ──
    loading: false,
    saving: false,
    deleting: false,

    // ── Modal ──
    showFormModal: false,
    isEditMode: false,

    // ── Form ──
    form: {
      name: "",
      description: "",
      status: "active",
      parent_id: null,
    },

    // ── Search & Pagination ──
    searchQuery: "",
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    filteredCategories: (state) => {
      if (!state.searchQuery) return state.categories;
      const q = state.searchQuery.toLowerCase();
      return state.categories.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      );
    },

    hasCategories: (state) => state.categories.length > 0,
    activeCount: (state) =>
      state.categories.filter((c) => (c.status || "active") === "active")
        .length,
    inactiveCount: (state) =>
      state.categories.filter((c) => c.status === "inactive").length,

    // Build tree structure if categories have parent_id
    categoryTree: (state) => {
      const map = new Map();
      const roots = [];

      // First pass: create map
      state.categories.forEach((c) => {
        map.set(c.id, { ...c, children: [] });
      });

      // Second pass: build tree
      state.categories.forEach((c) => {
        const node = map.get(c.id);
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id).children.push(node);
        } else {
          roots.push(node);
        }
      });

      return roots;
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
    // Reset form
    // ───────────────────────────────────────────────
    resetForm() {
      this.form = {
        name: "",
        description: "",
        status: "active",
        parent_id: null,
      };
    },

    // ───────────────────────────────────────────────
    // 1. FETCH CATEGORIES
    //    GET /api/categories
    // ───────────────────────────────────────────────
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get("/api/categories", {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
            search: this.searchQuery || undefined,
          },
        });

        const payload = response.data;

        // Support multiple response shapes
        if (Array.isArray(payload)) {
          this.categories = payload;
          this.total = payload.length;
          this.lastPage = 1;
        } else if (payload.data && Array.isArray(payload.data)) {
          this.categories = payload.data;
          this.total = payload.total ?? payload.data.length;
          this.lastPage = payload.last_page ?? 1;
          this.currentPage = payload.current_page ?? this.currentPage;
        } else {
          this.categories = [];
          this.total = 0;
          this.lastPage = 1;
        }
      } catch (err) {
        this.handleError(err, "Failed to load categories");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. CREATE CATEGORY
    //    POST /api/categories
    // ───────────────────────────────────────────────
    async createCategory() {
      this.saving = true;
      try {
        const response = await api.post("/api/categories", this.form);
        this.categories.unshift(response.data.data || response.data);
        this.showToast("Category created successfully");
        this.showFormModal = false;
        this.resetForm();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to create category");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. UPDATE CATEGORY
    //    PUT /api/categories/{id}
    // ───────────────────────────────────────────────
    async updateCategory() {
      if (!this.selectedCategory) return false;

      this.saving = true;
      try {
        const response = await api.put(
          `/api/categories/${this.selectedCategory.id}`,
          this.form,
        );

        // Update local state
        const idx = this.categories.findIndex(
          (c) => c.id === this.selectedCategory.id,
        );
        if (idx !== -1) {
          this.categories[idx] = {
            ...this.categories[idx],
            ...(response.data.data || response.data),
          };
        }

        this.showToast("Category updated successfully");
        this.showFormModal = false;
        this.resetForm();
        this.selectedCategory = null;
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update category");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // ───────────────────────────────────────────────
    // 4. DELETE CATEGORY
    //    DELETE /api/categories/{id}
    // ───────────────────────────────────────────────
    async deleteCategory(id) {
      this.deleting = true;
      try {
        await api.delete(`/api/categories/${id}`);
        this.categories = this.categories.filter((c) => c.id !== id);
        this.showToast("Category deleted successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete category");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    // ───────────────────────────────────────────────
    // Unified save (create or update)
    // ───────────────────────────────────────────────
    async saveCategory() {
      return this.isEditMode ? this.updateCategory() : this.createCategory();
    },

    // ───────────────────────────────────────────────
    // Modal helpers
    // ───────────────────────────────────────────────
    openCreateModal() {
      this.isEditMode = false;
      this.selectedCategory = null;
      this.resetForm();
      this.showFormModal = true;
    },

    openEditModal(category) {
      this.isEditMode = true;
      this.selectedCategory = { ...category };
      this.form = {
        name: category.name || "",
        description: category.description || "",
        status: category.status || "active",
        parent_id: category.parent_id || null,
      };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedCategory = null;
      this.resetForm();
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
      this.fetchCategories();
    },

    // ───────────────────────────────────────────────
    // Centralized error handler (auth-aware)
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const message = err.response?.data?.message || fallbackMessage;

      if (status === 401) {
        this.showToast("Session expired. Please login again.", "error");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return;
      }

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
