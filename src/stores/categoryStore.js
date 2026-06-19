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

      state.categories.forEach((c) => {
        map.set(c.id, { ...c, children: [] });
      });

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

    getCategoryById: (state) => (id) => {
      return state.categories.find((c) => c.id === id);
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
    // 1. GET CATEGORIES (GET /api/categories)
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

        // Handles both Array responses and { result: true, data: [...] } structures
        if (Array.isArray(payload)) {
          this.categories = payload;
          this.total = payload.length;
        } else if (payload.result && payload.data) {
          this.categories = payload.data;
          // Support pagination if provided
          if (payload.paginate) {
            this.total = payload.paginate.total;
            this.lastPage = payload.paginate.last_page;
            this.currentPage = payload.paginate.current_page;
          } else {
            this.total = payload.data.length;
          }
        } else {
          this.categories = [];
          this.total = 0;
        }
      } catch (err) {
        this.handleError(err, "Failed to load categories");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. POST NEW CATEGORY (POST /api/categories)
    // ───────────────────────────────────────────────
    async createCategory() {
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("status", this.form.status);

        if (this.form.parent_id)
          formData.append("parent_id", this.form.parent_id);
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.icon) formData.append("icon", this.form.icon);

        // NO HEADERS PASSED! Axios handles multipart/form-data automatically.
        const response = await api.post("/categories", formData);

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
    // 3. PUT UPDATE CATEGORY (POST /api/categories/1)
    // ───────────────────────────────────────────────
    async updateCategory() {
      if (!this.selectedCategory) return false;

      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT"); // Laravel method spoofing
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("status", this.form.status);

        if (this.form.parent_id)
          formData.append("parent_id", this.form.parent_id);
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.icon) formData.append("icon", this.form.icon);

        // NO HEADERS PASSED!
        const response = await api.post(
          `/categories/${this.selectedCategory.id}`,
          formData,
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
    // 4. DELETE CATEGORY (DELETE /api/categories/1)
    // ───────────────────────────────────────────────
    async deleteCategory(id) {
      this.deleting = true;
      try {
        await api.delete(`/categories/${id}`);
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
    // UNIFIED SAVE & MODAL HELPERS
    // ───────────────────────────────────────────────
    saveCategory() {
      return this.isEditMode ? this.updateCategory() : this.createCategory();
    },

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
        icon: null,
        image: null,
      };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedCategory = null;
      this.resetForm();
    },

    setSearchQuery(q) {
      this.searchQuery = q;
    },

    setPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchCategories();
    },

    // handleError(err, fallbackMessage) {
    //   const status = err.response?.status;
    //   const message = err.response?.data?.message || fallbackMessage;

    //   if (status === 403) {
    //     this.showToast("You don't have permission for this action.", "error");
    //     return;
    //   }

    //   if (status === 422 && err.response?.data?.errors) {
    //     const firstError = Object.values(err.response.data.errors)[0]?.[0];
    //     this.showToast(firstError || message, "error");
    //     return;
    //   }

    //   this.showToast(message, "error");
    // },
        // ───────────────────────────────────────────────
    // Centralized error handler (FIXED FOR YOUR API)
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
        else if (payload?.data && typeof payload.data === 'object') {
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
  },
});
