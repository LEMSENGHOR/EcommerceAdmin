// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.DEV
//     ? "/api" // Dev → Vite proxy (bypasses CORS)
//     : import.meta.env.VITE_BASE_URL, // Prod → direct URL from .env
//   headers: {
//     // "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
//   timeout: 10000,
// });

// // Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && window.location.pathname !== '/login') {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api-loukbontor.g2.ant.com.kh/api', // adjust to your actual base URL
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request: attach Bearer token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response: handle 401 globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api