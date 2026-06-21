<template>
  <AdminLayout pageTitle="Dashboard">
    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="dashboardStore.toast.show"
        class="toast-notification"
        :class="`toast-${dashboardStore.toast.type}`"
      >
        <i
          :class="getToastIcon(dashboardStore.toast.type)"
          class="me-2"
        ></i>
        {{ dashboardStore.toast.message }}
        <button
          class="btn-close btn-close-white ms-3"
          @click="dashboardStore.hideToast()"
        ></button>
      </div>
    </Transition>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading dashboard data...</p>
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
              >
                View All
              </router-link>
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
                            {{ truncateText(product.description, 30) }}...
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
                        ${{ formatPrice(product.price) }}
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
              >
                Manage
              </router-link>
            </div>

            <div class="p-3 flex-grow-1">
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
                        {{ truncateText(category.description, 25) }}...
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
              <button
                class="btn btn-sm btn-outline-secondary rounded-2"
                :disabled="refreshingActivities"
                @click="handleRefreshActivities"
              >
                <i
                  class="bi bi-arrow-clockwise"
                  :class="{ 'spin-animation': refreshingActivities }"
                ></i>
              </button>
            </div>
            <div class="p-3 flex-grow-1">
              <div
                v-if="recentActivities.length === 0"
                class="text-center py-5"
              >
                <div class="text-muted mb-2">
                  <i class="bi bi-activity fs-1"></i>
                </div>
                <span class="text-secondary fw-bold"
                  >No recent activities</span
                >
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
                    class="activity-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    :class="getActivityIconClass(activity.type)"
                    style="width: 32px; height: 32px"
                  >
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="flex-grow-1">
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
                v-model="selectedPeriod"
                class="form-select form-select-sm rounded-2"
                style="width: auto"
                @change="handlePeriodChange"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>
            <div class="p-3 flex-grow-1">
              <div class="row g-3">
                <!-- Total Revenue -->
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Total Revenue</div>
                    <div class="fs-5 fw-bold text-success">
                      ${{ quickStats.revenue }}
                    </div>
                    <div
                      class="small"
                      :class="
                        quickStats.revenueGrowth >= 0
                          ? 'text-success'
                          : 'text-danger'
                      "
                    >
                      <i
                        :class="
                          quickStats.revenueGrowth >= 0
                            ? 'bi bi-arrow-up'
                            : 'bi bi-arrow-down'
                        "
                      ></i>
                      {{ Math.abs(quickStats.revenueGrowth) }}%
                    </div>
                  </div>
                </div>

                <!-- Total Orders -->
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Total Orders</div>
                    <div class="fs-5 fw-bold text-primary">
                      {{ quickStats.orders }}
                    </div>
                    <div
                      class="small"
                      :class="
                        quickStats.ordersGrowth >= 0
                          ? 'text-success'
                          : 'text-danger'
                      "
                    >
                      <i
                        :class="
                          quickStats.ordersGrowth >= 0
                            ? 'bi bi-arrow-up'
                            : 'bi bi-arrow-down'
                        "
                      ></i>
                      {{ Math.abs(quickStats.ordersGrowth) }}%
                    </div>
                  </div>
                </div>

                <!-- New Users -->
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">New Users</div>
                    <div class="fs-5 fw-bold text-info">
                      {{ quickStats.users }}
                    </div>
                    <div
                      class="small"
                      :class="
                        quickStats.usersGrowth >= 0
                          ? 'text-success'
                          : 'text-danger'
                      "
                    >
                      <i
                        :class="
                          quickStats.usersGrowth >= 0
                            ? 'bi bi-arrow-up'
                            : 'bi bi-arrow-down'
                        "
                      ></i>
                      {{ Math.abs(quickStats.usersGrowth) }}%
                    </div>
                  </div>
                </div>

                <!-- Conversion Rate -->
                <div class="col-6">
                  <div class="stat-item bg-light rounded-3 p-3">
                    <div class="small text-muted mb-1">Conversion Rate</div>
                    <div class="fs-5 fw-bold text-warning">
                      {{ quickStats.conversion }}%
                    </div>
                    <div
                      class="small"
                      :class="
                        quickStats.conversionGrowth >= 0
                          ? 'text-success'
                          : 'text-danger'
                      "
                    >
                      <i
                        :class="
                          quickStats.conversionGrowth >= 0
                            ? 'bi bi-arrow-up'
                            : 'bi bi-arrow-down'
                        "
                      ></i>
                      {{ Math.abs(quickStats.conversionGrowth) }}%
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
import { ref, reactive, onMounted, onUnmounted } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useDashboardStore } from "@/stores/DashboardStore.js";
import { useProductsStore } from "@/stores/ProductsStore.js";
import { useCategoryStore } from "@/stores/categoryStore.js";

