<template>
  <AdminLayout pageTitle="Products">
    <div class="products-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div
                class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
                <i class="bi bi-box-seam fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">
                  {{ productsStore.total }}
                </div>
                <div class="stat-label small text-secondary">
                  Total Products
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div
                class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
                <i class="bi bi-check-circle fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">
                  {{ productsStore.products.length }}
                </div>
                <div class="stat-label small text-secondary">Listed Items</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div
                class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
                <i class="bi bi-tags fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">
                  {{ productsStore.categories.length }}
                </div>
                <div class="stat-label small text-secondary">Categories</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div
                class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
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
        <div
          class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
        >
          <div class="d-flex align-items-center gap-3 flex-wrap grow">
            <h6 class="m-0 fw-bold">All Products</h6>
            <div class="position-relative grow" style="max-width: 300px">
              <i
                class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"
              ></i>
              <input
                type="text"
                class="form-control ps-5"
                style="border-radius: 8px"
                placeholder="Search products..."
                v-model="searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="refreshData"
              :disabled="productsStore.loading"
            >
              <i
                class="bi bi-arrow-clockwise"
                :class="{ 'spin-animation': productsStore.loading }"
              ></i>
            </button>
            <button
              class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="productsStore.openCreateModal"
            >
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
                  Product
                </th>
                <th class="small text-uppercase text-secondary fw-bold">
                  Creator
                </th>
                <th class="small text-uppercase text-secondary fw-bold">
                  Category
                </th>
                <th class="small text-uppercase text-secondary fw-bold">
                  Price
                </th>
                <th class="small text-uppercase text-secondary fw-bold">
                  Condition
                </th>
                <th class="small text-uppercase text-secondary fw-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="productsStore.loading">
                <td colspan="6" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2"></div>
                  Loading products...
                </td>
              </tr>
              <tr v-else-if="productsStore.products.length === 0">
                <td colspan="6" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2">
                    <i class="bi bi-inbox fs-1"></i>
                  </div>
                  <span class="text-secondary fw-bold">No products found</span>
                </td>
              </tr>

              <tr v-else v-for="prod in productsStore.products" :key="prod.id">
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
                      <div
                        class="text-secondary small text-truncate"
                        style="max-width: 200px"
                      >
                        {{ prod.description }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div
                      class="avatar-circle rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center fw-bold me-2"
                      style="width: 24px; height: 24px; font-size: 10px"
                    >
                      {{ getCreatorInitial(prod.creator) }}
                    </div>
                    <span class="small">{{ prod.creator?.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-secondary border">{{
                    getCategoryName(prod.categories)
                  }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-primary">
                    ${{ parseFloat(prod.price).toFixed(2) }}
                  </div>
                </td>
                <td>
                  <span class="badge bg-info text-white">{{
                    prod.condition
                  }}</span>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon"
                      @click="openDetailModal(prod)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                      @click="productsStore.openEditModal(prod)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                      @click="deleteProduct(prod.id)"
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
        <div
          v-if="productsStore.total > productsStore.perPage"
          class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top"
        >
          <div class="text-secondary small">
            Showing
            {{
              productsStore.currentPage * productsStore.perPage -
              productsStore.perPage +
              1
            }}
            to
            {{
              Math.min(
                productsStore.currentPage * productsStore.perPage,
                productsStore.total,
              )
            }}
            of {{ productsStore.total }} products
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li
                class="page-item"
                :class="{ disabled: productsStore.currentPage === 1 }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="
                    productsStore.setPage(productsStore.currentPage - 1)
                  "
                  ><i class="bi bi-chevron-left"></i
                ></a>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: productsStore.currentPage === page }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="productsStore.setPage(page)"
                  >{{ page }}</a
                >
              </li>
              <li
                class="page-item"
                :class="{
                  disabled:
                    productsStore.currentPage === productsStore.lastPage,
                }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="
                    productsStore.setPage(productsStore.currentPage + 1)
                  "
                  ><i class="bi bi-chevron-right"></i
                ></a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Add / Edit Product Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="productsStore.showFormModal"
      @click.self="productsStore.closeFormModal"
    >
      <div
        class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden"
      >
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">
            {{ productsStore.isEditMode ? "Edit" : "Add New" }} Product
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="productsStore.closeFormModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Product Name *</label
                ><input
                  type="text"
                  class="form-control"
                  v-model="productsStore.form.title"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Category *</label
                ><select
                  class="form-select"
                  v-model="selectedCategoryId"
                  required
                >
                  <option value="" disabled selected>Select Category</option>
                  <option
                    v-for="cat in productsStore.categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Price ($) *</label
                ><input
                  type="number"
                  step="0.01"
                  class="form-control"
                  v-model="productsStore.form.price"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Condition</label
                ><select
                  class="form-select"
                  v-model="productsStore.form.condition"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Super Old">Super Old</option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Description *</label
                ><textarea
                  class="form-control"
                  v-model="productsStore.form.description"
                  rows="2"
                  required
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Detail</label
                ><textarea
                  class="form-control"
                  v-model="productsStore.form.detail"
                  rows="2"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Story</label
                ><textarea
                  class="form-control"
                  v-model="productsStore.form.story"
                  rows="2"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small"
                  >Product Image</label
                >
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
                      style="width: 100px; height: 100px"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0"
                      style="width: 24px; height: 24px; padding: 0"
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
                <span v-if="!productsStore.saving"
                  ><i class="bi bi-save me-1"></i> Save Product</span
                >
                <span v-else
                  ><span class="spinner-border spinner-border-sm me-1"></span>
                  Saving...</span
                >
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Product Detail Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="productsStore.showDetailModal"
      @click.self="productsStore.closeDetailModal"
    >
      <div
        class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden"
      >
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Product Details</h5>
          <button
            type="button"
            class="btn-close"
            @click="productsStore.closeDetailModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <div v-if="productsStore.detailLoading" class="text-center py-5">
            <div class="spinner-border"></div>
          </div>
          <div v-else-if="productsStore.product" class="row">
            <div class="col-md-4 mb-4">
              <div class="product-image-view bg-light rounded-3 p-3">
                <img
                  v-if="productsStore.product.image"
                  :src="
                    productsStore.resolveProductImage(
                      productsStore.product.image,
                    )
                  "
                  class="w-100 rounded-2"
                  style="object-fit: cover; max-height: 300px"
                />
                <div v-else class="text-center py-5">
                  <i class="bi bi-image text-muted fs-1"></i>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <h4 class="fw-bold mb-3">{{ productsStore.product.title }}</h4>
              <div class="mb-3">
                <span class="badge bg-info text-white">{{
                  productsStore.product.condition
                }}</span>
              </div>
              <div class="row mb-3">
                <div class="col-6">
                  <div class="text-secondary small">Price</div>
                  <div class="fs-4 fw-bold text-primary">
                    ${{ parseFloat(productsStore.product.price).toFixed(2) }}
                  </div>
                </div>
              </div>
              <div
                v-if="productsStore.product.creator"
                class="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-2"
              >
                <div
                  class="avatar-circle rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center fw-bold"
                  style="width: 30px; height: 30px"
                >
                  {{ getCreatorInitial(productsStore.product.creator) }}
                </div>
                <div>
                  <div class="small text-secondary">Created by</div>
                  <div class="fw-semibold text-dark">
                    {{ productsStore.product.creator.name }}
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="text-secondary small">Category</div>
                <div class="fw-semibold">
                  {{ getCategoryName(productsStore.product.categories) }}
                </div>
              </div>
              <div class="mb-3">
                <div class="text-secondary small">Description</div>
                <p class="text-dark">{{ productsStore.product.description }}</p>
              </div>
              <div v-if="productsStore.product.detail" class="mb-3">
                <div class="text-secondary small">Detail</div>
                <p class="text-muted">{{ productsStore.product.detail }}</p>
              </div>
              <div v-if="productsStore.product.story">
                <div class="text-secondary small">Story</div>
                <p class="text-muted fst-italic">
                  "{{ productsStore.product.story }}"
                </p>
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
          <div
            class="delete-icon-wrap mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger"
          >
            <i class="bi bi-trash fs-4"></i>
          </div>
          <h6 class="fw-bold mb-2">Delete Product?</h6>
          <p class="text-secondary small">
            This action cannot be undone. Are you sure?
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
              @click="confirmDelete"
              :disabled="productsStore.deleting"
            >
              <span v-if="!productsStore.deleting">Delete</span>
              <span v-else
                ><span class="spinner-border spinner-border-sm"></span
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductsStore } from "../stores/ProductsStore"; // Adjust path if needed
import AdminLayout from "@/layouts/AdminLayout.vue";

