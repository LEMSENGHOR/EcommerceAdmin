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
    // Growth percentages (should come from API)
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    conversionGrowth: 0,
  });

  const recentActivities = ref([]);
  const recentOrders = ref([]);
  const topProducts = ref([]);
  const salesChart = ref({ labels: [], data: [] });
  const ordersChart = ref({ labels: [], data: [] });

  // ── UI Flags ────────────────────────────────────────
  const loading = ref(false);
  const refreshing = ref(false);
  const toast = ref({ show: false, message: "", type: "success" });

  // ── Selected Period ─────────────────────────────────
  const selectedPeriod = ref("7days");

  // ── Helpers ─────────────────────────────────────────
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("km-KH", {
        style: "currency",
        currency: "KHR",
      }).format(amount);
    } catch (err) {
      return "៛" + (amount || "0");
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  const showToast = (message, type = "success") => {
    toast.value = { show: true, message, type };
    setTimeout(() => (toast.value.show = false), 3000);
  };

  const hideToast = () => {
    toast.value.show = false;
  };

  const handleError = (err, fallbackMessage) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || fallbackMessage;

    if (status === 401) {
      return showToast("Session expired. Please login again.", "error");
    }
    if (status === 403) {
      return showToast("You don't have permission.", "error");
    }
    if (status === 404) {
      return showToast("Requested resource not found.", "error");
    }
    if (status >= 500) {
      return showToast("Server error. Please try again.", "error");
    }

    showToast(message || fallbackMessage, "error");
  };

  // ───────────────────────────────────────────────
  // 1. FETCH STATS
  // ───────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      const data = res.data.data || res.data;
      if (!data) throw new Error("No data received");

      stats.value = {
        totalUsers: data.total_users || 0,
        totalProducts: data.total_products || 0,
        totalOrders: data.total_orders || 0,
        totalRevenue: data.total_revenue || 0,
        pendingOrders: data.pending_orders || 0,
        activeCategories: data.active_categories || 0,
        totalDevices: data.total_devices || 0,
        pendingPayments: data.pending_payments || 0,
        // Growth data - from API if available
        revenueGrowth: data.revenue_growth || 0,
        ordersGrowth: data.orders_growth || 0,
        usersGrowth: data.users_growth || 0,
        conversionGrowth: data.conversion_growth || 0,
      };
    } catch (err) {
      handleError(err, "Failed to load statistics");
      throw err; // Re-throw to let caller handle
    }
  };

  // ───────────────────────────────────────────────
  // 2. FETCH ACTIVITIES
  // ───────────────────────────────────────────────
  const fetchActivities = async () => {
    try {
      const res = await api.get("/dashboard/activities");
      recentActivities.value = res.data.data || res.data || [];
    } catch (err) {
      handleError(err, "Failed to load activities");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // 3. FETCH RECENT ORDERS
  // ───────────────────────────────────────────────
  const fetchRecentOrders = async (limit = 5) => {
    try {
      const res = await api.get("/dashboard/recent-orders", {
        params: { limit },
      });
      recentOrders.value = res.data.data || res.data || [];
    } catch (err) {
      handleError(err, "Failed to load recent orders");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // 4. FETCH TOP PRODUCTS
  // ───────────────────────────────────────────────
  const fetchTopProducts = async (limit = 5) => {
    try {
      const res = await api.get("/dashboard/top-products", {
        params: { limit },
      });
      topProducts.value = res.data.data || res.data || [];
    } catch (err) {
      handleError(err, "Failed to load top products");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // 5. FETCH SALES CHART
  // ───────────────────────────────────────────────
  const fetchSalesChart = async (period = null) => {
    const selectedPeriodValue = period || selectedPeriod.value;
    try {
      const res = await api.get("/dashboard/sales-chart", {
        params: { period: selectedPeriodValue },
      });
      const data = res.data.data || res.data;

      salesChart.value = {
        labels: data.labels || [],
        data: data.values || data.data || [],
      };
    } catch (err) {
      handleError(err, "Failed to load sales chart");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // 6. FETCH ORDERS CHART
  // ───────────────────────────────────────────────
  const fetchOrdersChart = async (period = null) => {
    const selectedPeriodValue = period || selectedPeriod.value;
    try {
      const res = await api.get("/dashboard/orders-chart", {
        params: { period: selectedPeriodValue },
      });
      const data = res.data.data || res.data;

      ordersChart.value = {
        labels: data.labels || [],
        data: data.values || data.data || [],
      };
    } catch (err) {
      handleError(err, "Failed to load orders chart");
      throw err;
    }
  };

  // ───────────────────────────────────────────────
  // 7. CHANGE PERIOD
  // ───────────────────────────────────────────────
  const changePeriod = async (period) => {
    selectedPeriod.value = period;
    try {
      await Promise.all([fetchSalesChart(period), fetchOrdersChart(period)]);
    } catch (err) {
      // Error already handled in individual fetch
    }
  };

  // ───────────────────────────────────────────────
  // 8. REFRESH ALL DATA
  // ───────────────────────────────────────────────
  const refreshDashboard = async () => {
    refreshing.value = true;
    showToast("Refreshing dashboard...", "info");

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
  // 9. COMPUTED PROPERTIES
  // ───────────────────────────────────────────────
  const totalRevenue = computed(() => formatCurrency(stats.value.totalRevenue));
  const totalRevenueFormatted = computed(() =>
    formatNumber(stats.value.totalRevenue),
  );
  const activeCategoriesCount = computed(() => stats.value.activeCategories);
  const pendingOrdersCount = computed(() => stats.value.pendingOrders);
  const conversionRate = computed(() => {
    if (!stats.value.totalOrders || !stats.value.totalUsers) return 0;
    return ((stats.value.totalOrders / stats.value.totalUsers) * 100).toFixed(
      1,
    );
  });

  return {
    // State
    stats,
    recentActivities,
    recentOrders,
    topProducts,
    salesChart,
    ordersChart,
    loading,
    refreshing,
    toast,
    selectedPeriod,

    // Helpers
    formatCurrency,
    formatNumber,
    showToast,
    hideToast,
    handleError,

    // Actions
    fetchStats,
    fetchActivities,
    fetchRecentOrders,
    fetchTopProducts,
    fetchSalesChart,
    fetchOrdersChart,
    changePeriod,
    refreshDashboard,

    // Computed
    totalRevenue,
    totalRevenueFormatted,
    activeCategoriesCount,
    pendingOrdersCount,
    conversionRate,
  };
});
