// Utility function to ensure consistent API URL formatting
export const getApiUrl = (path) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

// Utility function to get axios config with credentials
export const getAxiosConfig = () => ({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
