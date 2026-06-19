<template>
  <AdminLayout pageTitle="Categories">
    <div class="categories-page">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4">
            <div class="d-flex align-items-center">
              <div
                class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
                <i class="bi bi-tags fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ store.total }}</div>
                <div class="stat-label small text-secondary">
                  Total Categories
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
                <div class="stat-value fs-4 fw-bold">{{ activeCount }}</div>
                <div class="stat-label small text-secondary">
                  Active Categories
                </div>
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
              <div
                class="stat-icon bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center justify-content-center me-3"
                style="width: 48px; height: 48px"
              >
                <i class="bi bi-x-circle fs-5"></i>
              </div>
              <div>
                <div class="stat-value fs-4 fw-bold">{{ inactiveCount }}</div>
                <div class="stat-label small text-secondary">Inactive</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <!-- Header -->
        <div
          class="card-header d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white p-3 border-bottom"
        >
          <div class="position-relative" style="max-width: 300px">
            <i
              class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"
            ></i>
            <!-- <input type="text" class="form-control ps-5" style="border-radius: 8px;" placeholder="Search categories..." :value="store.searchQuery" @input="handleSearch" /> -->
            <!-- Find this and replace it -->
            <input
              type="text"
              class="form-control ps-5"
              style="border-radius: 8px"
              placeholder="Search categories..."
              v-model="store.searchQuery"
              @input="handleSearch"
            />
          </div>
          <button
            class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
            @click="store.openCreateModal()"
          >
            <i class="bi bi-plus-lg"></i> Add Category
          </button>
        </div>

        <!-- ----------------------------Table =--------------------------->
            <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="small text-uppercase text-secondary fw-bold">Category</th>
                <th class="small text-uppercase text-secondary fw-bold text-center">Products</th>
                <th class="small text-uppercase text-secondary fw-bold text-center">Status</th>
                <th class="small text-uppercase text-secondary fw-bold">Created</th>
                <th class="small text-uppercase text-secondary fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.loading">
                <!-- Changed colspan from 7 to 5 -->
                <td colspan="5" class="text-center text-secondary py-5">
                  <div class="spinner-border spinner-border-sm me-2"></div> Loading categories...
                </td>
              </tr>
              <tr v-else-if="!store.filteredCategories.length">
                <!-- Changed colspan from 7 to 5 -->
                <td colspan="5" class="text-center text-secondary py-5">
                  <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                  No categories found
                </td>
              </tr>
              <tr v-else v-for="cat in store.filteredCategories" :key="cat.id">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="cat-icon-box bg-primary bg-opacity-10 text-primary rounded-2 d-flex align-items-center justify-content-center">
                      <i class="bi bi-folder-fill"></i>
                    </div>
                    <span class="fw-semibold text-dark">{{ cat.name }}</span>
                  </div>
                </td>
                <!-- Removed Description Column -->
                <!-- Removed Parent Column -->
                <td class="text-center">
                  <span class="badge bg-dark bg-opacity-25 text-dark">{{ cat.products_count || 0 }}</span>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill" :class="getStatusBadge(cat.status)">{{ cat.status || 'active' }}</span>
                </td>
                <td class="text-secondary small">{{ formatDate(cat.created_at) }}</td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon" @click="openViewModal(cat)" title="View"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-2 btn-action-icon" @click="store.openEditModal(cat)" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon" @click="confirmDelete(cat)" title="Delete" :disabled="store.deleting"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ----------------------------- -->
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
            {{ store.isEditMode ? "Edit Category" : "Add New Category" }}
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
              <label class="form-label fw-semibold text-secondary small"
                >Category Name <span class="text-danger">*</span></label
              >
              <input
                type="text"
                class="form-control"
                v-model="store.form.name"
                placeholder="e.g., Electronics"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"
                >Description</label
              >
              <textarea
                class="form-control"
                v-model="store.form.description"
                placeholder="Brief description"
                rows="3"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"
                >Parent Category</label
              >
              <select class="form-select" v-model="store.form.parent_id">
                <option :value="null">None (Top Level)</option>
                <option
                  v-for="parent in store.categories"
                  :key="parent.id"
                  :value="parent.id"
                  :disabled="parent.id === store.selectedCategory?.id"
                >
                  {{ parent.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"
                >Status</label
              >
              <select class="form-select" v-model="store.form.status">
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
                <span v-if="!store.saving"
                  ><i class="bi bi-check-lg me-1"></i> Save</span
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

    <!-- View Detail Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showViewModal"
      @click.self="showViewModal = false"
    >
      <div
        class="modal-custom bg-white rounded-4 shadow overflow-hidden"
        style="max-width: 500px"
      >
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">Category Details</h5>
          <button
            type="button"
            class="btn-close"
            @click="showViewModal = false"
          ></button>
        </div>
        <div class="modal-body-custom p-4" v-if="viewingCategory">
          <div class="text-center mb-4">
            <div
              class="cat-icon-large bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mx-auto"
              style="width: 70px; height: 70px; font-size: 28px"
            >
              <i class="bi bi-folder-fill"></i>
            </div>
            <h4 class="fw-bold mt-3 mb-1">{{ viewingCategory.name }}</h4>
            <span
              class="badge rounded-pill"
              :class="getStatusBadge(viewingCategory.status)"
              >{{ viewingCategory.status }}</span
            >
          </div>
          <div class="row g-3 text-center mb-4">
            <div class="col-6 border-end">
              <div class="text-secondary small">Products</div>
              <div class="fs-5 fw-bold">
                {{ viewingCategory.products_count || 0 }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-secondary small">Parent</div>
              <div class="fw-semibold">
                {{ getParentName(viewingCategory.parent_id) }}
              </div>
            </div>
          </div>
          <div v-if="viewingCategory.description">
            <div class="text-secondary small mb-1">Description</div>
            <p class="text-dark small mb-0">
              {{ viewingCategory.description }}
            </p>
          </div>
          <div class="text-muted small mt-3 border-top pt-3">
            <i class="bi bi-calendar3 me-1"></i> Created:
            {{ formatDate(viewingCategory.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
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
          <div class="text-danger mb-3">
            <i
              class="bi bi-exclamation-triangle-fill"
              style="font-size: 3rem"
            ></i>
          </div>
          <h5 class="fw-bold mb-2">Delete Category?</h5>
          <p class="text-secondary mb-4">
            Are you sure you want to delete
            <strong>{{ deleteTarget.name }}</strong
            >?
          </p>
          <div class="d-flex gap-2 justify-content-center">
            <button
              class="btn btn-light rounded-2 px-4"
              @click="deleteTarget = null"
            >
              Cancel
            </button>
            <button
              class="btn btn-danger rounded-2 px-4"
              :disabled="store.deleting"
              @click="handleDelete"
            >
              <span v-if="!store.deleting"
                ><i class="bi bi-trash me-1"></i> Delete</span
              >
              <span v-else
                ><span class="spinner-border spinner-border-sm me-1"></span
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      v-if="store.toast.show"
      style="z-index: 1060"
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
import { ref, computed, onMounted } from "vue";
import { useCategoryStore } from "@/stores/categoryStore"; // Ensure path matches
import AdminLayout from "@/layouts/AdminLayout.vue";

const store = useCategoryStore();

// Local State
const deleteTarget = ref(null);
const showViewModal = ref(false);
const viewingCategory = ref(null);

// Computed Stats (Calculated here to avoid modifying your pasted Store)
const activeCount = computed(
  () =>
    store.categories.filter((c) => (c.status || "active") === "active").length,
);
const inactiveCount = computed(
  () => store.categories.filter((c) => c.status === "inactive").length,
);
const totalProducts = computed(() =>
  store.categories.reduce((sum, cat) => sum + (cat.products_count || 0), 0),
);

// Methods
// const handleSearch = () => {
//   store.setSearchQuery(store.searchQuery);
//   store.fetchCategories();
// };

// Replace your existing handleSearch with this:
const handleSearch = () => {
  // v-model automatically updates store.searchQuery,
  // so we just need to tell the store to fetch data.
  store.fetchCategories();
};

const getParentName = (parentId) => {
  if (!parentId) return "—";
  const parent = store.categories.find((c) => c.id === parentId);
  return parent ? parent.name : "Unknown";
};

const getStatusBadge = (status) =>
  status === "active"
    ? "bg-success bg-opacity-10 text-success"
    : "bg-secondary bg-opacity-10 text-secondary";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const openViewModal = (cat) => {
  viewingCategory.value = cat;
  showViewModal.value = true;
};
const confirmDelete = (cat) => {
  deleteTarget.value = cat;
};

const handleDelete = async () => {
  const id = deleteTarget.value.id; // Save ID before deleting target ref
  const success = await store.deleteCategory(id);
  if (success) deleteTarget.value = null;
};

const handleSave = async () => {
  // Store handles closing modal and resetting form on success
  const success = await store.saveCategory();
  if (success) {
    await store.fetchCategories(); // Refresh table data
  }
};

onMounted(() => store.fetchCategories());
</script>

<style scoped>
.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cat-icon-box {
  width: 40px;
  height: 40px;
  font-size: 16px;
  flex-shrink: 0;
}
.cat-icon-large {
  transition: transform 0.2s ease;
}
.cat-icon-large:hover {
  transform: scale(1.05);
}

.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
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
  padding: 1.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>