const productsStore = useProductsStore();

const searchQuery = ref("");
const selectedCategoryId = ref(null);
const imagePreview = ref(null);
const showDeleteModal = ref(false);
const deleteId = ref(null);

// Computed: Grand Total Value from Store
const totalValue = computed(() => {
  return (productsStore.totalValue || 0).toFixed(2);
});

// Computed: Show exactly 8 pages
const visiblePages = computed(() => {
  const total = productsStore.lastPage;
  const current = productsStore.currentPage;
  if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1);
  const allPages = Array.from({ length: total }, (_, i) => i + 1);
  const offset = 4;
  const start = Math.max(0, current - 1 - offset);
  return allPages.slice(start, start + 8);
});

// Methods
const refreshData = async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories(),
    productsStore.fetchTotalValue(), // Fetch Grand Total
  ]);
};

const handleSearch = () => {
  productsStore.setSearchQuery(searchQuery.value);
  productsStore.fetchProducts();
};

const getCategoryName = (cats) =>
  !cats || !Array.isArray(cats)
    ? "Uncategorized"
    : cats.map((c) => c.name).join(", ");
const getCreatorInitial = (creator) =>
  !creator || !creator.name ? "?" : creator.name.charAt(0).toUpperCase();
const handleImageError = (e) => (e.target.style.display = "none");

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    productsStore.form.image = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  productsStore.form.image = null;
  imagePreview.value = null;
};

const openDetailModal = (prod) => {
  productsStore.showDetailModal = true;
  productsStore.fetchProductDetail(prod.id);
};

const deleteProduct = (id) => {
  deleteId.value = id;
  showDeleteModal.value = true;
};
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteId.value = null;
};
const confirmDelete = async () => {
  const success = await productsStore.deleteProduct(deleteId.value);
  if (success) closeDeleteModal();
};

const handleSave = async () => {
  productsStore.form.category_ids = selectedCategoryId.value
    ? [selectedCategoryId.value]
    : [];
  const success = await productsStore.saveProduct();
  if (success) {
    imagePreview.value = null;
    await productsStore.fetchTotalValue(); // Refresh total value after save
  }
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1055;
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Modal Container */
.modal-custom {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideUp 0.3s ease;
}
.modal-lg-custom {
  max-width: 800px;
}
.modal-sm-custom {
  max-width: 400px;
  max-height: auto;
}

/* Scrollable Body */
.modal-body-custom {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
}

/* Sticky Header */
.modal-header-custom {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  position: relative;
  width: 100px;
  height: 100px;
}
.avatar-circle {
  border-radius: 50%;
}
.delete-icon-wrap {
  width: 64px;
  height: 64px;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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
.spin-animation {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