// ── Stores ──────────────────────────────────────────
const dashboardStore = useDashboardStore();
const productsStore = useProductsStore();
const categoryStore = useCategoryStore();

// ── Local State ──────────────────────────────────────
const loading = ref(false);
const refreshingActivities = ref(false);
const selectedPeriod = ref("7days");

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

// ── Lifecycle ────────────────────────────────────────
onMounted(() => {
  loadDashboardData();
});

onUnmounted(() => {
  dashboardStore.hideToast();
});

// ── Main Data Loading (Parallel) ─────────────────────
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Load all data in parallel for better performance
    await Promise.all([
      dashboardStore.fetchStats(),
      productsStore.fetchProducts(),
      categoryStore.fetchCategories(),
      dashboardStore.fetchActivities(),
    ]);

    // Update stats from store
    updateStats();

    // Update products list
    recentProducts.value = productsStore.filteredProducts.slice(0, 5);

    // Update categories list
    recentCategories.value = categoryStore.filteredCategories.slice(0, 5);

    // Update activities list
    recentActivities.value = dashboardStore.recentActivities.slice(0, 5);

    // Update quick stats
    updateQuickStats();
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    // Toast is already shown by store
  } finally {
    loading.value = false;
  }
};

// ── Update Functions ─────────────────────────────────
const updateStats = () => {
  stats.products = dashboardStore.stats.totalProducts;
  stats.categories = dashboardStore.stats.activeCategories;
  stats.pendingPayments = dashboardStore.stats.pendingPayments;
  stats.devices = dashboardStore.stats.totalDevices;
};

const updateQuickStats = () => {
  const storeStats = dashboardStore.stats;

  quickStats.revenue = dashboardStore.formatNumber(storeStats.totalRevenue);
  quickStats.orders = storeStats.totalOrders;
  quickStats.users = storeStats.totalUsers;
  quickStats.conversion = dashboardStore.conversionRate;

  // Get growth data from store (or defaults to 0 if API doesn't provide)
  quickStats.revenueGrowth = storeStats.revenueGrowth || 0;
  quickStats.ordersGrowth = storeStats.ordersGrowth || 0;
  quickStats.usersGrowth = storeStats.usersGrowth || 0;
  quickStats.conversionGrowth = storeStats.conversionGrowth || 0;
};

// ── Event Handlers ───────────────────────────────────
const handlePeriodChange = async () => {
  try {
    await dashboardStore.changePeriod(selectedPeriod.value);
    // Optionally update quick stats if period change affects them
    updateQuickStats();
  } catch (error) {
    // Error handled by store
  }
};

const handleRefreshActivities = async () => {
  refreshingActivities.value = true;
  try {
    await dashboardStore.fetchActivities();
    recentActivities.value = dashboardStore.recentActivities.slice(0, 5);
    dashboardStore.showToast("Activities refreshed", "success");
  } catch (error) {
    // Error handled by store
  } finally {
    refreshingActivities.value = false;
  }
};

// ── Helper Functions ─────────────────────────────────
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) : text;
};

const formatPrice = (price) => {
  if (!price) return "0.00";
  return parseFloat(price).toFixed(2);
};

