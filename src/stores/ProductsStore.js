import { defineStore } from "pinia";
import api from "@/api/api.js";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    product: null,
    selectedProductId: null,
    categories: [],

    loading: false,
    detailLoading: false,
    saving: false,
    deleting: false,
    categoryLoading: false,
    categorySaving: false,
    categoryDeleting: false,

    showFormModal: false,
    showDetailModal: false,
    showCategoryModal: false,
    isEditMode: false,
    isCategoryEditMode: false,

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

    categoryForm: {
      name: "",
      description: "",
      image: null,
    },

    searchQuery: "",
    currentPage: 1,
    perPage: 6,
    total: 0,
    lastPage: 1,
    totalValue: 0,

    toast: { show: false, message: "", type: "success" },
  }),

  getters: {
    resolveProductImage: (state) => (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
        return imagePath;
      if (imagePath.startsWith("/"))
        return import.meta.env.VITE_BASE_URL + imagePath;
      return import.meta.env.VITE_BASE_URL + "/" + imagePath;
    },
  },

  actions: {
    // ───────────── CATEGORY ACTIONS ─────────────
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
        if (this.categoryForm.image)
          formData.append("image", this.categoryForm.image);
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
        if (this.categoryForm.image)
          formData.append("image", this.categoryForm.image);
        const response = await api.post(`/categories/${id}`, formData);
        const idx = this.categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.categories[idx] = {
            ...this.categories[idx],
            ...(response.data.data || response.data),
          };
        }
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

    openCreateCategoryModal() {
      this.isCategoryEditMode = false;
      this.resetCategoryForm();
      this.showCategoryModal = true;
    },
    openEditCategoryModal(category) {
      this.isCategoryEditMode = true;
      this.categoryForm = {
        name: category.name || "",
        description: category.description || "",
        image: null,
      };
      this.showCategoryModal = true;
    },
    closeCategoryModal() {
      this.showCategoryModal = false;
      this.resetCategoryForm();
    },
    resetCategoryForm() {
      this.categoryForm = { name: "", description: "", image: null };
    },

    // ───────────── PRODUCT ACTIONS ─────────────
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
        if (payload.result && payload.data) {
          this.products = payload.data;
          if (payload.paginate) {
            this.total = payload.paginate.total;
            this.lastPage = payload.paginate.last_page;
            this.currentPage = payload.paginate.current_page;
          } else {
            this.total = payload.data.length;
            this.lastPage = 1;
          }
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

    async fetchTotalValue() {
      try {
        const response = await api.get("/products", {
          params: { per_page: 2000 },
        });
        const payload = response.data;
        if (payload.result && payload.data) {
          this.totalValue = payload.data.reduce(
            (sum, prod) => sum + (parseFloat(prod.price) || 0),
            0,
          );
        }
      } catch (err) {
        console.error("Failed to calculate total value:", err);
      }
    },

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

    saveProduct() {
      return this.isEditMode
        ? this.updateProduct(this.selectedProductId)
        : this.createProduct();
    },
    
    async createProduct() {
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("detail", this.form.detail || "");
        formData.append("condition", this.form.condition);
        formData.append("story", this.form.story || "");
        formData.append("price", this.form.price);
        formData.append(
          "category_ids",
          JSON.stringify([Number(this.form.category_ids[0])]), // ✅ match backend
        );
        if (this.form.image instanceof File) {
          formData.append("image", this.form.image);
        }

        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.showToast("Product created successfully");
        this.closeFormModal();
        await this.fetchProducts(); // ✅ refresh from server
        await this.fetchTotalValue();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to create product");
        return false;
      } finally {
        this.saving = false;
      }
    },
    
    async deleteProduct(id) {
      this.deleting = true;
      try {
        const response = await api.delete(`/products/${id}`);

        // ✅ Check if backend returned result: false
        if (response.data.result === false) {
          this.showToast(
            response.data.message || "Failed to delete product",
            "error",
          );
          return false;
        }

        this.showToast("Product deleted successfully");
        await this.fetchProducts();
        await this.fetchTotalValue();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to delete product");
        return false;
      } finally {
        this.deleting = false;
      }
    },

    async updateProduct(id) {
      if (!id) return false;
      this.saving = true;
      try {
        const formData = new FormData();
        formData.append("title", this.form.title);
        formData.append("price", this.form.price);
        formData.append("condition", this.form.condition);
        formData.append("description", this.form.description);
        formData.append("detail", this.form.detail || "");
        formData.append("story", this.form.story || "");
        formData.append(
          "category_ids",
          JSON.stringify([Number(this.form.category_ids[0])]),
        );
        if (this.form.image instanceof File) {
          formData.append("image", this.form.image);
        }

        const response = await api.post(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // ✅ Check if backend returned result: false
        if (response.data.result === false) {
          this.showToast(
            response.data.message || "Failed to update product",
            "error",
          );
          return false;
        }

        this.showToast("Product updated successfully");
        this.closeFormModal();
        await this.fetchProducts();
        await this.fetchTotalValue();
        return true;
      } catch (err) {
        this.handleError(err, "Failed to update product");
        return false;
      } finally {
        this.saving = false;
      }
    },
    openCreateModal() {
      this.isEditMode = false;
      this.selectedProductId = null;
      this.resetForm();
      this.showFormModal = true;
    },

    openEditModal(product) {
      this.isEditMode = true;
      this.selectedProductId = product.id;
      // ⬅️ ការកែសម្រួលទិន្នន័យចាស់ដើមកពីតារាងលើទៅលើក្នុង Form
      this.form = {
        title: product.title || "",
        description: product.description || "",
        detail: product.detail || "",
        condition: product.condition || "new",
        story: product.story || "",
        price: product.price || "",
        image: null, // មិនត្រូវបញ្ជូររូបភាពចាស់ ពីព្រោះ User គួរចុចថ្មីថ្មីថ្មី
        category_ids: product.categories
          ? product.categories.map((c) => c.id)
          : [],
      };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.selectedProductId = null;
      this.resetForm();
    },
    openDetailModal(product) {
      this.product = product;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.product = null;
    },
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
      };
    },
    setSearchQuery(q) {
      this.searchQuery = q;
    },
    setPage(page) {
      this.currentPage = page;
      this.fetchProducts();
    },

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
