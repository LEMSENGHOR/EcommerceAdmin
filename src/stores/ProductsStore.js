import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useProductsStore = defineStore("products", {
  state: () => ({
    // ── Data ──
    products: [],
    selectedProduct: null,

    // ── UI Flags ──
    loading: false,
    saving: false,
    deleting: false,
    uploadingImage: false,

    // ── Modal ──
    showFormModal: false,
    isEditMode: false,

    // ── Form ──
    form: {
      title: "",
      description: "",
      detail: "",
      condition: "new",
      story: "",
      price: "",
      image: null,
      category_ids: [],
      status: "active", // Default status
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
    filteredProducts: (state) => {
      if (!state.searchQuery) return state.products;
      const q = state.searchQuery.toLowerCase();
      return state.products.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.condition || "").toLowerCase().includes(q),
      );
    },

    hasProducts: (state) => state.products.length > 0,
    activeCount: (state) =>
      state.products.filter((p) => (p.status || "active") === "active").length,
    inactiveCount: (state) =>
      state.products.filter((p) => p.status === "inactive").length,

    // Get product by ID
    getProductById: (state) => (id) => {
      return state.products.find((p) => p.id === id);
    },

    // Resolve image URL (handles relative and absolute paths)
    resolveProductImage: (state) => (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
        return imagePath;
      if (imagePath.startsWith("/"))
        return import.meta.env.VITE_BASE_URL + imagePath;
      return imagePath;
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
    // Reset form to defaults
    // ───────────────────────────────────────────────
    resetForm() {
      this.form = {
        title: "",
        description: "",
        detail: "",
        condition: "new",
        story: "",
        price: "",
        image: null,
        category_ids: [],
        status: "active",
      };
    },

    // ───────────────────────────────────────────────
    // 1. FETCH PRODUCTS
    //    GET /products?page=1&per_page=20&search=
    // ───────────────────────────────────────────────
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await api.get("/products", {
          params: {
            page: this.currentPage,
            per_page: this.perPage,
            search: this.searchQuery || undefined,
          },
        });

        const payload = response.data;

        // Support multiple response shapes (Array vs Laravel Pagination Object)
        if (Array.isArray(payload)) {
          this.products = payload;
          this.total = payload.length;
          this.lastPage = 1;
        } else if (payload.data && Array.isArray(payload.data)) {
          this.products = payload.data;
          this.total = payload.total ?? payload.data.length;
          this.lastPage = payload.last_page ?? 1;
          this.currentPage = payload.current_page ?? this.currentPage;
        } else {
          this.products = [];
          this.total = 0;
          this.lastPage = 1;
        }
      } catch (err) {
        this.handleError(err, "Failed to load products");
      } finally {
        this.loading = false;
      }
    },

    // ───────────────────────────────────────────────
    // 2. CREATE PRODUCT
    //    POST /products
    // ───────────────────────────────────────────────
    async createProduct() {
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("detail", this.form.detail);
        formData.append("condition", this.form.condition);
        formData.append("story", this.form.story);
        formData.append("price", this.form.price);
        formData.append("status", this.form.status || "active");

        // Append image if exists
        if (this.form.image) {
          formData.append("image", this.form.image);
        }

        // Append category_ids as array (Laravel standard)
        if (this.form.category_ids && this.form.category_ids.length > 0) {
          this.form.category_ids.forEach((categoryId) => {
            formData.append("category_ids[]", categoryId);
          });
        }

        // Axios automatically sets correct headers for FormData (multipart/form-data)
        const response = await api.post("/products", formData);

        const newProduct = response.data.data || response.data;
        this.products.unshift(newProduct);
        this.showToast("Product created successfully");
        this.showFormModal = false;
        this.resetForm();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to create product");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // ───────────────────────────────────────────────
    // 3. UPDATE PRODUCT
    //    POST /products/{id} (Laravel method spoofing)
    // ───────────────────────────────────────────────
    async updateProduct() {
      if (!this.selectedProduct) return false;

      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT"); // Laravel method spoofing
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("detail", this.form.detail);
        formData.append("condition", this.form.condition);
        formData.append("story", this.form.story);
        formData.append("price", this.form.price);
        formData.append("status", this.form.status || "active");

        // Append image if new one selected
        if (this.form.image) {
          formData.append("image", this.form.image);
        }

        // Append category_ids
        if (this.form.category_ids && this.form.category_ids.length > 0) {
          this.form.category_ids.forEach((categoryId) => {
            formData.append("category_ids[]", categoryId);
          });
        }

        // Axios automatically sets correct headers
        const response = await api.post(
          `/products/${this.selectedProduct.id}`,
          formData,
        );

        // Update local state
        const idx = this.products.findIndex(
          (p) => p.id === this.selectedProduct.id,
        );
        if (idx !== -1) {
          this.products[idx] = {
            ...this.products[idx],
            ...(response.data.data || response.data),
          };
        }

        this.showToast("Product updated successfully");
        this.showFormModal = false;
        this.resetForm();
        this.selectedProduct = null;
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update product");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // ───────────────────────────────────────────────
    // 4. DELETE PRODUCT
    //    DELETE /products/{id}
    // ───────────────────────────────────────────────
    async deleteProduct(id) {
      this.deleting = true;
      try {
        await api.delete(`/products/${id}`);
        this.products = this.products.filter((p) => p.id !== id);
        this.showToast("Product deleted successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete product");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    // ───────────────────────────────────────────────
    // 5. UPLOAD PRODUCT IMAGE SEPARATELY (Optional)
    //    POST /products/{id}/image
    // ───────────────────────────────────────────────
    async uploadProductImage(productId, file) {
      if (!file) return false;

      this.uploadingImage = true;
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post(
          `/products/${productId}/image`,
          formData,
        );

        // Update local state
        const idx = this.products.findIndex((p) => p.id === productId);
        if (idx !== -1) {
          const updated = response.data.data || response.data;
          this.products[idx].image = updated.image;
        }

        this.showToast("Image uploaded successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to upload image");
        return false;
      } finally {
        this.uploadingImage = false;
      }
    },

    // ───────────────────────────────────────────────
    // Unified save (create or update)
    // ───────────────────────────────────────────────
    async saveProduct() {
      return this.isEditMode ? this.updateProduct() : this.createProduct();
    },

    // ───────────────────────────────────────────────
    // Modal helpers
    // ───────────────────────────────────────────────
    openCreateModal() {
      this.isEditMode = false;
      this.selectedProduct = null;
      this.resetForm();
      this.showFormModal = true;
    },

    openEditModal(product) {
      this.isEditMode = true;
      this.selectedProduct = { ...product };
      this.form = {
        title: product.title || "",
        description: product.description || "",
        detail: product.detail || "",
        condition: product.condition || "new",
        story: product.story || "",
        price: product.price || "",
        status: product.status || "active",
        image: null, // Don't set existing image to avoid re-uploading
        category_ids: product.category_ids || [],
      };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedProduct = null;
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
      this.fetchProducts();
    },

    // ───────────────────────────────────────────────
    // Centralized error handler
    // ───────────────────────────────────────────────
    handleError(err, fallbackMessage) {
      const status = err.response?.status;
      const message = err.response?.data?.message || fallbackMessage;

      // Note: 401 errors are handled globally by the axios interceptor in api.js
      if (status === 403) {
        this.showToast("You don't have permission for this action.", "error");
        return;
      }

      // 422 → Validation error
      if (status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        this.showToast(firstError || message, "error");
        return;
      }

      this.showToast(message, "error");
    },
  },
});
