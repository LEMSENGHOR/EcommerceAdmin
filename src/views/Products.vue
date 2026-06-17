<template>
  <AdminLayout pageTitle="Products">
    <div class="products-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-box-seam fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ productsStore.total }}</div>
                <div class="stat-label small text-secondary">Total Products</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-check-circle fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ productsStore.activeCount }}</div>
                <div class="stat-label small text-secondary">Active Products</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-tags fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ categories.length }}</div>
                <div class="stat-label small text-secondary">Categories</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-currency-dollar fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">${{ totalValue }}</div>
                <div class="stat-label small text-secondary">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="data-card bg-white border rounded-3 shadow-sm p-4">
        <!-- Header -->
        <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap grow">
            <h6 class="m-0 fw-bold">All Products</h6>
            <!-- Search Input -->
            <div class="position-relative grow" style="max-width: 300px;">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
              <input
                type="text"
                class="form-control ps-5"
                style="border-radius: 8px;"
                placeholder="Search products..."
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <!-- Actions -->
          <div class="d-flex gap-2">
            <button 
              class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2" 
              @click="refreshData"
              :disabled="productsStore.loading"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': productsStore.loading }"></i>
            </button>
            <button class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="openAddModal">
              <i class="bi bi-plus-lg"></i> Add Product
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="small text-uppercase text-secondary fw-bold">
                  <input type="checkbox" class="form-check-input" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th class="small text-uppercase text-secondary fw-bold">Product</th>
                <th class="small text-uppercase text-secondary fw-bold">Category</th>
                <th class="small text-uppercase text-secondary fw-bold">Price</th>
                <th class="small text-uppercase text-secondary fw-bold">Stock</th>
                <th class="small text-uppercase text-secondary fw-bold">Status</th>
                <th class="small text-uppercase text-secondary fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="productsStore.loading">
                <td colspan="7" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div> Loading products...
                </td>
              </tr>
              <!-- Empty State -->
              <tr v-else-if="filteredProducts.length === 0">
                <td colspan="7" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2">
                    <i class="bi bi-inbox fs-1"></i>
                  </div>
                  <span class="text-secondary fw-bold">No products found</span>
                </td>
              </tr>
              <!-- Product Rows --> 
              <tr v-else v-for="(prod) in paginatedProducts" :key="prod.id">
                <td>
                  <input type="checkbox" class="form-check-input" v-model="selectedProducts" :value="prod.id">
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div
                      class="product-thumbnail bg-light rounded-2 me-3 d-flex align-items-center justify-content-center"
                      style="width: 48px; height: 48px"
                    >
                      <img
                        v-if="prod.image"
                        :src="productsStore.resolveProductImage(prod.image)"
                        :alt="prod.title"
                        class="rounded-2"
                        style="width: 100%; height: 100%; object-fit: cover"
                        @error="handleImageError"
                      />
                      <i v-else class="bi bi-image text-muted"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ prod.title }}</div>
                      <div class="text-secondary small text-truncate" style="max-width: 200px;">
                        {{ prod.description?.substring(0, 30) }}...
                      </div>
                      <div class="text-muted small" v-if="prod.sku">
                        SKU: {{ prod.sku }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-secondary border">{{ getCategoryName(prod.category_ids) }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-primary">${{ parseFloat(prod.price).toFixed(2) }}</div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">{{ prod.stock || prod.quantity || 0 }}</span>
                    <span 
                      class="badge rounded-pill"
                      :class="getStockBadgeClass(prod.stock || prod.quantity)"
                    >
                      {{ getStockStatus(prod.stock || prod.quantity) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="getStatusBadgeClass(prod.status)"
                  >
                    {{ prod.status }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon"
                      @click="openViewModal(prod)"
                      title="View"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                      @click="openEditModal(prod)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                      @click="openDeleteModal(prod.id)"
                      title="Delete"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="productsStore.total > productsStore.perPage" class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <div class="text-secondary small">
            Showing {{ productsStore.currentPage * productsStore.perPage - productsStore.perPage + 1 }} to 
            {{ Math.min(productsStore.currentPage * productsStore.perPage, productsStore.total) }} of 
            {{ productsStore.total }} products
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: productsStore.currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="productsStore.setPage(productsStore.currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </a>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item"
                :class="{ active: productsStore.currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="productsStore.setPage(page)">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: productsStore.currentPage === productsStore.lastPage }">
                <a class="page-link" href="#" @click.prevent="productsStore.setPage(productsStore.currentPage + 1)">
                  <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedProducts.length > 0" class="bulk-actions-bar bg-light border-top p-3 mt-3 rounded-2">
          <div class="d-flex align-items-center justify-content-between">
            <span class="fw-semibold">{{ selectedProducts.length }} products selected</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary rounded-2" @click="bulkUpdateStatus('active')">
                <i class="bi bi-check-circle me-1"></i> Activate
              </button>
              <button class="btn btn-sm btn-outline-secondary rounded-2" @click="bulkUpdateStatus('inactive')">
                <i class="bi bi-dash-circle me-1"></i> Deactivate
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-2" @click="bulkDelete">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Product Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="productsStore.showFormModal"
      @click.self="productsStore.closeFormModal"
    >
      <div class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">
            {{ productsStore.isEditMode ? "Edit" : "Add New" }} Product
          </h5>
          <button type="button" class="btn-close" @click="productsStore.closeFormModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Product Name *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="productsStore.form.title"
                  placeholder="Enter product name"
                  required
                />
                <div v-if="errors.title" class="text-danger small mt-1">{{ errors.title }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">SKU</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="productsStore.form.sku"
                  placeholder="Enter SKU"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Category *</label>
                <select
                  class="form-select"
                  v-model="selectedCategoryId"
                  required
                >
                  <option value="" disabled selected>Select Category</option>
                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
                <div v-if="errors.category_id" class="text-danger small mt-1">{{ errors.category_id }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  class="form-control"
                  v-model="productsStore.form.price"
                  placeholder="0.00"
                  required
                />
                <div v-if="errors.price" class="text-danger small mt-1">{{ errors.price }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Stock Quantity</label>
                <input
                  type="number"
                  class="form-control"
                  v-model="productsStore.form.stock"
                  placeholder="0"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Condition</label>
                <select
                  class="form-select"
                  v-model="productsStore.form.condition"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Description *</label>
                <textarea
                  class="form-control"
                  placeholder="Enter product description"
                  v-model="productsStore.form.description"
                  rows="4"
                  required
                ></textarea>
                <div v-if="errors.description" class="text-danger small mt-1">{{ errors.description }}</div>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Story</label>
                <textarea
                  class="form-control"
                  placeholder="Product story (optional)"
                  v-model="productsStore.form.story"
                  rows="3"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Product Image</label>
                <div class="d-flex gap-3 align-items-start">
                  <input
                    type="file"
                    class="form-control grow"
                    @change="handleFileUpload"
                    accept="image/*"
                  />
                  <div v-if="imagePreview" class="preview-container">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      class="rounded-3 object-fit-cover border"
                      style="width: 100px; height: 100px;"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0"
                      style="width: 24px; height: 24px; padding: 0;"
                      @click="removeImage"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="productsStore.closeFormModal"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary fw-semibold rounded-2" 
                :disabled="productsStore.saving"
              >
                <span v-if="!productsStore.saving">
                  <i class="bi bi-save me-1"></i> Save Product
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span> Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Product Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showViewModal"
      @click.self="closeViewModal"
    >
      <div class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Product Details</h5>
          <button type="button" class="btn-close" @click="closeViewModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <div v-if="viewingProduct" class="row">
            <div class="col-md-4 mb-4">
              <div class="product-image-view bg-light rounded-3 p-3">
                <img
                  v-if="viewingProduct.image"
                  :src="productsStore.resolveProductImage(viewingProduct.image)"
                  :alt="viewingProduct.title"
                  class="w-100 rounded-2"
                  style="object-fit: cover; max-height: 300px;"
                />
                <div v-else class="text-center py-5">
                  <i class="bi bi-image text-muted fs-1"></i>
                  <p class="text-muted small mt-2">No image available</p>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <h4 class="fw-bold mb-3">{{ viewingProduct.title }}</h4>
              
              <div class="mb-3">
                <span class="badge rounded-pill" :class="getStatusBadgeClass(viewingProduct.status)">
                  {{ viewingProduct.status }}
                </span>
                <span class="badge rounded-pill bg-info">{{ viewingProduct.condition }}</span>
              </div>
              
              <div class="row mb-3">
                <div class="col-6">
                  <div class="text-secondary small">Price</div>
                  <div class="fs-4 fw-bold text-primary">${{ parseFloat(viewingProduct.price).toFixed(2) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-secondary small">Stock</div>
                  <div class="fs-4 fw-bold">{{ viewingProduct.stock || viewingProduct.quantity || 0 }}</div>
                </div>
              </div>
              
              <div v-if="viewingProduct.sku" class="mb-3">
                <div class="text-secondary small">SKU</div>
                <div class="fw-semibold">{{ viewingProduct.sku }}</div>
              </div>
              
              <div v-if="viewingProduct.category_ids && viewingProduct.category_ids.length">
                <div class="text-secondary small mb-2">Categories</div>
                <div class="d-flex gap-2 flex-wrap mb-3">
                  <span 
                    v-for="catId in viewingProduct.category_ids" 
                    :key="catId"
                    class="badge bg-light text-secondary border"
                  >
                    {{ getCategoryName([catId]) }}
                  </span>
                </div>
              </div>
              
              <div class="mb-3">
                <div class="text-secondary small">Description</div>
                <p class="text-dark">{{ viewingProduct.description }}</p>
              </div>
              
              <div v-if="viewingProduct.story">
                <div class="text-secondary small">Story</div>
                <p class="text-muted">{{ viewingProduct.story }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showDeleteModal"
      @click.self="closeDeleteModal"
    >
      <div class="modal-custom modal-sm-custom bg-white rounded-4 shadow p-4">
        <div class="text-center">
          <div class="delete-icon-wrap mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger">
            <i class="bi bi-trash fs-4"></i>
          </div>
          <h6 class="fw-bold mb-2">Delete Product?</h6>
          <p class="text-secondary small">
            This action cannot be undone. Are you sure you want to delete this product?
          </p>
          <div class="d-flex gap-2 justify-content-center mt-4">
            <button
              class="btn btn-light fw-semibold rounded-2 flex-fill"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              class="btn btn-danger text-white fw-semibold rounded-2 flex-fill"
              @click="handleDelete"
              :disabled="productsStore.deleting"
            >
              <span v-if="!productsStore.deleting">Delete</span>
              <span v-else><span class="spinner-border spinner-border-sm"></span></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProductsStore } from "@/stores/ProductsStore.js";
import { useCategoryStore } from "@/stores/categoryStore.js";
import AdminLayout from "@/layouts/AdminLayout.vue";

// Stores
const productsStore = useProductsStore();
const categoryStore = useCategoryStore();

// State
const categories = ref([]);
const searchQuery = ref("");
const selectedProducts = ref([]);
const selectAll = ref(false);
const selectedCategoryId = ref(null);
const imagePreview = ref(null);
const showDeleteModal = ref(false);
const showViewModal = ref(false);
const viewingProduct = ref(null);
const selectedId = ref(null);
const errors = ref({});

// Computed
const filteredProducts = computed(() => {
  return productsStore.filteredProducts;
});

const paginatedProducts = computed(() => {
  return productsStore.filteredProducts;
});

const totalValue = computed(() => {
  return productsStore.products
    .reduce((sum, prod) => sum + (parseFloat(prod.price) * (prod.stock || prod.quantity || 0)), 0)
    .toFixed(2);
});

const visiblePages = computed(() => {
  const total = productsStore.lastPage;
  const current = productsStore.currentPage;
  const delta = 2;
  
  let pages = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i);
  }
  
  if (current - delta > 1) {
    pages.unshift(1);
    if (current - delta > 2) {
      pages.splice(1, 0, '...');
    }
  }
  
  if (current + delta < total) {
    pages.push(total);
    if (current + delta < total - 1) {
      pages.splice(pages.length - 1, 0, '...');
    }
  }
  
  return pages;
});

// Methods
const loadCategories = async () => {
  try {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.filteredCategories;
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
};

const refreshData = async () => {
  await productsStore.fetchProducts();
};

const handleSearch = () => {
  productsStore.setSearchQuery(searchQuery.value);
  productsStore.fetchProducts();
};

const getCategoryName = (categoryIds) => {
  if (!categoryIds || !Array.isArray(categoryIds)) return "Uncategorized";
  const names = categoryIds.map(id => {
    const category = categories.value.find(c => c.id === id);
    return category ? category.name : "";
  }).filter(Boolean);
  
  return names.length > 0 ? names.slice(0, 2).join(", ") + (names.length > 2 ? "..." : "") : "Uncategorized";
};

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: "bg-success bg-opacity-10 text-success",
    inactive: "bg-secondary bg-opacity-10 text-secondary",
    draft: "bg-warning bg-opacity-10 text-warning",
    pending: "bg-info bg-opacity-10 text-info",
  };
  return statusClasses[status?.toLowerCase()] || "bg-light text-secondary";
};

const getStockBadgeClass = (stock) => {
  if (stock <= 0) return "bg-danger bg-opacity-10 text-danger";
  if (stock <= 10) return "bg-warning bg-opacity-10 text-warning";
  return "bg-success bg-opacity-10 text-success";
};

const getStockStatus = (stock) => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    productsStore.form.image = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  productsStore.form.image = null;
  imagePreview.value = null;
};

const openAddModal = () => {
  productsStore.openCreateModal();
  selectedCategoryId.value = null;
  imagePreview.value = null;
  errors.value = {};
};

const openEditModal = (prod) => {
  productsStore.openEditModal(prod);
  selectedCategoryId.value = prod.category_ids?.[0] || null;
  imagePreview.value = prod.image || null;
  errors.value = {};
};

const openViewModal = (prod) => {
  viewingProduct.value = prod;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingProduct.value = null;
};

const openDeleteModal = (id) => {
  selectedId.value = id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedId.value = null;
};

const handleSave = async () => {
  // Clear previous errors
  errors.value = {};
  
  // Set category_ids in form
  if (selectedCategoryId.value) {
    productsStore.form.category_ids = [selectedCategoryId.value];
  } else {
    productsStore.form.category_ids = [];
  }
  
  const success = await productsStore.saveProduct();
  
  if (success) {
    // Show success message is handled by store
    closeFormModal();
    await refreshData();
  } else {
    // Handle validation errors from store if needed
    errors.value = productsStore.errors || {};
  }
};

const closeFormModal = () => {
  productsStore.closeFormModal();
  imagePreview.value = null;
  errors.value = {};
};

const handleDelete = async () => {
  const success = await productsStore.deleteProduct(selectedId.value);
  if (success) {
    closeDeleteModal();
    selectedProducts.value = selectedProducts.value.filter(id => id !== selectedId.value);
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedProducts.value = paginatedProducts.value.map(p => p.id);
  } else {
    selectedProducts.value = [];
  }
};

const bulkUpdateStatus = async (status) => {
  // Implement bulk status update
  console.log('Bulk update status:', status, selectedProducts.value);
};

const bulkDelete = async () => {
  // Implement bulk delete
  console.log('Bulk delete:', selectedProducts.value);
};

// Watch for changes in selected products
watch(selectedProducts, (newVal) => {
  selectAll.value = newVal.length === paginatedProducts.value.length && paginatedProducts.value.length > 0;
});

// Lifecycle
onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    loadCategories()
  ]);
});
</script>

<style scoped>
.products-page {
  animation: fadeIn 0.3s ease-in-out;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Data Card */
.data-card {
  transition: box-shadow 0.2s ease-in-out;
}

.data-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* Table Styles */
.table thead th {
  border-bottom: 2px solid #dee2e6;
  background-color: #fafafa;
}

.table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

.product-thumbnail {
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.product-thumbnail:hover {
  transform: scale(1.05);
}

/* Action Buttons */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
}

.btn-action-icon:hover {
  transform: scale(1.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-in-out;
}

.modal-custom {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

.modal-lg-custom {
  max-width: 800px;
}

.modal-sm-custom {
  max-width: 400px;
}

/* Form Styles */
.form-control:focus, .form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Image Preview */
.preview-container {
  position: relative;
  width: 100px;
  height: 100px;
}

/* Delete Icon */
.delete-icon-wrap {
  width: 64px;
  height: 64px;
}

/* Bulk Actions */
.bulk-actions-bar {
  animation: slideDown 0.3s ease;
}

/* Pagination */
.pagination .page-link {
  color: #6c757d;
  border: none;
  padding: 0.5rem 0.75rem;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  color: white;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-value {
    font-size: 1.25rem;
  }
  
  .modal-lg-custom {
    max-width: 100%;
    margin: 1rem;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>