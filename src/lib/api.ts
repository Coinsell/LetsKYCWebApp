const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://letskycapi.agreeabledune-9ad96245.southeastasia.azurecontainerapps.io';

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  // Ensure there's no double slash in the URL
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  // console.log(`API Request: ${method} ${fullUrl}`);
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 404) {
      throw new Error(`Endpoint not found: ${fullUrl}. Please ensure the backend API is deployed with the latest routes.`);
    }
    throw new Error(`API error: ${response.status} – ${errText}`);
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>("GET", path),
  post: <T>(path: string, data?: any) => apiRequest<T>("POST", path, data),
  put: <T>(path: string, data?: any) => apiRequest<T>("PUT", path, data),
  delete: <T>(path: string) => apiRequest<T>("DELETE", path),
};
