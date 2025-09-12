import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api/chat/stream": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Proxying SSE request:", req.url);
            // 确保正确的 SSE headers
            proxyReq.setHeader("Accept", "text/event-stream");
            proxyReq.setHeader("Cache-Control", "no-cache");
            proxyReq.setHeader("Connection", "keep-alive");
          });

          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 确保响应头正确
            proxyRes.headers["access-control-allow-origin"] = "*";
            proxyRes.headers["access-control-allow-credentials"] = "true";
          });
        }
      },
      // "/api": "https://chartaitest.onrender.com"
      "/api": "http://127.0.0.1:8000/",
      "/events": "http://127.0.0.1:8000/"
    }
  }
});
