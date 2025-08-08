// Utility function to ensure consistent API URL formatting without double slashes
export const getApiUrl = (path) => {
    // Remove trailing slashes from base URL and clean up any double slashes
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '').replace(/([^:]\/)\/+/g, '$1');
    
    // Remove leading slashes from path and clean up any double slashes
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+/g, '/');
    
    // Join with single slash
    return `${baseUrl}/${cleanPath}`;
};

// Utility function to get axios config with credentials
export const getAxiosConfig = () => ({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
