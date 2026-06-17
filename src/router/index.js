import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
// import AdminLayout from '@/layouts/AdminLayout.vue'
import Products from "@/views/Products.vue";
import Categories from "@/views/Categories.vue";
import Devices from "@/views/Devices.vue";
// import AdminLayouts from '@/layouts/AdminLayout.vue'
import Profile from "@/views/Profile.vue";
import Carts from "@/views/Carts.vue";
import Login from "@/views/Login.vue";
import Payments from "@/views/Payments.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
      // meta: { requiresAuth: true },
    },
    {
      path: "/categories",
      name: "categories",
      component: Categories,
    },
    {
      path: "/products",
      name: "products",
      component: Products,
    },
    {
      path: "/devices",
      name: "devices",
      component: Devices,
    },
    {
      path: "/carts",
      name: "carts",
      component: Carts,
    },
    {
      path: "/payments",
      name: "payments",
      component: Payments,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
    }
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: () => import('@/views/NotFound.vue'),
    // }
  ],
});
// router.beforeEach((to, from) => {
//   const token = localStorage.getItem('token')

//   if (to.meta.requiresAuth && !token) {
//     // Not logged in → redirect to login
//     return { name: 'login' }
//   }

//   if (to.meta.guest && token) {
//     // Already logged in → redirect to dashboard
//     return { name: 'dashboard' }
//   }

//   return true
// })
export default router;
