import type { ApiError, ApiResult, ApiSuccess } from "../types/api";

type ApiOptions = RequestInit & {
  headers?: HeadersInit;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
  const headers =
    options.body instanceof FormData
      ? options.headers || {}
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        };

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem("auth");
    return {
      success: false,
      status: res.status,
      error: "Unauthorized - redirecting to login",
    } satisfies ApiError;
  }

  if (!res.ok) {
    const message = await res.text();
    return {
      success: false,
      status: res.status,
      error: message || res.statusText,
    } satisfies ApiError;
  }

  if (res.status === 204) {
    return {
      success: true,
      status: res.status,
      data: null as T,
    } satisfies ApiSuccess<T>;
  }

  return {
    success: true,
    status: res.status,
    data: (await res.json()) as T,
  } satisfies ApiSuccess<T>;
}

export function unwrapApi<T>(result: ApiResult<T>): T {
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.data;
}
