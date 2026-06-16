<template>
  <AdminLayout pageTitle="Carts">
    <div class="data-card bg-white border rounded-3 shadow-sm p-4">
      <!-- Header -->
      <div class="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h6 class="m-0 fw-bold">Shopping Cart</h6>
        <div class="d-flex gap-2">
          <button class="btn btn-primary fw-semibold rounded-2 d-flex align-items-center gap-2" @click="openAddModal">
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
          <button
            class="btn btn-warning fw-semibold rounded-2 d-flex align-items-center gap-2"
            @click="handleCheckout"
            :disabled="cartItems.length === 0 || checkingOut"
          >
            <span v-if="!checkingOut">
              <i class="bi bi-credit-card"></i> Checkout
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm"></span> Processing...
            </span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="small text-uppercase text-secondary fw-bold">#</th>
              <th class="small text-uppercase text-secondary fw-bold">Product Name</th>
              <th class="small text-uppercase text-secondary fw-bold">Price</th>
              <th class="small text-uppercase text-secondary fw-bold">Quantity</th>
              <th class="small text-uppercase text-secondary fw-bold">Subtotal</th>
              <th class="small text-uppercase text-secondary fw-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="6" class="text-center text-secondary py-4">
                <div class="spinner-border spinner-border-sm me-2"></div> Loading Cart...
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-else-if="cartItems.length === 0">
              <td colspan="6" class="text-center text-secondary py-4">
                Your cart is empty
              </td>
            </tr>
            <!-- Cart Rows -->
            <tr v-else v-for="(item, index) in cartItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td class="fw-semibold">
                {{ item.product?.name || item.name || "Unknown Product" }}
              </td>
              <td>
                ${{ parseFloat(item.product?.price || item.price || 0).toFixed(2) }}
              </td>
              <td>
                <span class="badge bg-light text-dark border fw-semibold rounded-pill">
                  {{ item.quantity }}
                </span>
              </td>
              <td class="fw-semibold text-primary">${{ calculateSubtotal(item).toFixed(2) }}</td>
              <td>
                <button class="btn btn-sm btn-outline-danger border-0 rounded-2 btn-action-icon" @click="handleRemoveItem(item.id)" title="Remove">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cart Summary Footer -->
      <div class="cart-footer d-flex justify-content-end gap-3 pt-4 border-top mt-3" v-if="cartItems.length > 0">
        <div class="text-end">
          <span class="text-secondary small">Total Amount</span>
          <div class="total-price fs-3 fw-bold text-primary">${{ cartTotal.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- Add to Cart Modal -->
    <div
      class="modal-overlay fade show d-flex align-items-center justify-content-center"
      v-if="showFormModal"
      @click.self="closeFormModal"
    >
      <div class="modal-custom bg-white rounded-4 shadow overflow-hidden">
        <div class="modal-header-custom p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="modal-title m-0 fw-bold">Add Product to Cart</h5>
          <button type="button" class="btn-close" @click="closeFormModal"></button>
        </div>
        <div class="modal-body-custom p-4">
          <form @submit.prevent="handleAddToCart">
            <div class="form-floating mb-3">
              <select class="form-select" id="cartProduct" v-model="form.product_id" required>
                <option value="" disabled selected>Select a Product</option>
                <option v-for="prod in products" :key="prod.id" :value="prod.id">
                  {{ prod.name }} - ${{ prod.price }}
                </option>
              </select>
              <label for="cartProduct">Product</label>
            </div>

            <div class="form-floating mb-3">
              <input
                type="number"
                class="form-control"
                id="cartQty"
                v-model="form.quantity"
                min="1"
                placeholder="Quantity"
                required
              />
              <label for="cartQty">Quantity</label>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light fw-semibold rounded-2" @click="closeFormModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fw-semibold rounded-2" :disabled="saving">
                <span v-if="!saving">
                  <i class="bi bi-plus-lg me-1"></i> Add to Cart
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-1"></span> Adding...
                </span>
              </button>
            </div>
          </form>
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

// State
const cartItems = ref([]);
const products = ref([]); // For the dropdown
const loading = ref(true);
const saving = ref(false);
const checkingOut = ref(false);
const showFormModal = ref(false);

const form = reactive({
  product_id: "",
  quantity: 1,
});

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

// Helper: Calculate Subtotal per row
const calculateSubtotal = (item) => {
  const price = parseFloat(item.product?.price || item.price || 0);
  const qty = parseInt(item.quantity || 1);
  return price * qty;
};

// Computed: Cart Total
const cartTotal = computed(() => {
  return cartItems.value.reduce(
    (sum, item) => sum + calculateSubtotal(item),
    0,
  );
});

// 1. GET /carts (Fetch Cart Items)
const fetchCart = async () => {
  loading.value = true;
  try {
    const response = await api.get("/carts");
    cartItems.value = response.data.data || response.data || [];
  } catch (err) {
    showToast("Failed to load cart", "error");
  } finally {
    loading.value = false;
  }
};

// GET /products (For Dropdown)
const fetchProducts = async () => {
  try {
    const response = await api.get("/products");
    products.value = response.data.data || response.data || [];
  } catch (err) {
    console.error("Could not load products for dropdown");
  }
};

// Modal Logic
const openAddModal = () => {
  form.product_id = "";
  form.quantity = 1;
  showFormModal.value = true;
};
const closeFormModal = () => {
  showFormModal.value = false;
};

// 2. POST /carts (Add to Cart)
const handleAddToCart = async () => {
  saving.value = true;
  try {
    await api.post("/carts", {
      product_id: form.product_id,
      quantity: form.quantity,
    });
    showToast("Product added to cart");
    closeFormModal();
    fetchCart(); // Refresh cart
  } catch (err) {
    showToast(err.response?.data?.message || "Failed to add to cart", "error");
  } finally {
    saving.value = false;
  }
};

// 3. DELETE /carts/:id (Remove from Cart)
const handleRemoveItem = async (id) => {
  try {
    await api.delete(`/carts/${id}`);
    showToast("Item removed from cart");
    fetchCart(); // Refresh cart
  } catch (err) {
    showToast(err.response?.data?.message || "Failed to remove item", "error");
  }
};

// 4. POST /carts/checkout
const handleCheckout = async () => {
  if (cartItems.value.length === 0) return;

  checkingOut.value = true;
  try {
    await api.post("/carts/checkout");
    showToast("Checkout successful! Order placed.");
    cartItems.value = []; // Clear cart locally
  } catch (err) {
    showToast(err.response?.data?.message || "Checkout failed", "error");
  } finally {
    checkingOut.value = false;
  }
};

onMounted(() => {
  fetchCart();
  fetchProducts();
});
</script>

<style scoped>
/* Action Button */
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