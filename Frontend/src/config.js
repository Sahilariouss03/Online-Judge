const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  compilerUrl: import.meta.env.VITE_COMPILER_URL,
  apiTimeout: import.meta.env.VITE_API_TIMEOUT || 30000,
};

export default config;
