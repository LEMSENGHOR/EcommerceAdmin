import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [], // នឹងរក្សាទុកទិន្នន័យទាំងអស់ដែលទាញពី API
    selectedCategory: null,
    allProducts: [],
    loading: false,
    saving: false,
    deleting: false,
    showFormModal: false,
    isEditMode: false,
    form: {
      name: "",
      description: "",
      parent_id: null,
      status: "active",
      icon: null,
      image: null,
    },
    searchQuery: "",
    currentPage: 1,
    perPage: 6, // នៅតែកំណត់ថាចង់បាន ៦ ជួរក្នុងមួយទំព័រ
    total: 0,
    // lastPage: 1, // ⬅️ លុបចេញពីកន្លែងនេះ ពីព្រោះនឹងគណនាពី Getters វិញ
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    // ស្វែងរកតាមពាក្យ (សម្រាប់ទំព័រណាមួយដែលមាន)
    filteredCategories: (state) => {
      if (!state.searchQuery) return state.categories;
      const q = state.searchQuery.toLowerCase();
      return state.categories.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      );
    },

    // ⬅️ ថ្មី: គណនាចំនួនទំព័រសរុប (ឧ. មាន 13 របស់ កំណត់ 6 នោះ = 3 ទំព័រ)
    totalPages: (state) => {
      const totalItems = state.filteredCategories.length;
      return Math.ceil(totalItems / state.perPage) || 1;
    },

    // ⬅️ ថ្មី: កាត់ទិន្នន័យយកតែ ៦ របស់តាមទំព័របច្ចុប្បន្ន
    paginatedCategories: (state) => {
      const start = (state.currentPage - 1) * state.perPage;
      const end = start + state.perPage;
      return state.filteredCategories.slice(start, end);
    },

    hasCategories: (state) => state.categories.length > 0,

    categoryTree: (state) => {
      const map = new Map();
      const roots = [];
      state.categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
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

    getCategoryById: (state) => (id) => state.categories.find((c) => c.id === id),
  },

  actions: {
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => (this.toast.show = false), 3000);
    },

    resetForm() {
      this.form = { name: "", description: "", parent_id: null, status: "active", icon: null, image: null };
    },

    async fetchProductsForCount() {
      try {
        const response = await api.get("/products", { params: { per_page: 100 } });
        let products = [];
        if (response.data.result && response.data.data) {
          products = response.data.data;
        } else if (Array.isArray(response.data)) {
          products = response.data;
        }
        this.allProducts = products;
        this.categories.forEach((cat) => {
          cat.products_count = this.allProducts.filter((p) =>
            p.categories && p.categories.some((c) => c.id === cat.id)
          ).length;
        });
      } catch (err) {
        console.error("Failed to fetch products for counting:", err);
      }
    },

    // ⬅️ កែសម្រួល: ទាញទិន្នន័យសរុបមកទាំងអស់ មិនបញ្ជូន page/per_page ទៅកាន់ Backend ទេ
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get("/categories", {
          params: { 
            search: this.searchQuery || undefined // ផ្ញើតែ Search មកទេ
          },
        });
        const payload = response.data;

        // ទាញមកទាំងអស់ដាក់ចូលក្នុង categories
        if (Array.isArray(payload)) {
          this.categories = payload;
        } else if (payload.result && payload.data) {
          this.categories = Array.isArray(payload.data) ? payload.data : [];
        } else {
          this.categories = [];
        }
        
        // កំណត់ Total ដោយផ្អែកលើទិន្នន័យដែលទាញមកពិតប្រាកដ
        this.total = this.categories.length;

        await this.fetchProductsForCount();
      } catch (err) {
        this.handleError(err, "មានបញ្ហាក្នុងការទាញយកប្រភេទ");
      } finally {
        this.loading = false;
      }
    },

    async createCategory() {
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("status", this.form.status);
        if (this.form.parent_id) formData.append("parent_id", this.form.parent_id);
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.icon) formData.append("icon", this.form.icon);
        const response = await api.post("/categories", formData);
        const newCategory = response.data.data || response.data;
        this.categories.unshift(newCategory);
        this.showToast("បង្កើតប្រភេទដោយជោគជ័យ");
        this.showFormModal = false;
        this.resetForm();
        return true;
      } catch (err) {
        this.handleError(err, "បរាជ័យក្នុងការបង្កើតប្រភេទ");
        return false;
      } finally {
        this.saving = false;
      }
    },

    async updateCategory() {
      if (!this.selectedCategory) return false;
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("status", this.form.status);
        if (this.form.parent_id) formData.append("parent_id", this.form.parent_id);
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.icon) formData.append("icon", this.form.icon);
        const response = await api.post(`/categories/${this.selectedCategory.id}`, formData);
        const idx = this.categories.findIndex((c) => c.id === this.selectedCategory.id);
        if (idx !== -1) {
          this.categories[idx] = { ...this.categories[idx], ...(response.data.data || response.data) };
        }
        this.showToast("កែប្រែប្រភេទដោយជោគជ័យ");
        this.showFormModal = false;
        this.resetForm();
        this.selectedCategory = null;
        return true;
      } catch (err) {
        this.handleError(err, "បរាជ័យក្នុងការកែប្រែប្រភេទ");
        return false;
      } finally {
        this.saving = false;
      }
    },

    async deleteCategory(id) {
      this.deleting = true;
      try {
        await api.delete(`/categories/${id}`);
        this.categories = this.categories.filter((c) => c.id !== id);
        this.showToast("លុបប្រភេទដោយជោគជ័យ");
        return true;
      } catch (err) {
        this.handleError(err, "បរាជ័យក្នុងការលុបប្រភេទ");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    // ⬅️ លុបចោល setPage ដែលទាក់ទងនឹង API ចេញ
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

    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const payload = err.response?.data;
      if (status === 422) {
        let errorMsg = null;
        if (payload?.errors) {
          errorMsg = Object.values(payload.errors)[0]?.[0];
        } else if (payload?.data && typeof payload.data === 'object') {
          const firstKey = Object.keys(payload.data)[0];
          if (Array.isArray(payload.data[firstKey])) {
            errorMsg = payload.data[firstKey][0];
          }
        }
        this.showToast(errorMsg || payload?.message || fallbackMessage, "error");
        return;
      }
      if (status === 403) {
        this.showToast("អ្នកគ្មានសិទ្ធិប្រើប្រាស់សកម្មភាពនេះ។", "error");
        return;
      }
      this.showToast(payload?.message || fallbackMessage, "error");
    },
  },
});