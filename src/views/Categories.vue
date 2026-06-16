<template>
  <AdminLayout pageTitle="Categories">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div
        class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
      >
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="m-0 fw-bold">All Categories</h6>
          <!-- Search Input -->
          <div class="position-relative">
            <i
              class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"
            ></i>
            <input
              type="text"
              class="form-control ps-5"
              style="width: 240px; border-radius: 8px"
              placeholder="Search categories..."
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Add Button -->
        <button
          class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2"
          @click="openAddModal"
        >
          <i class="bi bi-plus-lg"></i> Add Category
        </button>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="small text-uppercase text-secondary fw-bold">#</th>
              <th class="small text-uppercase text-secondary fw-bold">
                Category Name
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Products Count
              </th>
              <th class="small text-uppercase text-secondary fw-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="4" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading...
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-else-if="filteredCategories.length === 0">
              <td colspan="4" class="text-center text-secondary py-4">
                No categories found
              </td>
            </tr>
            <!-- Category Rows -->
            <tr v-else v-for="(cat, index) in filteredCategories" :key="cat.id">
              <td>{{ index + 1 }}</td>
              <td class="fw-semibold">{{ cat.name }}</td>
              <td>
                <span
                  class="badge bg-info bg-opacity-10 text-info border border-info-subtle rounded-pill"
                >
                  {{ cat.products_count || 0 }} items
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-outline-secondary border-0 rounded-2 btn-action-icon"
                    @click="openEditModal(cat)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon"
                    @click="openDeleteModal(cat.id)"
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
    </div>

    <!-- Add / Edit Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showFormModal"
      @click.self="closeFormModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div
          class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
        >
          <h5 class="modal-title m-0 fw-bold">
            {{ isEditing ? "Edit" : "Add New" }} Category
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeFormModal"
          ></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="catName"
                v-model="form.name"
                placeholder="Category Name"
                required
              />
              <label for="catName">Category Name</label>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="closeFormModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary fw-semibold rounded-2"
                :disabled="saving"
              >
                <span v-if="!saving">
                  <i class="bi bi-save me-1"></i> Save
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
          <h6 class="fw-bold mb-2">Delete Category?</h6>
          <p class="text-secondary small">This action cannot be undone.</p>
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
              :disabled="deleting"
            >
              <span v-if="!deleting">Delete</span>
              <span v-else
                ><span class="spinner-border spinner-border-sm"></span
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      v-if="toast.show"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i
              class="bi"
              :class="
                toast.type === 'success'
                  ? 'bi-check-circle-fill'
                  : 'bi-x-circle-fill'
              "
            ></i>
            {{ toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "@/api/api.js";
import AdminLayout from "@/layouts/AdminLayout.vue";

// State
const categories = ref([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const searchQuery = ref("");

// Modal States
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedId = ref(null);

// Form Data
const form = reactive({ name: "" });

// Toast
const toast = reactive({ show: false, message: "", type: "success" });
const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// Computed Search Filter
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  return categories.value.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 1. GET /categories
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await api.get("/categories");
    categories.value = response.data.data || response.data || [];
  } catch (err) {
    showToast("Failed to load categories", "error");
  } finally {
    loading.value = false;
  }
};

// Modal Helpers
const openAddModal = () => {
  isEditing.value = false;
  form.name = "";
  showFormModal.value = true;
};
const openEditModal = (cat) => {
  isEditing.value = true;
  selectedId.value = cat.id;
  form.name = cat.name;
  showFormModal.value = true;
};
const closeFormModal = () => {
  showFormModal.value = false;
};
const openDeleteModal = (id) => {
  selectedId.value = id;
  showDeleteModal.value = true;
};
const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

// 2. POST /categories OR PUT /categories/:id
const handleSave = async () => {
  saving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/categories/${selectedId.value}`, form);
      showToast("Category updated successfully");
    } else {
      await api.post("/categories", form);
      showToast("Category created successfully");
    }
    closeFormModal();
    fetchCategories(); // Refresh list
  } catch (err) {
    showToast(
      err.response?.data?.message || "Failed to save category",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

// 3. DELETE /categories/:id
const handleDelete = async () => {
  deleting.value = true;
  try {
    await api.delete(`/categories/${selectedId.value}`);
    showToast("Category deleted successfully");
    closeDeleteModal();
    fetchCategories(); // Refresh list
  } catch (err) {
    showToast(
      err.response?.data?.message || "Failed to delete category",
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchCategories();
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
}

.modal-custom {
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}
.modal-sm-custom {
  max-width: 400px;
}

/* Action Buttons */
.btn-action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-action-icon:hover {
  transform: scale(1.1);
}

/* Animations */
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
