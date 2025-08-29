const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (!response.ok) {
    const errText = await response.text();
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
