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
      parent_id: null,
      status: "active",
      icon: null,
      image: null,
    },

    // ── Search & Pagination ──
    searchQuery: "",
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // Filter categories based on search
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

    // Build tree structure for nested categories
    categoryTree: (state) => {
      const map = new Map();
      const roots = [];

      // First pass: create map of all nodes
      state.categories.forEach((c) => {
        map.set(c.id, { ...c, children: [] });
      });

      // Second pass: link children to parents
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

    // Get category by ID
    getCategoryById: (state) => (id) => {
      return state.categories.find((c) => c.id === id);
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
        parent_id: null,
        status: "active",
        icon: null,
        image: null,
      };
    },

    // ───────────────────────────────────────────────
    // 1. GET CATEGORIES
    //    GET /categories
    // ───────────────────────────────────────────────
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get("/categories", {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
            search: this.searchQuery || undefined,
          },
        });

        const payload = response.data;

        // Support multiple response shapes (Laravel standard vs simple array)
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
    // 2. POST NEW CATEGORY
    //    POST /categories
    // ───────────────────────────────────────────────
    async createCategory() {
      this.saving = true;
      try {
        // Use FormData if uploading images/icons
        let payload;
        let config = {};

        if (this.form.image || this.form.icon) {
          payload = new FormData();
          payload.append("name", this.form.name);
          payload.append("description", this.form.description);
          payload.append("status", this.form.status);
          if (this.form.parent_id)
            payload.append("parent_id", this.form.parent_id);
          if (this.form.image) payload.append("image", this.form.image);
          if (this.form.icon) payload.append("icon", this.form.icon);

          config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
        } else {
          payload = {
            name: this.form.name,
            description: this.form.description,
            parent_id: this.form.parent_id,
            status: this.form.status,
          };
        }

        const response = await api.post("/categories", payload, config);

        const newCategory = response.data.data || response.data;
        this.categories.unshift(newCategory);

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
    // 3. PUT UPDATE CATEGORY
    //    PUT /categories/{id}
    // ───────────────────────────────────────────────
    async updateCategory() {
      if (!this.selectedCategory) return false;

      this.saving = true;
      try {
        let payload;
        let config = {};

        // Use FormData for uploads, otherwise JSON
        if (this.form.image || this.form.icon) {
          payload = new FormData();
          payload.append("_method", "PUT"); // For Laravel support
          payload.append("name", this.form.name);
          payload.append("description", this.form.description);
          payload.append("status", this.form.status);
          if (this.form.parent_id)
            payload.append("parent_id", this.form.parent_id);
          if (this.form.image) payload.append("image", this.form.image);
          if (this.form.icon) payload.append("icon", this.form.icon);

          config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
        } else {
          payload = {
            name: this.form.name,
            description: this.form.description,
            parent_id: this.form.parent_id,
            status: this.form.status,
          };
        }

        const response = await api.post(
          `/categories/${this.selectedCategory.id}`,
          payload,
          config,
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
    //    DELETE /categories/{id}
    // ───────────────────────────────────────────────
    async deleteCategory(id) {
      this.deleting = true;
      try {
        await api.delete(`/categories/${id}`);

        // Remove from local state
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
    // Unified save helper
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
        parent_id: category.parent_id || null,
        status: category.status || "active",
        icon: null, // Don't pre-fill file inputs
        image: null,
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
