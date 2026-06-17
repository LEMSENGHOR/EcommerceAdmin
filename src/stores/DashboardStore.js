import { defineStore } from "pinia";
import { ref } from "vue";
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

  // ── Helpers ─────────────────────────────────────────
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("km-KH", {
      style: "currency",
      currency: "KHR",
    }).format(amount);
  };

  // ── 1. FETCH DASHBOARD STATISTICS ───────────────────
  //    GET /dashboard/stats
  const fetchStats = async () => {
    loading.value = true;
    try {
      const res = await api.get("/dashboard/stats");
      const data = res.data.data || res.data;

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
    } catch (err) {
      console.error("fetchStats error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── 2. FETCH RECENT ACTIVITIES ─────────────────────
  //    GET /dashboard/activities
  const fetchActivities = async () => {
    try {
      const res = await api.get("/dashboard/activities");
      recentActivities.value = res.data.data || res.data || [];
    } catch (err) {
      console.error("fetchActivities error:", err);
      throw err;
    }
  };

  // ── 3. FETCH RECENT ORDERS ─────────────────────────
  //    GET /dashboard/recent-orders
  const fetchRecentOrders = async (limit = 5) => {
    try {
      const res = await api.get("/dashboard/recent-orders", {
        params: { limit },
      });
      recentOrders.value = res.data.data || res.data || [];
    } catch (err) {
      console.error("fetchRecentOrders error:", err);
      throw err;
    }
  };

  // ── 4. FETCH TOP PRODUCTS ──────────────────────────
  //    GET /dashboard/top-products
  const fetchTopProducts = async (limit = 5) => {
    try {
      const res = await api.get("/dashboard/top-products", {
        params: { limit },
      });
      topProducts.value = res.data.data || res.data || [];
    } catch (err) {
      console.error("fetchTopProducts error:", err);
      throw err;
    }
  };

  // ── 5. FETCH SALES CHART DATA ───────────────────────
  //    GET /dashboard/sales-chart
  const fetchSalesChart = async (period = "7days") => {
    try {
      const res = await api.get("/dashboard/sales-chart", {
        params: { period },
      });
      const data = res.data.data || res.data;

      salesChart.value = {
        labels: data.labels || [],
        data: data.values || [],
      };
    } catch (err) {
      console.error("fetchSalesChart error:", err);
      throw err;
    }
  };

  // ── 6. FETCH ORDERS CHART DATA ──────────────────────
  //    GET /dashboard/orders-chart
  const fetchOrdersChart = async (period = "7days") => {
    try {
      const res = await api.get("/dashboard/orders-chart", {
        params: { period },
      });
      const data = res.data.data || res.data;

      ordersChart.value = {
        labels: data.labels || [],
        data: data.values || [],
      };
    } catch (err) {
      console.error("fetchOrdersChart error:", err);
      throw err;
    }
  };

  // ── 7. REFRESH ALL DASHBOARD DATA ───────────────────
  const refreshDashboard = async () => {
    refreshing.value = true;
    try {
      await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchRecentOrders(),
        fetchTopProducts(),
        fetchSalesChart(),
        fetchOrdersChart(),
      ]);
    } catch (err) {
      console.error("refreshDashboard error:", err);
      throw err;
    } finally {
      refreshing.value = false;
    }
  };

  // ── 8. QUICK ACTIONS ────────────────────────────────
  const quickStats = async () => {
    try {
      await fetchStats();
    } catch (err) {
      console.error("quickStats error:", err);
      throw err;
    }
  };

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

    // Actions
    fetchStats,
    fetchActivities,
    fetchRecentOrders,
    fetchTopProducts,
    fetchSalesChart,
    fetchOrdersChart,
    refreshDashboard,
    quickStats,
    formatCurrency,
  };
});
