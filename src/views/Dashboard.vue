<template>
  <AdminLayout pageTitle="Dashboard">
    <!-- Stat Cards Row -->
    <div class="row g-4 mb-4">
      <!-- Total Products (Green) -->
      <div class="col-xl-3 col-md-6">
        <div
          class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4 d-flex flex-column align-items-center text-center"
        >
          <!-- Bootstrap bg-opacity-10 creates the light background -->
          <div
            class="stat-icon bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center mb-3"
            style="width: 48px; height: 48px"
          >
            <i class="bi bi-box-seam fs-5"></i>
          </div>
          <div class="stat-value fs-2 fw-bold mb-1">{{ stats.products }}</div>
          <div class="stat-label small text-uppercase text-secondary fw-bold">
            Total Products
          </div>
        </div>
      </div>

      <!-- Total Categories (Blue) -->
      <div class="col-xl-3 col-md-6">
        <div
          class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4 d-flex flex-column align-items-center text-center"
        >
          <div
            class="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center mb-3"
            style="width: 48px; height: 48px"
          >
            <i class="bi bi-tags fs-5"></i>
          </div>
          <div class="stat-value fs-2 fw-bold mb-1">{{ stats.categories }}</div>
          <div class="stat-label small text-uppercase text-secondary fw-bold">
            Total Categories
          </div>
        </div>
      </div>

      <!-- Pending Payments (Orange/Warning) -->
      <div class="col-xl-3 col-md-6">
        <div
          class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4 d-flex flex-column align-items-center text-center"
        >
          <div
            class="stat-icon bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center mb-3"
            style="width: 48px; height: 48px"
          >
            <i class="bi bi-credit-card fs-5"></i>
          </div>
          <div class="stat-value fs-2 fw-bold mb-1">
            {{ stats.pendingPayments }}
          </div>
          <div class="stat-label small text-uppercase text-secondary fw-bold">
            Pending Payments
          </div>
        </div>
      </div>

      <!-- Active Devices (Purple/Info - mapped to Info as Bootstrap has no purple default) -->
      <div class="col-xl-3 col-md-6">
        <div
          class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4 d-flex flex-column align-items-center text-center"
        >
          <div
            class="stat-icon bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center mb-3"
            style="width: 48px; height: 48px"
          >
            <i class="bi bi-display fs-5"></i>
          </div>
          <div class="stat-value fs-2 fw-bold mb-1">{{ stats.devices }}</div>
          <div class="stat-label small text-uppercase text-secondary fw-bold">
            Active Devices
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Row -->
    <div class="row g-4">
      <!-- Latest Products -->
      <div class="col-lg-8">
        <div
          class="data-card bg-white border rounded-3 shadow-sm h-100 d-flex flex-column"
        >
          <!-- Header -->
          <div
            class="card-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
          >
            <h6 class="m-0 fw-bold">Latest Products</h6>
            <!-- Bootstrap Outline Primary Button -->
            <router-link
              to="/products"
              class="btn btn-outline-primary btn-sm fw-semibold rounded-2"
              >View All</router-link
            >
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="bg-light">
                <tr>
                  <th class="small text-uppercase text-secondary fw-bold">
                    Product
                  </th>
                  <th class="small text-uppercase text-secondary fw-bold">
                    Category
                  </th>
                  <th class="small text-uppercase text-secondary fw-bold">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="recentProducts.length === 0">
                  <td colspan="3" class="text-center py-5">
                    <div class="text-muted mb-2">
                      <i class="bi bi-inbox fs-1"></i>
                    </div>
                    <span class="text-secondary fw-bold">No products yet</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Quick Categories -->
      <div class="col-lg-4">
        <div
          class="data-card bg-white border rounded-3 shadow-sm h-100 d-flex flex-column"
        >
          <!-- Header -->
          <div
            class="card-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
          >
            <h6 class="m-0 fw-bold">Categories</h6>
            <router-link
              to="/categories"
              class="btn btn-outline-primary btn-sm fw-semibold rounded-2"
              >Manage</router-link
            >
          </div>

          <div class="p-3">
            <div v-if="recentCategories.length === 0" class="text-center py-5">
              <div class="text-muted mb-2">
                <i class="bi bi-tags fs-1"></i>
              </div>
              <span class="text-secondary fw-bold">No categories yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { RouterLink } from "vue-router";

const loading = ref(false);
const stats = reactive({
  products: 0,
  categories: 0,
  pendingPayments: 0,
  devices: 0,
});

const recentProducts = ref([]);
const recentCategories = ref([]);

// Helper colors (kept for future dynamic rendering logic)
const colors = ["text-success", "text-primary", "text-warning", "text-info"];
const getColor = (i) => colors[i % colors.length];
</script>

<style scoped>
/* Minimal custom CSS only for hover effects not provided by Bootstrap */
.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-3px);
}
</style>
