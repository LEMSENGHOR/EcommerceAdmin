<template>
  <!-- <AdminLayout pageTitle="ផលិតផល"> -->
    <div class="products-page">
      <!-- Stats Cards (មិនផ្លាស់ប្តូរ) -->
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
                <div class="stat-value fs-4 fw-bold">{{ productsStore.total }}</div>
                <div class="stat-label small text-secondary">Listed Items</div>
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
                <div class="stat-value fs-4 fw-bold">{{ productsStore.categories.length }}</div>
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
                <div class="stat-value fs-4 fw-bold">$ {{ totalValue }}</div>
                <div class="stat-label small text-secondary">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="data-card bg-white border rounded-3 shadow-sm p-4">
        <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap grow">
            <h6 class="m-0 fw-bold">All Products</h6>
            <div class="position-relative grow" style="max-width: 300px">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
              <input type="text" class="form-control ps-5" style="border-radius: 8px" placeholder="Search products..." v-model="searchQuery" @input="handleSearch" />
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="refreshData" :disabled="productsStore.loading">
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': productsStore.loading }"></i>
            </button>
            <button class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="productsStore.openCreateModal">
              <i class="bi bi-plus-lg"></i> Add Product
            </button>
          </div>
        </div>

        <!-- ⬅️⬅️⬅️ ការប្រើប្រាស់ BaseTable ថ្មីជំនួស Table ចាស់ ⬅️⬅️⬅️ -->
        <BaseTable
          :columns="tableColumns"
          :rows="productsStore.products"
          :loading="productsStore.loading"
          empty-message="No products found"
          :current-page="productsStore.currentPage"
          :last-page="productsStore.lastPage"
          :total-items="productsStore.total"
          :per-page="6"
          @change-page="handlePageChange"
        >
          <!-- Slot: ជួរឈរ Product (រូបភាព + ចំណងជើង) -->
          <template #cell(title)="{ row }">
            <div class="d-flex align-items-center">
              <div class="product-thumbnail bg-light rounded-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px">
                <img v-if="row.image" :src="productsStore.resolveProductImage(row.image)" :alt="row.title" class="rounded-2" style="width: 100%; height: 100%; object-fit: cover" @error="handleImageError" />
                <i v-else class="bi bi-image text-muted"></i>
              </div>
              <div>
                <div class="fw-semibold text-dark">{{ row.title }}</div>
                <div class="text-secondary small text-truncate" style="max-width: 200px">{{ row.description }}</div>
              </div>
            </div>
          </template>

          <!-- Slot: ជួរឈរ Creator -->
          <template #cell(creator)="{ row }">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-circle rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center fw-bold me-2" style="width: 24px; height: 24px; font-size: 10px">
                {{ getCreatorInitial(row.creator) }}
              </div>
              <span class="small">{{ row.creator?.name }}</span>
            </div>
          </template>

          <!-- Slot: ជួរឈរ Category -->
          <template #cell(categories)="{ row }">
            <span class="badge bg-light text-secondary border">{{ getCategoryName(row.categories) }}</span>
          </template>

          <!-- Slot: ជួរឈរ Price -->
          <template #cell(price)="{ row }">
            <div class="fw-semibold text-primary">$ {{ parseFloat(row.price).toFixed(2) }}</div>
          </template>

          <!-- Slot: ជួរឈរ Condition -->
          <template #cell(condition)="{ row }">
            <span class="badge bg-info text-white">{{ row.condition }}</span>
          </template>

          <!-- Slot: ជួរឈរ Actions -->
          <template #cell(actions)="{ row }">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon" @click="openDetailModal(row)">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon" @click="productsStore.openEditModal(row)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon" @click="deleteProduct(row.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </template>
        </BaseTable>

      </div>
    </div>

    <!-- Modals (រក្សាទុកដូចដើម គ្មានការផ្លាស់ប្តូរ) -->
    <!-- Add / Edit Product Modal -->
    <div class="modal-overlay fade show d-flex align-items-center justify-content-center" v-if="productsStore.showFormModal" @click.self="productsStore.closeFormModal">
      <div class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">{{ productsStore.isEditMode ? "Edit" : "Add New" }} Product</h5>
          <button type="button" class="btn-close" @click="productsStore.closeFormModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Product Name *</label>
                <input type="text" class="form-control" v-model="productsStore.form.title" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Category *</label>
                <select class="form-select" v-model="selectedCategoryId" required>
                  <option value="" disabled selected>Select Category</option>
                  <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Price ($) *</label>
                <input type="number" step="0.01" class="form-control" v-model="productsStore.form.price" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold text-secondary small">Condition</label>
                <select class="form-select" v-model="productsStore.form.condition">
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Super Old">Super Old</option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Description *</label>
                <textarea class="form-control" v-model="productsStore.form.description" rows="2" required></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Detail</label>
                <textarea class="form-control" v-model="productsStore.form.detail" rows="2"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Story</label>
                <textarea class="form-control" v-model="productsStore.form.story" rows="2"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Product Image</label>
                <div class="d-flex gap-3 align-items-start">
                  <input type="file" class="form-control grow" @change="handleFileUpload" accept="image/*" />
                  <div v-if="imagePreview" class="preview-container">
                    <img :src="imagePreview" alt="Preview" class="rounded-3 object-fit-cover border" style="width: 100px; height: 100px" />
                    <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0" style="width: 24px; height: 24px; padding: 0" @click="removeImage">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light fw-semibold rounded-2" @click="productsStore.closeFormModal">Cancel</button>
              <button type="submit" class="btn btn-primary fw-semibold rounded-2" :disabled="productsStore.saving">
                <span v-if="!productsStore.saving"><i class="bi bi-save me-1"></i> Save Product</span>
                <span v-else><span class="spinner-border spinner-border-sm me-1"></span> Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Product Detail Modal -->
    <div class="modal-overlay fade show d-flex align-items-center justify-content-center" v-if="productsStore.showDetailModal" @click.self="productsStore.closeDetailModal">
      <div class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Product Details</h5>
          <button type="button" class="btn-close" @click="productsStore.closeDetailModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <div v-if="productsStore.detailLoading" class="text-center py-5"><div class="spinner-border"></div></div>
          <div v-else-if="productsStore.product" class="row">
            <div class="col-md-4 mb-4">
              <div class="product-image-view bg-light rounded-3 p-3">
                <img v-if="productsStore.product.image" :src="productsStore.resolveProductImage(productsStore.product.image)" class="w-100 rounded-2" style="object-fit: cover; max-height: 300px" />
                <div v-else class="text-center py-5"><i class="bi bi-image text-muted fs-1"></i></div>
              </div>
            </div>
            <div class="col-md-8">
              <h4 class="fw-bold mb-3">{{ productsStore.product.title }}</h4>
              <div class="mb-3"><span class="badge bg-info text-white">{{ productsStore.product.condition }}</span></div>
              <div class="row mb-3">
                <div class="col-6">
                  <div class="text-secondary small">Price</div>
                  <div class="fs-4 fw-bold text-primary">${{ parseFloat(productsStore.product.price).toFixed(2) }}</div>
                </div>
              </div>
              <div v-if="productsStore.product.creator" class="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-2">
                <div class="avatar-circle rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center fw-bold" style="width: 30px; height: 30px">
                  {{ getCreatorInitial(productsStore.product.creator) }}
                </div>
                <div>
                  <div class="small text-secondary">Created by</div>
                  <div class="fw-semibold text-dark">{{ productsStore.product.creator.name }}</div>
                </div>
              </div>
              <div class="mb-3">
                <div class="text-secondary small">Category</div>
                <div class="fw-semibold">{{ getCategoryName(productsStore.product.categories) }}</div>
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
                <p class="text-muted fst-italic">"{{ productsStore.product.story }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay fade show d-flex align-items-center justify-content-center" v-if="showDeleteModal" @click.self="closeDeleteModal">
      <div class="modal-custom modal-sm-custom bg-white rounded-4 shadow p-4">
        <div class="text-center">
          <div class="delete-icon-wrap mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger">
            <i class="bi bi-trash fs-4"></i>
          </div>
          <h6 class="fw-bold mb-2">Delete Product?</h6>
          <p class="text-secondary small">This action cannot be undone. Are you sure?</p>
          <div class="d-flex gap-2 justify-content-center mt-4">
            <button class="btn btn-light fw-semibold rounded-2 flex-fill" @click="closeDeleteModal">Cancel</button>
            <button class="btn btn-danger text-white fw-semibold rounded-2 flex-fill" @click="confirmDelete" :disabled="productsStore.deleting">
              <span v-if="!productsStore.deleting">Delete</span>
              <span v-else><span class="spinner-border spinner-border-sm"></span></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Component -->
    <div class="toast-container position-fixed top-0 end-0 p-3" v-if="productsStore.toast.show" style="z-index: 1060">
      <div class="toast show align-items-center text-white border-0" :class="productsStore.toast.type === 'success' ? 'bg-success' : 'bg-danger'" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi" :class="productsStore.toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
            {{ productsStore.toast.message }}
          </div>
        </div>
      </div>
    </div>
  <!-- </AdminLayout> -->
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProductsStore } from "../stores/ProductsStore";
import AdminLayout from "@/layouts/AdminLayout.vue";
// ⬅️ នាំចូល Component BaseTable ដែលបានបង្កើតពីមុន
import BaseTable from "@/components/BaseTable.vue"; // សូមប្តូរ path តាមទីតាំងពិតប្រាកដ

