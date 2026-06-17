<template>
  <AdminLayout pageTitle="Dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stat Cards Row -->
      <div class="row g-4 mb-4">
        <!-- Total Products (Green) -->
        <div class="col-xl-3 col-md-6">
          <div
            class="stat-card bg-white border rounded-3 shadow-sm h-100 p-4 d-flex flex-column align-items-center text-center"
          >
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
            <div class="stat-value fs-2 fw-bold mb-1">
              {{ stats.categories }}
            </div>
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

        <!-- Active Devices (Purple/Info) -->
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
                    <th class="small text-uppercase text-secondary fw-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="recentProducts.length === 0">
                    <td colspan="4" class="text-center py-5">
                      <div class="text-muted mb-2">
                        <i class="bi bi-inbox fs-1"></i>
                      </div>
                      <span class="text-secondary fw-bold"
                        >No products yet</span
                      >
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="product in recentProducts"
                    :key="product.id"
                  >
                    <td>
                      <div class="d-flex align-items-center">
                        <div
                          class="product-thumbnail bg-light rounded-2 me-3 d-flex align-items-center justify-content-center"
                          style="width: 40px; height: 40px"
                        >
                          <i
                            v-if="!product.image"
                            class="bi bi-image text-muted"
                          ></i>
                          <img
                            v-else
                            :src="product.image"
                            :alt="product.title"
                            class="rounded-2"
                            style="width: 100%; height: 100%; object-fit: cover"
                            @error="handleImageError"
                          />
                        </div>
                        <div>
                          <div class="fw-semibold text-dark">
                            {{ product.title }}
                          </div>
                          <div class="small text-muted">
                            {{ product.description?.substring(0, 30) }}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-secondary">{{
                        getCategoryName(product.category_ids)
                      }}</span>
                    </td>
                    <td>
                      <div class="fw-semibold text-success">
                        ${{ parseFloat(product.price).toFixed(2) }}
                      </div>
                    </td>
                    <td>
                      <span
                        class="badge rounded-pill"
                        :class="getStatusBadgeClass(product.status)"
                      >
                        {{ product.status }}
                      </span>
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

            <div class="p-3 grow">
              <div
                v-if="recentCategories.length === 0"
                class="text-center py-5"
              >
                <div class="text-muted mb-2">
                  <i class="bi bi-tags fs-1"></i>
                </div>
                <span class="text-secondary fw-bold">No categories yet</span>
              </div>
              <div v-else class="category-list">
                <div
                  v-for="category in recentCategories"
                  :key="category.id"
                  class="category-item d-flex align-items-center justify-content-between p-2 mb-2 rounded-2 bg-light"
                >
                  <div class="d-flex align-items-center">
                    <div
                      class="category-icon bg-primary bg-opacity-10 text-primary rounded-2 me-3 d-flex align-items-center justify-content-center"
                      style="width: 36px; height: 36px"
                    >
                      <i class="bi bi-folder"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">
                        {{ category.name }}
                      </div>
                      <div class="small text-muted">
                        {{ category.description?.substring(0, 25) }}...
                      </div>
                    </div>
                  </div>
                  <span
                    class="badge rounded-pill"
                    :class="getStatusBadgeClass(category.status)"
                  >
                    {{ category.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities & Quick Stats -->
      <div class="row g-4 mt-0">
        <!-- Recent Activities -->
        <div class="col-lg-6">
          <div
            class="data-card bg-white border rounded-3 shadow-sm h-100 d-flex flex-column"
          >
            <div
              class="card-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
            >
              <h6 class="m-0 fw-bold">Recent Activities</h6>
              <button class="btn btn-sm btn-outline-secondary rounded-2">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div class="p-3 grow">
              <div
                v-if="recentActivities.length === 0"
                class="text-center py-5"
              >
                <div class="text-muted mb-2">
                  <i class="bi bi-activity fs-1"></i>
                </div>
                <span class="text-secondary fw-bold">No recent activities</span>
              </div>
              <div v-else class="activity-list">
                <div
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  class="activity-item d-flex align-items-start gap-3 p-3 mb-2 rounded-2"
                  :class="
                    index < recentActivities.length - 1 ? 'border-bottom' : ''
                  "
                >
                  <div
                    class="activity-icon rounded-circle d-flex align-items-center justify-content-center shrink-0"
                    :class="getActivityIconClass(activity.type)"
                    style="width: 32px; height: 32px"
                  >
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="grow">
                    <div class="fw-semibold text-dark">
                      {{ activity.description }}
                    </div>
                    <div class="small text-muted">
                      {{ formatDate(activity.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="col-lg-6">
          <div
            class="data-card bg-white border rounded-3 shadow-sm h-100 d-flex flex-column"
          >
            <div
              class="card-header-custom p-4 border-bottom d-flex justify-content-between align-items-center"
            >
              <h6 class="m-0 fw-bold">Quick Stats</h6>
              <select
                class="form-select form-select-sm rounded-2"
                style="width: auto"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div class="p-3 grow">
              <div class="row g-3">
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Total Revenue</div>
                    <div class="fs-5 fw-bold text-success">
                      ${{ quickStats.revenue }}
                    </div>
                    <div class="small text-success">
                      <i class="bi bi-arrow-up"></i>
                      {{ quickStats.revenueGrowth }}%
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Total Orders</div>
                    <div class="fs-5 fw-bold text-primary">
                      {{ quickStats.orders }}
                    </div>
                    <div class="small text-success">
                      <i class="bi bi-arrow-up"></i>
                      {{ quickStats.ordersGrowth }}%
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">New Users</div>
                    <div class="fs-5 fw-bold text-info">
                      {{ quickStats.users }}
                    </div>
                    <div class="small text-success">
                      <i class="bi bi-arrow-up"></i>
                      {{ quickStats.usersGrowth }}%
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Conversion Rate</div>
                    <div class="fs-5 fw-bold text-warning">
                      {{ quickStats.conversion }}%
                    </div>
                    <div class="small text-danger">
                      <i class="bi bi-arrow-down"></i>
                      {{ quickStats.conversionGrowth }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDashboardStore } from "@/stores/DashboardStore.js";
import { useProductsStore } from "@/stores/ProductsStore.js";
import { useCategoryStore } from "@/stores/categoryStore.js";

// Stores
const dashboardStore = useDashboardStore();
const productsStore = useProductsStore();
const categoryStore = useCategoryStore(); 

// State
const loading = ref(false);
const stats = reactive({
  products: 0,
  categories: 0,
  pendingPayments: 0,
  devices: 0,
});

const recentProducts = ref([]);
const recentCategories = ref([]);
const recentActivities = ref([]);
const quickStats = reactive({
  revenue: "0",
  revenueGrowth: 0,
  orders: 0,
  ordersGrowth: 0,
  users: 0,
  usersGrowth: 0,
  conversion: 0,
  conversionGrowth: 0,
});

// Methods
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Load dashboard stats
    await dashboardStore.fetchStats();

    // Update stats
    stats.products = dashboardStore.stats.totalProducts;
    stats.categories = dashboardStore.stats.activeCategories;
    stats.pendingPayments = dashboardStore.stats.pendingPayments;
    stats.devices = dashboardStore.stats.totalDevices;

    // Load recent products
    await productsStore.fetchProducts();
    recentProducts.value = productsStore.filteredProducts.slice(0, 5);

    // Load categories
    await categoryStore.fetchCategories();
    recentCategories.value = categoryStore.filteredCategories.slice(0, 5);

    // Load recent activities
    await dashboardStore.fetchActivities();
    recentActivities.value = dashboardStore.recentActivities.slice(0, 5);

    // Update quick stats
    quickStats.revenue = formatNumber(dashboardStore.stats.totalRevenue);
    quickStats.orders = dashboardStore.stats.totalOrders;
    quickStats.users = dashboardStore.stats.totalUsers;
    quickStats.conversion = calculateConversionRate();

    // Add growth percentages (placeholder - you can calculate from historical data)
    quickStats.revenueGrowth = 12.5;
    quickStats.ordersGrowth = 8.3;
    quickStats.usersGrowth = 15.2;
    quickStats.conversionGrowth = -2.1;
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

const formatNumber = (num) => {
  if (!num) return "0";
  return num.toLocaleString();
};

const calculateConversionRate = () => {
  if (!quickStats.orders || !quickStats.users) return 0;
  return ((quickStats.orders / quickStats.users) * 100).toFixed(1);
};

const getCategoryName = (categoryIds) => {
  if (!categoryIds || !Array.isArray(categoryIds)) return "N/A";
  const names = categoryIds
    .map((id) => {
      const category = recentCategories.value.find((c) => c.id === id);
      return category ? category.name : "";
    })
    .filter(Boolean);

  return names.length > 0
    ? names.slice(0, 2).join(", ") + (names.length > 2 ? "..." : "")
    : "N/A";
};

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: "bg-success bg-opacity-10 text-success",
    inactive: "bg-secondary bg-opacity-10 text-secondary",
    pending: "bg-warning bg-opacity-10 text-warning",
    rejected: "bg-danger bg-opacity-10 text-danger",
    approved: "bg-primary bg-opacity-10 text-primary",
  };
  return statusClasses[status?.toLowerCase()] || "bg-light text-secondary";
};

const getActivityIcon = (type) => {
  const icons = {
    order: "bi bi-bag",
    product: "bi bi-box",
    user: "bi bi-person",
    payment: "bi bi-credit-card",
    category: "bi bi-tags",
    default: "bi bi-activity",
  };
  return icons[type] || icons.default;
};

const getActivityIconClass = (type) => {
  const classes = {
    order: "bg-primary bg-opacity-10 text-primary",
    product: "bg-success bg-opacity-10 text-success",
    user: "bg-info bg-opacity-10 text-info",
    payment: "bg-warning bg-opacity-10 text-warning",
    category: "bg-primary bg-opacity-10 text-primary",
    default: "bg-secondary bg-opacity-10 text-secondary",
  };
  return classes[type] || classes.default;
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleImageError = (event) => {
  event.target.style.display = "none";
};

// Lifecycle
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
/* Stat Card Styles */
.stat-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Data Card Styles */
.data-card {
  transition: box-shadow 0.2s ease-in-out;
}

.data-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* Card Header */
.card-header-custom {
  background-color: #fafafa;
}

/* Table Styles */
.table thead th {
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

/* Category Item Styles */
.category-item {
  transition: background-color 0.2s ease-in-out;
}

.category-item:hover {
  background-color: #e9ecef !important;
}

/* Activity Item Styles */
.activity-item {
  transition: background-color 0.2s ease-in-out;
}

.activity-item:hover {
  background-color: #f8f9fa !important;
}

/* Product Thumbnail */
.product-thumbnail {
  overflow: hidden;
}

/* Stat Item */
.stat-item {
  transition: transform 0.2s ease-in-out;
}

.stat-item:hover {
  transform: translateY(-2px);
}

/* Loading Spinner */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .category-item,
  .activity-item {
    padding: 0.75rem;
  }
}
</style>
