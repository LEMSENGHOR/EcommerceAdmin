import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(({ mode }) => {
  // This loads the VITE_BASE_URL from your .env file
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/api": {
          // Make sure your .env has VITE_BASE_URL defined!
          target: env.VITE_BASE_URL,
          changeOrigin: true,
          // 1. Secure: false (helps with HTTPS targets)
          secure: false,
          // 2. Rewrite: removes '/api' before sending to the backend
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});