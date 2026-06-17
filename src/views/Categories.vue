<template>
  <AdminLayout pageTitle="Categories">
    <div class="categories-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-tags fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.total }}</div>
                <div class="stat-label small text-secondary">Total Categories</div>
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
                <div class="stat-value fs-4 fw-bold">{{ store.activeCount }}</div>
                <div class="stat-label small text-secondary">Active Categories</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-box-seam fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ totalProducts }}</div>
                <div class="stat-label small text-secondary">Products</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px">
                <i class="bi bi-diagram-3 fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.inactiveCount }}</div>
                <div class="stat-label small text-secondary">Inactive</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="data-card bg-white border rounded-3 shadow-sm p-4">
        <!-- Header -->
        <div
          class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
        >
          <div class="d-flex align-items-center gap-3 flex-wrap grow">
            <h6 class="m-0 fw-bold">Categories</h6>
            <div class="position-relative grow" style="max-width: 300px;">
              <i
                class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"
              ></i>
              <input
                type="text"
                class="form-control ps-5"
                style="border-radius: 8px;"
                placeholder="Search categories..."
                :value="store.searchQuery"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="refreshData"
              :disabled="store.loading"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': store.loading }"></i>
            </button>
            <button
              class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
              @click="store.openCreateModal()"
            >
              <i class="bi bi-plus-lg"></i> Add Category
            </button>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="d-flex gap-2 mb-3">
          <button
            class="btn btn-sm"
            :class="viewMode === 'list' ? 'btn-primary' : 'btn-light'"
            @click="viewMode = 'list'"
          >
            <i class="bi bi-list-ul"></i>
          </button>
          <button
            class="btn btn-sm"
            :class="viewMode === 'grid' ? 'btn-primary' : 'btn-light'"
            @click="viewMode = 'grid'"
          >
            <i class="bi bi-grid"></i>
          </button>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="small text-uppercase text-secondary fw-bold" width="50">
                  <input type="checkbox" class="form-check-input" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th class="small text-uppercase text-secondary fw-bold">Category</th>
                <th class="small text-uppercase text-secondary fw-bold">Description</th>
                <th class="small text-uppercase text-secondary fw-bold">Parent</th>
                <th class="small text-uppercase text-secondary fw-bold">Products</th>
                <th class="small text-uppercase text-secondary fw-bold">Status</th>
                <th class="small text-uppercase text-secondary fw-bold">Created</th>
                <th class="small text-uppercase text-secondary fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="store.loading">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div> Loading categories...
                </td>
              </tr>
              <!-- Empty -->
              <tr v-else-if="!store.filteredCategories.length">
                <td colspan="8" class="text-center text-secondary py-5">
                  <div class="text-muted mb-2">
                    <i class="bi bi-tags fs-1"></i>
                  </div>
                  <span class="text-secondary fw-bold">No categories found</span>
                </td>
              </tr>
              <!-- Rows -->
              <tr
                v-else
                v-for="(category) in paginatedCategories"
                :key="category.id"
                :class="{ 'table-primary': selectedCategories.includes(category.id) }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    v-model="selectedCategories" 
                    :value="category.id"
                  >
                </td>
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div
                      class="cat-icon-box bg-primary bg-opacity-10 text-primary rounded-2 d-flex align-items-center justify-content-center"
                    >
                      <i :class="category.icon || 'bi-folder'"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ category.name }}</div>
                      <div v-if="category.parent_id" class="text-muted small">
                        <i class="bi bi-diagram-2"></i> Subcategory
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-secondary small" style="max-width: 250px;">
                  <div class="text-truncate">{{ category.description || "—" }}</div>
                </td>
                <td>
                  <span v-if="category.parent_id" class="badge bg-light text-secondary">
                    {{ getParentName(category.parent_id) }}
                  </span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <span class="badge bg-primary">{{ category.products_count || 0 }}</span>
                </td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="getStatusBadge(category.status)"
                  >
                    {{ category.status || "active" }}
                  </span>
                </td>
                <td class="text-secondary small">
                  {{ formatDate(category.created_at) }}
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                      @click="openViewModal(category)"
                      title="View"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon"
                      @click="store.openEditModal(category)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                      @click="confirmDelete(category)"
                      title="Delete"
                      :disabled="store.deleting"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Grid View -->
        <div v-else class="row g-3">
          <!-- Loading Grid -->
          <div v-if="store.loading" class="col-12 text-center text-secondary py-5">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div> Loading categories...
          </div>
          <!-- Empty Grid -->
          <div v-else-if="!store.filteredCategories.length" class="col-12 text-center text-secondary py-5">
            <div class="text-muted mb-2">
              <i class="bi bi-tags fs-1"></i>
            </div>
            <span class="text-secondary fw-bold">No categories found</span>
          </div>
          <!-- Category Cards -->
          <div
            v-else
            v-for="category in paginatedCategories"
            :key="category.id"
            class="col-md-6 col-lg-4 col-xl-3"
          >
            <div class="category-card h-100 border rounded-3 p-3 hover-shadow">
              <div class="d-flex align-items-start gap-3">
                <div
                  class="cat-icon-box bg-primary bg-opacity-10 text-primary rounded-2 d-flex align-items-center justify-content-center shrink-0"
                >
                  <i :class="category.icon || 'bi-folder'"></i>
                </div>
                <div class="grow min-width-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="fw-semibold mb-1 text-truncate">{{ category.name }}</h6>
                    <span
                      class="badge rounded-pill"
                      :class="getStatusBadge(category.status)"
                    >
                      {{ category.status }}
                    </span>
                  </div>
                  <p class="text-secondary small text-truncate mb-2">{{ category.description || 'No description' }}</p>
                  <div class="d-flex align-items-center gap-2 small text-muted">
                    <span><i class="bi bi-box-seam"></i> {{ category.products_count || 0 }} products</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-top d-flex justify-content-end gap-2">
                <button
                  class="btn btn-sm btn-outline-secondary border-0 rounded-2"
                  @click="openViewModal(category)"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-primary border-0 rounded-2"
                  @click="store.openEditModal(category)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger border-0 rounded-2"
                  @click="confirmDelete(category)"
                  :disabled="store.deleting"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedCategories.length > 0" class="bulk-actions-bar bg-light border-top p-3 mt-3 rounded-2">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <span class="fw-semibold">{{ selectedCategories.length }} categories selected</span>
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

        <!-- Pagination -->
        <div
          v-if="store.lastPage > 1"
          class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top"
        >
          <small class="text-secondary">
            Page {{ store.currentPage }} of {{ store.lastPage }} ·
            {{ store.total }} categories
          </small>
          <div class="d-flex gap-2">
            <button
              class="btn btn-sm btn-light rounded-2"
              :disabled="store.currentPage === 1"
              @click="store.setPage(store.currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              class="btn btn-sm btn-light rounded-2"
              :disabled="store.currentPage === store.lastPage"
              @click="store.setPage(store.currentPage + 1)"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="store.showFormModal"
      @click.self="store.closeFormModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">
            {{ store.isEditMode ? "Edit Category" : "Add Category" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="store.closeFormModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Category Name *</label>
              <input
                type="text"
                class="form-control"
                v-model="store.form.name"
                placeholder="Enter category name"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Description</label>
              <textarea
                class="form-control"
                v-model="store.form.description"
                placeholder="Enter category description"
                rows="3"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Parent Category</label>
              <select
                class="form-select"
                v-model="store.form.parent_id"
              >
                <option :value="null">None (Top Level)</option>
                <option
                  v-for="cat in availableParentCategories"
                  :key="cat.id"
                  :value="cat.id"
                  :disabled="cat.id === store.selectedCategory?.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Icon</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i :class="store.form.icon || 'bi-folder'"></i>
                </span>
                <select
                  class="form-select"
                  v-model="store.form.icon"
                >
                  <option value="">Select Icon</option>
                  <option value="bi-folder">📁 Folder</option>
                  <option value="bi-box">📦 Box</option>
                  <option value="bi-cpu">💻 CPU</option>
                  <option value="bi-phone">📱 Phone</option>
                  <option value="bi-laptop">💻 Laptop</option>
                  <option value="bi-watch">⌚ Watch</option>
                  <option value="bi-headphones">🎧 Headphones</option>
                  <option value="bi-camera">📷 Camera</option>
                  <option value="bi-car">🚗 Car</option>
                  <option value="bi-house">🏠 House</option>
                  <option value="bi-clothes">👕 Clothes</option>
                  <option value="bi-food">🍔 Food</option>
                  <option value="bi-book">📚 Book</option>
                  <option value="bi-toy">🧸 Toy</option>
                  <option value="bi-gem">💎 Gem</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">Status</label>
              <select
                class="form-select"
                v-model="store.form.status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="store.closeFormModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary fw-semibold rounded-2"
                :disabled="store.saving"
              >
                <span v-if="!store.saving">
                  <i class="bi bi-save me-1"></i>
                  {{ store.isEditMode ? "Update" : "Create" }}
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Category Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showViewModal"
      @click.self="closeViewModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden" style="max-width: 600px;">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Category Details</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeViewModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <div v-if="viewingCategory" class="text-center">
            <div
              class="cat-icon-large bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mx-auto mb-3"
              style="width: 80px; height: 80px; font-size: 32px;"
            >
              <i :class="viewingCategory.icon || 'bi-folder'"></i>
            </div>
            
            <h4 class="fw-bold mb-2">{{ viewingCategory.name }}</h4>
            
            <div class="mb-3">
              <span
                class="badge rounded-pill"
                :class="getStatusBadge(viewingCategory.status)"
              >
                {{ viewingCategory.status }}
              </span>
            </div>
            
            <div class="row mb-3">
              <div class="col-6">
                <div class="text-secondary small">Products</div>
                <div class="fs-5 fw-bold">{{ viewingCategory.products_count || 0 }}</div>
              </div>
              <div class="col-6">
                <div class="text-secondary small">Parent</div>
                <div class="fw-semibold">{{ getParentName(viewingCategory.parent_id) }}</div>
              </div>
            </div>
            
            <div v-if="viewingCategory.description" class="mb-3">
              <div class="text-secondary small">Description</div>
              <p class="text-dark">{{ viewingCategory.description }}</p>
            </div>
            
            <div class="text-muted small">
              <i class="bi bi-calendar"></i> Created: {{ formatDate(viewingCategory.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="deleteTarget"
      @click.self="deleteTarget = null"
    >
      <div
        class="modal-custom bg-white rounded-4 shadow overflow-hidden"
        style="max-width: 400px"
      >
        <div class="p-4 text-center">
          <div class="mb-3 text-danger">
            <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem"></i>
          </div>
          <h5 class="fw-bold mb-2">Delete Category?</h5>
          <p class="text-secondary mb-4">
            Are you sure you want to delete
            <strong>{{ deleteTarget.name }}</strong
            >? This action cannot be undone.
          </p>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-light rounded-2 px-4" @click="deleteTarget = null">
              Cancel
            </button>
            <button
              class="btn btn-danger rounded-2 px-4"
              :disabled="store.deleting"
              @click="handleDelete"
            >
              <span v-if="!store.deleting">
                <i class="bi bi-trash me-1"></i> Delete
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-1"></span>
                Deleting...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      v-if="store.toast.show"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="store.toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i
              class="bi"
              :class="
                store.toast.type === 'success'
                  ? 'bi-check-circle-fill'
                  : 'bi-x-circle-fill'
              "
            ></i>
            {{ store.toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useCategoryStore } from "@/stores/categoryStore";
import AdminLayout from "@/layouts/AdminLayout.vue";

const store = useCategoryStore();
const deleteTarget = ref(null);
const selectedCategories = ref([]);
const selectAll = ref(false);
const viewMode = ref("list");
const showViewModal = ref(false);
const viewingCategory = ref(null);

// Computed
const paginatedCategories = computed(() => {
  return store.filteredCategories;
});

const availableParentCategories = computed(() => {
  // Filter out current category and its children
  return store.categories.filter(cat => 
    cat.id !== store.selectedCategory?.id
  );
});

const totalProducts = computed(() => {
  return store.categories.reduce((sum, cat) => sum + (cat.products_count || 0), 0);
});

// Methods
const getStatusBadge = (status) =>
  status === "active"
    ? "bg-success bg-opacity-10 text-success border border-success-subtle"
    : "bg-danger bg-opacity-10 text-danger border border-danger-subtle";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getParentName = (parentId) => {
  if (!parentId) return "None";
  const parent = store.categories.find(cat => cat.id === parentId);
  return parent ? parent.name : "Unknown";
};

const handleSearch = () => {
  store.setSearchQuery(store.searchQuery);
  store.fetchCategories();
};

const refreshData = async () => {
  await store.fetchCategories();
};

const confirmDelete = (category) => {
  deleteTarget.value = category;
};

const handleDelete = async () => {
  const success = await store.deleteCategory(deleteTarget.value.id);
  if (success) {
    deleteTarget.value = null;
    selectedCategories.value = selectedCategories.value.filter(id => id !== deleteTarget.value.id);
  }
};

const openViewModal = (category) => {
  viewingCategory.value = category;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingCategory.value = null;
};

const handleSave = async () => {
  const success = await store.saveCategory();
  if (success) {
    store.closeFormModal();
    await refreshData();
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedCategories.value = paginatedCategories.value.map(c => c.id);
  } else {
    selectedCategories.value = [];
  }
};

const bulkUpdateStatus = async (status) => {
  // Implement bulk status update
  console.log('Bulk update status:', status, selectedCategories.value);
};

const bulkDelete = async () => {
  // Implement bulk delete
  console.log('Bulk delete:', selectedCategories.value);
};

// Watch for changes
watch(selectedCategories, (newVal) => {
  selectAll.value = newVal.length === paginatedCategories.value.length && paginatedCategories.value.length > 0;
});

onMounted(() => store.fetchCategories());
</script>

<style scoped>
.categories-page {
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

/* Category Card (Grid View) */
.category-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
}

/* Action Buttons */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  transition: transform 0.2s ease-in-out;
}

.btn-action-icon:hover {
  transform: scale(1.1);
}

/* Category Icon */
.cat-icon-box {
  width: 40px;
  height: 40px;
  font-size: 18px;
  transition: transform 0.2s ease-in-out;
}

.cat-icon-large {
  transition: transform 0.2s ease-in-out;
}

.cat-icon-box:hover, .cat-icon-large:hover {
  transform: scale(1.1);
}

/* Table Styles */
.table thead th {
  border-bottom: 2px solid #dee2e6;
  background-color: #fafafa;
}

.table tbody tr {
  transition: background-color 0.15s ease-in-out;
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

/* Bulk Actions */
.bulk-actions-bar {
  animation: slideDown 0.3s ease;
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
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .modal-custom {
    max-width: 100%;
    margin: 1rem;
  }
}
</style>