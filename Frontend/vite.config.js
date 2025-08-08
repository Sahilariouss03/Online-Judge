import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // Proxy API requests to backend during development
        "/api": {
          target:
            mode === "development"
              ? "http://localhost:3000"
              : env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: mode === "production",
        },
      },
    },
    define: {
      // Make env variables available to the app
      __COMPILER_URL__: JSON.stringify(env.VITE_COMPILER_URL || ""),
      __BACKEND_URL__: JSON.stringify(env.VITE_BACKEND_URL || ""),
      __API_TIMEOUT__: JSON.stringify(env.VITE_API_TIMEOUT || 30000),
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});
