import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";

export const useDashboardStore = defineStore("dashboard", () => {
  // ── State ──────────────────────────────────────────
  const stats = ref({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeCategories: 0,
    totalDevices: 0,
    pendingPayments: 0,
  });

  const recentActivities = ref([]);
  const recentOrders = ref([]);
  const topProducts = ref([]);

  // ── Charts Data ─────────────────────────────────────
  const salesChart = ref({
    labels: [],
    data: [],
  });

  const ordersChart = ref({
    labels: [],
    data: [],
  });

  // ── UI Flags ────────────────────────────────────────
  const loading = ref(false);
  const refreshing = ref(false);

  // ── Toast State ────────────────────────────────────
  const toast = ref({
    show: false,
    message: "",
    type: "success",
  });

  // ── Helpers ─────────────────────────────────────────
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("km-KH", {
        style: "currency",
        currency: "KHR",
      }).format(amount);
    } catch (err) {
      console.error("Currency formatting error:", err);
      return "១" + (amount || "0");
    }
  };

  // ── Toast Helper ────────────────────────────────────
  const showToast = (message, type = "success") => {
    toast.value = { show: true, message, type };
    setTimeout(() => {
      toast.value.show = false;
    }, 3000);
  };

  // ── Error Handler ─────────────────────────────────────
  const handleError = (err, fallbackMessage) => {
    console.error("Dashboard Error:", err);
    console.error("Error Details:", {
      message: err.message,
      response: err.response,
      config: err.config,
      request: err.request,
    });

    const status = err.response?.status;
    const message = err.response?.data?.message || fallbackMessage;

    // Handle different error types
    if (status === 401) {
      showToast("Session expired. Please login again.", "error");
      return;
    }

    if (status === 403) {
      showToast("You don't have permission to access this action.", "error");
      return;
    }

    if (status === 404) {
      showToast("Requested resource not found.", "error");
      return;
    }

    if (status === 500) {
      showToast("Server error. Please try again.", "error");
      return;
    }

    // Default error
    showToast(message, "error");
  };

  // ───────────────────────────────────────────────
  // 1. FETCH DASHBOARD STATISTICS
  //    GET /dashboard/stats
  // ───────────────────────────────────────────────
  const fetchStats = async () => {
    loading.value = true;
    try {
      console.log("Fetching dashboard stats...");

      const res = await api.get("/dashboard/stats");
      console.log("Stats response:", res);

      // Support multiple response formats
      const data = res.data.data || res.data;
      console.log("Parsed data:", data);

      // Validate data
      if (!data) {
        throw new Error("No data received from API");
      }

      stats.value = {
        totalUsers: data.total_users || 0,
        totalProducts: data.total_products || 0,
        totalOrders: data.total_orders || 0,
        totalRevenue: data.total_revenue || 0,
        pendingOrders: data.pending_orders || 0,
        activeCategories: data.active_categories || 0,
        totalDevices: data.total_devices || 0,
        pendingPayments: data.pending_payments || 0,
      };

      console.log("Stats updated:", stats.value);
    } catch (err) {
      handleError(err, "Failed to load dashboard statistics");
    } finally {
      loading.value = false;
    }
  };

  // ───────────────────────────────────────────────
  // 2. FETCH RECENT ACTIVITIES
  //    GET /dashboard/activities
  // ───────────────────────────────────────────────
  const fetchActivities = async () => {
    try {
      console.log("Fetching recent activities...");
      const res = await api.get("/dashboard/activities");
      console.log("Activities response:", res);

      const data = res.data.data || res.data;
      recentActivities.value = Array.isArray(data) ? data : [];

      console.log("Activities loaded:", recentActivities.value.length);
    } catch (err) {
      handleError(err, "Failed to load recent activities");
    }
  };

  // ───────────────────────────────────────────────
  // 3. FETCH RECENT ORDERS
  //    GET /dashboard/recent-orders
  // ───────────────────────────────────────────────
  const fetchRecentOrders = async (limit = 5) => {
    try {
      console.log("Fetching recent orders...");
      const res = await api.get("/dashboard/recent-orders", {
        params: { limit },
      });
      console.log("Orders response:", res);

      const data = res.data.data || res.data;
      recentOrders.value = Array.isArray(data) ? data : [];

      console.log("Orders loaded:", recentOrders.value.length);
    } catch (err) {
      handleError(err, "Failed to load recent orders");
    }
  };

  // ───────────────────────────────────────────────
  // 4. FETCH TOP PRODUCTS
  //    GET /dashboard/top-products
  // ───────────────────────────────────────────────
  const fetchTopProducts = async (limit = 5) => {
    try {
      console.log("Fetching top products...");
      const res = await api.get("/dashboard/top-products", {
        params: { limit },
      });
      console.log("Products response:", res);

      const data = res.data.data || res.data;
      topProducts.value = Array.isArray(data) ? data : [];

      console.log("Top products loaded:", topProducts.value.length);
    } catch (err) {
      handleError(err, "Failed to load top products");
    }
  };

  // ───────────────────────────────────────────────
  // 5. FETCH SALES CHART DATA
  //    GET /dashboard/sales-chart
  // ───────────────────────────────────────────────
  const fetchSalesChart = async (period = "7days") => {
    try {
      console.log(`Fetching sales chart for period: ${period}`);
      const res = await api.get("/dashboard/sales-chart", {
        params: { period },
      });
      console.log("Sales chart response:", res);

      const data = res.data.data || res.data;
      console.log("Sales chart data:", data);

      salesChart.value = {
        labels: data.labels || [],
        data: data.values || [],
      };
    } catch (err) {
      handleError(err, "Failed to load sales chart");
    }
  };

  // ───────────────────────────────────────────────
  // 6. FETCH ORDERS CHART DATA
  //    GET /dashboard/orders-chart
  // ───────────────────────────────────────────────
  const fetchOrdersChart = async (period = "7days") => {
    try {
      console.log(`Fetching orders chart for period: ${period}`);
      const res = await api.get("/dashboard/orders-chart", {
        params: { period },
      });
      console.log("Orders chart response:", res);

      const data = res.data.data || res.data;
      console.log("Orders chart data:", data);

      ordersChart.value = {
        labels: data.labels || [],
        data: data.values || [],
      };
    } catch (err) {
      handleError(err, "Failed to load orders chart");
    }
  };

  // ───────────────────────────────────────────────
  // 7. REFRESH ALL DASHBOARD DATA
  // ───────────────────────────────────────────────
  const refreshDashboard = async () => {
    refreshing.value = true;
    showToast("កំពុង dashboard...", "info");

    try {
      await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchRecentOrders(),
        fetchTopProducts(),
        fetchSalesChart(),
        fetchOrdersChart(),
      ]);

      showToast("Dashboard refreshed successfully", "success");
    } catch (err) {
      handleError(err, "Failed to refresh dashboard");
    } finally {
      refreshing.value = false;
    }
  };

  // ───────────────────────────────────────────────
  // 8. QUICK STATS
  // ───────────────────────────────────────────────
  const quickStats = async () => {
    try {
      await fetchStats();
    } catch (err) {
      handleError(err, "Failed to load statistics");
    }
  };

  // ───────────────────────────────────────────────
  // 9. GET TOTAL REVENUE (computed helper)
  // ───────────────────────────────────────────────
  const totalRevenue = computed(() => {
    return formatCurrency(stats.value.totalRevenue);
  });

  // ───────────────────────────────────────────────
  // 10. GET ACTIVE COUNT (computed helper)
  // ───────────────────────────────────────────────
  const activeCategoriesCount = computed(() => {
    return stats.value.activeCategories;
  });

  // ───────────────────────────────────────────────
  // 11. GET PENDING COUNT (computed helper)
  // ───────────────────────────────────────────────
  const pendingOrdersCount = computed(() => {
    return stats.value.pendingOrders;
  });

  return {
    // ── State ──────────────────────
    stats,
    recentActivities,
    recentOrders,
    topProducts,
    salesChart,
    ordersChart,
    loading,
    refreshing,
    toast,

    // ── Helpers ───────────────────────────────
    formatCurrency,
    showToast,

    // ── Actions ──────────────────────────────
    fetchStats,
    fetchActivities,
    fetchRecentOrders,
    fetchTopProducts,
    fetchSalesChart,
    fetchOrdersChart,
    refreshDashboard,
    quickStats,

    // ── Computed ─────────────────────────────
    totalRevenue,
    activeCategoriesCount,
    pendingOrdersCount,
  };
});
