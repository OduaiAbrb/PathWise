/**
 * Unified API client for PathWise
 * 
 * All API calls should use this module instead of raw fetch().
 * Provides: auto base URL, auth headers, error handling, typed responses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the full API URL for an endpoint.
 * @param endpoint - e.g. "/api/v1/roadmaps" or "api/v1/auth/me"
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
}

/**
 * Build headers with optional auth token.
 */
function buildHeaders(token?: string, isJson: boolean = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/**
 * Unified fetch wrapper with error handling.
 * Use this for all API calls.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, ...fetchOptions } = options;
  const url = getApiUrl(endpoint);
  const isFormData = fetchOptions.body instanceof FormData;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...buildHeaders(token, !isFormData),
      ...(fetchOptions.headers || {}),
    },
  });

  return response;
}

/**
 * Typed JSON GET request.
 */
export async function apiGet<T = any>(
  endpoint: string,
  token?: string
): Promise<{ success: boolean; data: T }> {
  const res = await apiFetch(endpoint, { token });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `API Error: ${res.status}`);
  }
  return res.json();
}

/**
 * Typed JSON POST request.
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  token?: string
): Promise<{ success: boolean; data: T }> {
  const isFormData = body instanceof FormData;
  const res = await apiFetch(endpoint, {
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
    token,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `API Error: ${res.status}`);
  }
  return res.json();
}

/**
 * @deprecated Use apiFetch, apiGet, or apiPost instead.
 * Kept for backward compatibility during migration.
 */
export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}