const getCategoryName = (categoryIds) => {
  if (!categoryIds || !Array.isArray(categoryIds)) return "N/A";

  const names = categoryIds
    .map((id) => {
      const category = recentCategories.value.find((c) => c.id === id);
      return category ? category.name : "";
    })
    .filter(Boolean);

  if (names.length === 0) return "N/A";
  if (names.length <= 2) return names.join(", ");
  return names.slice(0, 2).join(", ") + ` +${names.length - 2} more`;
};

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: "bg-success bg-opacity-10 text-success",
    inactive: "bg-secondary bg-opacity-10 text-secondary",
    pending: "bg-warning bg-opacity-10 text-warning",
    rejected: "bg-danger bg-opacity-10 text-danger",
    approved: "bg-primary bg-opacity-10 text-primary",
    published: "bg-success bg-opacity-10 text-success",
    draft: "bg-secondary bg-opacity-10 text-secondary",
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
    login: "bi bi-box-arrow-in-right",
    update: "bi bi-pencil",
    delete: "bi bi-trash",
    create: "bi bi-plus-circle",
  };
  return icons[type?.toLowerCase()] || "bi bi-activity";
};

const getActivityIconClass = (type) => {
  const classes = {
    order: "bg-primary bg-opacity-10 text-primary",
    product: "bg-success bg-opacity-10 text-success",
    user: "bg-info bg-opacity-10 text-info",
    payment: "bg-warning bg-opacity-10 text-warning",
    category: "bg-primary bg-opacity-10 text-primary",
    login: "bg-info bg-opacity-10 text-info",
    update: "bg-warning bg-opacity-10 text-warning",
    delete: "bg-danger bg-opacity-10 text-danger",
    create: "bg-success bg-opacity-10 text-success",
  };
  return classes[type?.toLowerCase()] || "bg-secondary bg-opacity-10 text-secondary";
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

const getToastIcon = (type) => {
  const icons = {
    success: "bi bi-check-circle-fill",
    error: "bi bi-exclamation-circle-fill",
    warning: "bi bi-exclamation-triangle-fill",
    info: "bi bi-info-circle-fill",
  };
  return icons[type] || icons.info;
};

const handleImageError = (event) => {
  event.target.style.display = "none";
  event.target.parentElement.innerHTML =
    '<i class="bi bi-image text-muted"></i>';
};
</script>

<style scoped>
/* ── Toast Notification ──────────────────────────── */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
}

.toast-success {
  background: linear-gradient(135deg, #198754, #157347);
}

.toast-error {
  background: linear-gradient(135deg, #dc3545, #bb2d3b);
}

.toast-warning {
  background: linear-gradient(135deg, #ffc107, #ffca2c);
  color: #212529;
}

.toast-info {
  background: linear-gradient(135deg, #0dcaf0, #0aa2c0);
  color: #212529;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* ── Stat Card Styles ────────────────────────────── */
.stat-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* ── Data Card Styles ────────────────────────────── */
.data-card {
  transition: box-shadow 0.2s ease-in-out;
}

.data-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* ── Card Header ─────────────────────────────────── */
.card-header-custom {
  background-color: #fafafa;
}

/* ── Table Styles ────────────────────────────────── */
.table thead th {
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

/* ── Category Item Styles ────────────────────────── */
.category-item {
  transition: background-color 0.2s ease-in-out;
}

.category-item:hover {
  background-color: #e9ecef !important;
}

/* ── Activity Item Styles ────────────────────────── */
.activity-item {
  transition: background-color 0.2s ease-in-out;
}

.activity-item:hover {
  background-color: #f8f9fa !important;
}

/* ── Product Thumbnail ───────────────────────────── */
.product-thumbnail {
  overflow: hidden;
}

/* ── Stat Item ───────────────────────────────────── */
.stat-item {
  transition: transform 0.2s ease-in-out;
}

.stat-item:hover {
  transform: translateY(-2px);
}

/* ── Loading Spinner ─────────────────────────────── */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* ── Spin Animation ──────────────────────────────── */
.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Responsive Adjustments ──────────────────────── */
@media (max-width: 768px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .category-item,
  .activity-item {
    padding: 0.75rem;
  }

  .toast-notification {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}

@media (max-width: 576px) {
  .card-header-custom {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start !important;
  }
}
</style>