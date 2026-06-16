<template>
  <AdminLayout pageTitle="Products">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="m-0 fw-bold">All Products</h6>
          <!-- Search Input -->
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary small"></i>
            <input
              type="text"
              class="form-control ps-5"
              style="width: 240px; border-radius: 8px;"
              placeholder="Search products..."
              v-model="searchQuery"
            />
          </div>
        </div>
        
        <!-- Add Button -->
        <button class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="openAddModal">
          <i class="bi bi-plus-lg"></i> Add Product
        </button>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="small text-uppercase text-secondary fw-bold">#</th>
              <th class="small text-uppercase text-secondary fw-bold">Product Name</th>
              <th class="small text-uppercase text-secondary fw-bold">Category</th>
              <th class="small text-uppercase text-secondary fw-bold">Price</th>
              <th class="small text-uppercase text-secondary fw-bold">Image</th>
              <th class="small text-uppercase text-secondary fw-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="6" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div> Loading...
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="6" class="text-center text-secondary py-4">
                No products found
              </td>
            </tr>
            <!-- Product Rows --> 
            <tr v-else v-for="(prod, index) in filteredProducts" :key="prod.id">
              <td>{{ index + 1 }}</td>
              <td>
                <div class="fw-semibold">{{ prod.name }}</div>
                <div class="text-secondary small text-truncate" style="max-width: 200px;">
                  {{ prod.description?.substring(0, 40) }}...
                </div>
              </td>
              <td>
                <span class="badge bg-light text-secondary border">{{ prod.category?.name || "Uncategorized" }}</span>
              </td>
              <td class="fw-semibold text-primary">${{ prod.price }}</td>
              <td>
                <img
                  v-if="prod.image"
                  :src="prod.image"
                  alt="img"
                  class="rounded-2 object-fit-cover"
                  style="width: 40px; height: 40px;"
                />
                <div
                  v-else
                  class="bg-light rounded-2 d-flex align-items-center justify-content-center text-secondary"
                  style="width: 40px; height: 40px;"
                >
                  <i class="bi bi-image"></i>
                </div>
              </td>
              <td>
                <div class="d-flex gap-2">
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
    </div>

    <!-- Add / Edit Product Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showFormModal"
      @click.self="closeFormModal"
    >
      <div class="modal-custom modal-lg-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">
            {{ isEditing ? "Edit" : "Add New" }} Product
          </h5>
          <button type="button" class="btn-close" @click="closeFormModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleSave">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="prodName"
                    v-model="form.name"
                    placeholder="Product Name"
                    required
                  />
                  <label for="prodName">Product Name</label>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="form-floating">
                  <select
                    class="form-select"
                    id="prodCategory"
                    v-model="form.category_id"
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
                  <label for="prodCategory">Category</label>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="form-floating">
                  <input
                    type="number"
                    step="0.01"
                    class="form-control"
                    id="prodPrice"
                    v-model="form.price"
                    placeholder="Price"
                    required
                  />
                  <label for="prodPrice">Price ($)</label>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="form-floating">
                  <input
                    type="number"
                    class="form-control"
                    id="prodQty"
                    v-model="form.quantity"
                    placeholder="Quantity"
                  />
                  <label for="prodQty">Quantity</label>
                </div>
              </div>
              <div class="col-12 mb-3">
                <div class="form-floating">
                  <textarea
                    class="form-control"
                    placeholder="Description"
                    id="prodDesc"
                    v-model="form.description"
                    style="height: 100px"
                  ></textarea>
                  <label for="prodDesc">Description</label>
                </div>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-semibold text-secondary small">Product Image</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileUpload"
                  accept="image/*"
                />
                <div v-if="imagePreview" class="mt-2">
                  <img
                    :src="imagePreview"
                    alt="Preview"
                    class="rounded-3 object-fit-cover border"
                    style="width: 80px; height: 80px;"
                  />
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-light fw-semibold rounded-2"
                @click="closeFormModal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fw-semibold rounded-2" :disabled="saving">
                <span v-if="!saving">
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
            This action cannot be undone.
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
              :disabled="deleting"
            >
              <span v-if="!deleting">Delete</span>
              <span v-else><span class="spinner-border spinner-border-sm"></span></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-container position-fixed top-0 end-0 p-3" v-if="toast.show">
      <div class="toast show align-items-center text-white border-0" :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi" :class="toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
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

// States
const products = ref([]);
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
const form = reactive({
  name: "",
  category_id: "",
  price: "",
  quantity: "",
  description: "",
  image: null, 
});
const imagePreview = ref(null); 

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

// Computed Search
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// Fetch Data
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await api.get("/products");
    products.value = response.data.data || response.data || [];
  } catch (err) {
    showToast("Failed to load products", "error");
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    categories.value = response.data.data || response.data || [];
  } catch (err) {
    console.error("Could not load categories");
  }
};

// Modals Logic
const openAddModal = () => {
  isEditing.value = false;
  form.name = "";
  form.category_id = "";
  form.price = "";
  form.quantity = "";
  form.description = "";
  form.image = null;
  imagePreview.value = null;
  showFormModal.value = true;
};

const openEditModal = (prod) => {
  isEditing.value = true;
  selectedId.value = prod.id;
  form.name = prod.name;
  form.category_id = prod.category_id || prod.category?.id;
  form.price = prod.price;
  form.quantity = prod.quantity;
  form.description = prod.description;
  form.image = null; 
  imagePreview.value = prod.image || null; 
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

// Handle File Selection
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.image = file;
    imagePreview.value = URL.createObjectURL(file); 
  }
};

// SAVE (POST/PUT) - With FormData
const handleSave = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category_id", form.category_id);
    formData.append("price", form.price);
    formData.append("quantity", form.quantity);
    formData.append("description", form.description);

    if (form.image) {
      formData.append("image", form.image);
    }

    if (isEditing.value) {
      formData.append("_method", "PUT");
      await api.post(`/products/${selectedId.value}`, formData);
      showToast("Product updated successfully");
    } else {
      await api.post("/products", formData);
      showToast("Product created successfully");
    }

    closeFormModal();
    fetchProducts();
  } catch (err) {
    showToast(err.response?.data?.message || "Failed to save product", "error");
  } finally {
    saving.value = false;
  }
};

// DELETE
const handleDelete = async () => {
  deleting.value = true;
  try {
    await api.delete(`/products/${selectedId.value}`);
    showToast("Product deleted successfully");
    closeDeleteModal();
    fetchProducts();
  } catch (err) {
    showToast(
      err.response?.data?.message || "Failed to delete product",
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories(); 
});
</script>

<style scoped>
/* Minimal Custom CSS for Modals and Icons */

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
.modal-lg-custom {
  max-width: 700px;
}
.modal-sm-custom {
  max-width: 400px;
}

/* Table Action Buttons */
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