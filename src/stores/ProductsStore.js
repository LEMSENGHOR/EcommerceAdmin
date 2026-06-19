import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useProductsStore = defineStore("products", {
  state: () => ({
    // ── PRODUCT DATA ──
    products: [],
    product: null,
    selectedProductId: null, // Track ID for editing

    // ── CATEGORY DATA ──
    categories: [],

    // ── UI FLAGS ──
    loading: false,
    detailLoading: false,
    saving: false,
    deleting: false,
    categoryLoading: false,
    categorySaving: false,
    categoryDeleting: false,

    // ── MODALS ──
    showFormModal: false,
    showDetailModal: false,
    showCategoryModal: false,
    isEditMode: false,
    isCategoryEditMode: false,

    // ── FORM (Product) ──
    form: {
      title: "",
      description: "",
      detail: "",
      condition: "new",
      story: "",
      price: "",
      image: null,
      category_ids: [],
    },

    // ── FORM (Category) ──
    categoryForm: {
      name: "",
      description: "",
      image: null,
    },

    // ── Search, Pagination & Totals ──
    searchQuery: "",
    currentPage: 1,
    perPage: 8,
    total: 0,
    lastPage: 1,
    totalValue: 0, // Grand total of ALL products

    // ── Toast ──
    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    resolveProductImage: (state) => (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
      if (imagePath.startsWith("/")) return import.meta.env.VITE_BASE_URL + imagePath;
      return imagePath;
    },
  },

  actions: {
    // ============================================================
    // CATEGORY ACTIONS
    // ============================================================
    async fetchCategories() {
      this.categoryLoading = true;
      try {
        const response = await api.get("/categories");
        const payload = response.data;
        if (payload.result && payload.data) {
          this.categories = payload.data;
        }
      } catch (err) {
        this.handleError(err, "Failed to load categories");
      } finally {
        this.categoryLoading = false;
      }
    },

    async createCategory() {
      this.categorySaving = true;
      try {
        const formData = new FormData();
        formData.append("name", this.categoryForm.name);
        formData.append("description", this.categoryForm.description);
        if (this.categoryForm.image) formData.append("image", this.categoryForm.image);

        const response = await api.post("/categories", formData);
        this.categories.push(response.data.data || response.data);
        this.showToast("Category created successfully");
        this.closeCategoryModal();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to create category");
        return false;
      } finally {
        this.categorySaving = false;
      }
    },

    async updateCategory(id) {
      if (!id) return false;
      this.categorySaving = true;
      try {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", this.categoryForm.name);
        formData.append("description", this.categoryForm.description);
        if (this.categoryForm.image) formData.append("image", this.categoryForm.image);

        const response = await api.post(`/categories/${id}`, formData);
        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) this.categories[idx] = { ...this.categories[idx], ...(response.data.data || response.data) };
        
        this.showToast("Category updated successfully");
        this.closeCategoryModal();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update category");
        return false;
      } finally {
        this.categorySaving = false;
      }
    },

    async deleteCategory(id) {
      this.categoryDeleting = true;
      try {
        await api.delete(`/categories/${id}`);
        this.categories = this.categories.filter((c) => c.id !== id);
        this.showToast("Category deleted successfully");
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete category");
        return false;
      } finally {
        this.categoryDeleting = false;
      }
    },

    openCreateCategoryModal() { this.isCategoryEditMode = false; this.resetCategoryForm(); this.showCategoryModal = true; },
    openEditCategoryModal(category) {
      this.isCategoryEditMode = true;
      this.categoryForm = { name: category.name || "", description: category.description || "", image: null };
      this.showCategoryModal = true;
    },
    closeCategoryModal() { this.showCategoryModal = false; this.resetCategoryForm(); },
    resetCategoryForm() { this.categoryForm = { name: "", description: "", image: null }; },

    // ============================================================
    // PRODUCT ACTIONS
    // ============================================================

    // 1. FETCH PAGINATED PRODUCTS
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await api.get("/products", {
          params: { page: this.currentPage, per_page: this.perPage, search: this.searchQuery || undefined },
        });
        const payload = response.data;
        if (payload.result && payload.data) {
          this.products = payload.data;
          const p = payload.paginate;
          this.total = p.total;
          this.lastPage = p.last_page;
          this.currentPage = p.current_page;
        } else {
          this.products = [];
          this.total = 0;
        }
      } catch (err) {
        this.handleError(err, "Failed to load products");
      } finally {
        this.loading = false;
      }
    },

    // 2. FETCH GRAND TOTAL VALUE (ALL Products)
    async fetchTotalValue() {
      try {
        const response = await api.get("/products", { params: { per_page: 99999 } });
        const payload = response.data;
        if (payload.result && payload.data) {
          this.totalValue = payload.data.reduce((sum, prod) => sum + (parseFloat(prod.price) || 0), 0);
        }
      } catch (err) {
        console.error("Failed to calculate total value:", err);
      }
    },

    // 3. GET DETAIL
    async fetchProductDetail(id) {
      this.detailLoading = true;
      this.product = null;
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data.result) this.product = response.data.data;
      } catch (err) {
        this.handleError(err, "Failed to load product details");
      } finally {
        this.detailLoading = false;
      }
    },

    // 4. SAVE PRODUCT (Create or Update)
    saveProduct() {
      return this.isEditMode ? this.updateProduct(this.selectedProductId) : this.createProduct();
    },

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
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.category_ids?.length) this.form.category_ids.forEach((id) => formData.append("category_ids[]", id));

        const response = await api.post("/products", formData);
        this.products.unshift(response.data.data || response.data);
        this.showToast("Product created successfully");
        this.closeFormModal();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to create product");
        return false;
      } finally {
        this.saving = false;
      }
    },

    // async updateProduct(id) {
    //   if (!id) return false;
    //   this.saving = true;
    //   try {
    //     const formData = new FormData();
    //     formData.append("_method", "PUT");
    //     formData.append("title", this.form.title);
    //     formData.append("description", this.form.description);
    //     formData.append("detail", this.form.detail);
    //     formData.append("condition", this.form.condition);
    //     formData.append("story", this.form.story);
    //     formData.append("price", this.form.price);
    //     if (this.form.image) formData.append("image", this.form.image);
    //     if (this.form.category_ids?.length) this.form.category_ids.forEach((catId) => formData.append("category_ids[]", catId));

    //     const response = await api.post(`/products/${id}`, formData);
    //     const idx = this.products.findIndex((p) => p.id === id);
    //     if (idx !== -1) this.products[idx] = { ...this.products[idx], ...(response.data.data || response.data) };
        
    //     this.showToast("Product updated successfully");
    //     this.closeFormModal();
    //     return true;
    //   } catch (err) {
    //     this.handleError(err, "Failed to update product");
    //     return false;
    //   } finally {
    //     this.saving = false;
    //   }
    // },

    // =================================---------------------
        // ───────────────────────────────────────────────
    // 4. POST UPDATE /api/products/1
    // ───────────────────────────────────────────────
    async updateProduct(id) {
      if (!id) return false;
      this.saving = true;
      try {
        const formData = new FormData();
        
        // Note: NO _method spoofing needed since we use api.put
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("detail", this.form.detail);
        formData.append("condition", this.form.condition);
        formData.append("story", this.form.story);
        formData.append("price", this.form.price);
        
        if (this.form.image) formData.append("image", this.form.image);
        if (this.form.category_ids?.length) this.form.category_ids.forEach((catId) => formData.append("category_ids[]", catId));

        // Use api.put for real PUT request
        const response = await api.put(`/products/${id}`, formData);
        
        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = { ...this.products[idx], ...(response.data.data || response.data) };
        }
        
        this.showToast("Product updated successfully");
        this.closeFormModal();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update product");
        return false;
      } finally {
        this.saving = false;
      }
    },
    //     async updateCategory() {
    //   if (!this.selectedCategory) return false;
    //   this.saving = true;
    //   try {
    //     const formData = new FormData();
        
    //     // REMOVED: formData.append("_method", "PUT");
        
    //     formData.append("name", this.form.name);
    //     formData.append("description", this.form.description);
    //     formData.append("status", this.form.status);
    //     if (this.form.parent_id) formData.append("parent_id", this.form.parent_id);
    //     if (this.form.image) formData.append("image", this.form.image);
    //     if (this.form.icon) formData.append("icon", this.form.icon);

    //     // CHANGED: Use api.put instead of api.post
    //     const response = await api.put(`/categories/${this.selectedCategory.id}`, formData);

    //     const idx = this.categories.findIndex((c) => c.id === this.selectedCategory.id);
    //     if (idx !== -1) {
    //       this.categories[idx] = { ...this.categories[idx], ...(response.data.data || response.data) };
    //     }

    //     this.showToast("Category updated successfully");
    //     this.showCategoryModal = false;
    //     this.resetCategoryForm();
    //     this.selectedCategory = null;
    //     return true;
    //   } catch (err) {
    //     this.handleError(err, "Failed to update category");
    //     return false;
    //   } finally {
    //     this.categorySaving = false;
    //   }
    // },
    // =================================---------------------

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
    // HELPERS & MODALS
    // ───────────────────────────────────────────────
    openCreateModal() { this.isEditMode = false; this.selectedProductId = null; this.resetForm(); this.showFormModal = true; },
    
    openEditModal(product) {
      this.isEditMode = true;
      this.selectedProductId = product.id; // Save ID for update
      this.form = {
        title: product.title || "",
        description: product.description || "",
        detail: product.detail || "",
        condition: product.condition || "new",
        story: product.story || "",
        price: product.price || "",
        image: null,
        category_ids: product.categories ? product.categories.map((c) => c.id) : [],
      };
      this.showFormModal = true;
    },

    closeFormModal() { this.showFormModal = false; this.selectedProductId = null; this.resetForm(); },
    openDetailModal(product) { this.product = product; this.showDetailModal = true; },
    closeDetailModal() { this.showDetailModal = false; this.product = null; },

    resetForm() {
      this.form = { title: "", description: "", detail: "", condition: "new", story: "", price: "", image: null, category_ids: [] };
    },
    setSearchQuery(q) { this.searchQuery = q; },
    setPage(page) { this.currentPage = page; this.fetchProducts(); },

    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => (this.toast.show = false), 3000);
    },
    handleError(err, fallbackMessage) {
      console.error(err);
      this.showToast(err.response?.data?.message || fallbackMessage, "error");
    },
  },
});