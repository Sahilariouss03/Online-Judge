// Utility function to ensure consistent API URL formatting without double slashes
export const getApiUrl = (path) => {
  if (!import.meta.env.VITE_BACKEND_URL) {
    console.error("Backend URL is not defined in environment variables");
    throw new Error("Backend URL is not configured");
  }

  // Remove trailing slashes from base URL and clean up any double slashes
  const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "").replace(
    /([^:]\/)\/+/g,
    "$1"
  );

  // Remove leading slashes from path and clean up any double slashes
  const cleanPath = path.replace(/^\/+/, "").replace(/\/+/g, "/");

  // Join with single slash
  const finalUrl = `${baseUrl}/${cleanPath}`;

  // Debug log
  console.debug("API URL Generated:", {
    originalPath: path,
    baseUrl: baseUrl,
    cleanPath: cleanPath,
    finalUrl: finalUrl,
  });

  return finalUrl;
};

// Utility function to get axios config with credentials
export const getAxiosConfig = () => ({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
