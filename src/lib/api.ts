const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://letskyc.whitewater-a437d539.southeastasia.azurecontainerapps.io';

console.log("🔗 API Base URL:", API_BASE_URL);
console.log("🔗 Environment VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  // Ensure there's no double slash in the URL
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  console.log(`🌐 API Request: ${method} ${fullUrl}`);
  if (data) {
    console.log(`📤 Request data:`, data);
  }
  
  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  console.log(`📡 Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errText = await response.text();
    console.log(`❌ API Error Response:`, errText);
    if (response.status === 404) {
      throw new Error(`Endpoint not found: ${fullUrl}. Please ensure the backend API is deployed with the latest routes.`);
    }
    throw new Error(`API error: ${response.status} – ${errText}`);
  }

  const responseData = await response.json();
  console.log(`✅ API Success Response:`, responseData);
  return responseData as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>("GET", path),
  post: <T>(path: string, data?: any) => apiRequest<T>("POST", path, data),
  put: <T>(path: string, data?: any) => apiRequest<T>("PUT", path, data),
  delete: <T>(path: string) => apiRequest<T>("DELETE", path),
};
