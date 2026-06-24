import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/Authstore.js";
import Login from "../views/Login.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import Dashboard from "@/views/Dashboard.vue";
import Products from "@/views/Products.vue";
import Devices from "../views/Devices.vue";
import Carts from "@/views/Carts.vue";
import Payments from "../views/Payments.vue";
import Profile from "../views/Profile.vue";
import Categories from "../views/Categories.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "Dashboard",
          component: Dashboard,
          meta: { pageTitle: "ផ្ទាំងគ្រប់គ្រង" },
        },
        {
          path: "products",
          name: "products",
          component: Products,
          meta: { pageTitle: "ផលិតផល" },
        },
        {
          path: "categories",
          name: "categories",
          component: Categories,
          meta: { pageTitle: "ប្រភេទផលិតផល" },
        },
        {
          path: "devices",
          name: "devices",
          component: Devices,
          meta: { pageTitle: "ឧបករណ៍" },
        },
        {
          path: "carts",
          name: "carts",
          component: Carts,
          meta: { pageTitle: "រទេះទំនិញ" },
        },
        {
          path: "payments",
          name: "payments",
          component: Payments,
          meta: { pageTitle: "ការទូទាត់" },
        },
        {
          path: "profile",
          name: "profile",
          component: Profile,
          meta: { pageTitle: "ប្រវត្តិរូប" },
        },
      ],
      // children: [
      //   {
      //     path: "",
      //     name: "Dashboard",
      //     component: Dashboard,
      //   },
      //   {
      //     path: "products",
      //     name: "products",
      //     component: Products,
      //   },
      //   {
      //     path: "devices",
      //     name: "devices",
      //     component: Devices,
      //   },
      //   {
      //     path: "categories",
      //     name: "categories",
      //     component: Categories,
      //     meta: { pageTitle: "ប្រភេទផលិតផល" },
      //   },
      //   {
      //     path: "carts",
      //     name: "carts",
      //     component: Carts,
      //   },
      //   {
      //     path: "payments", // ✅ moved inside AdminLayout children
      //     name: "payments",
      //     component: Payments,
      //   },
      //   {
      //     path: "profile", // ✅ moved inside AdminLayout children
      //     name: "profile",
      //     component: Profile,
      //   },
      // ],
    },
  ],
});

// ── Navigation Guard ──
router.beforeEach((to) => {
  const authStore = useAuthStore();

  // 1. Protect Admin Layout and all its children
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return "/login";
    }

    // TEMPORARY FIX: Check by email or ID since backend doesn't send 'role'
    const isAdmin =
      authStore.user?.email === "chandalen@gmail.com" ||
      authStore.user?.id === 1;

    if (!isAdmin) {
      authStore.logout();
      return "/login";
    }
  }

  // 2. If logged in and trying to go to /login, send to dashboard
  if (to.path === "/login" && authStore.isAuthenticated) {
    return "/";
  }

  return true;
});

export default router;