const productsStore = useProductsStore();

const searchQuery = ref("");
const selectedCategoryId = ref(null);
const imagePreview = ref(null);
const showDeleteModal = ref(false);
const deleteId = ref(null);

// ⬅️ កំណត់ជួរឈរសម្រាប់ BaseTable
const tableColumns = [
  { key: 'title', label: 'Product', align: 'start' },
  { key: 'creator', label: 'Creator' },
  { key: 'categories', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'condition', label: 'Condition' },
  { key: 'actions', label: 'Actions' }
];

// Computed: Grand Total Value from Store
const totalValue = computed(() => {
  return (productsStore.totalValue || 0).toFixed(2);
});

watch(
  () => productsStore.showFormModal,
  (isOpen) => {
    if (isOpen && productsStore.isEditMode) {
      selectedCategoryId.value = productsStore.form.category_ids[0] ?? null;
      imagePreview.value = null;
    } else if (!isOpen) {
      selectedCategoryId.value = null;
      imagePreview.value = null;
    }
  },
);

// ⬅️ លុប `visiblePages` ចោលព្រោះឥឡូវត្រូវបានគ្រប់គ្រងដោយ BaseTable ដោយស្វ័យប្រវត្តិហើយ

// Methods
const refreshData = async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories(),
    productsStore.fetchTotalValue(),
  ]);
};

const handleSearch = () => {
  productsStore.setSearchQuery(searchQuery.value);
  productsStore.fetchProducts();
};

// ⬅️ មុខងារថ្មីសម្រាប់បញ្ជូនព្រឹត្តិការណ៍ចុចទំព័រពី BaseTable ទៅ Store
const handlePageChange = (page) => {
  productsStore.setPage(page);
};

const getCategoryName = (cats) => {
  if (!cats || !Array.isArray(cats) || cats.length === 0) return "Uncategorized";
  return cats.map((c) => c.name).join(", ");
};

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
    selectedCategoryId.value = null;
    await productsStore.fetchTotalValue();
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
  animation: fadeIn 0.2s ease;
}
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
.modal-body-custom {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
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
.stat-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.spin-animation {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>