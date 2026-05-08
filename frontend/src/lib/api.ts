const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("certichain.jwt") : null;

  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}
