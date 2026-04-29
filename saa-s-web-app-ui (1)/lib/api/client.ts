import type { ApiError } from "@/lib/types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001/api"

function getCsrfToken() {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
  return match ? decodeURIComponent(match.split("=")[1]) : null
}

async function ensureCsrfCookie() {
  await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  })
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    return res.ok
  } catch {
    return false
  }
}

async function handleResponse(res: Response) {
  if (res.ok) {
    if (res.status === 204) return null
    return res.json()
  }

  let body: Record<string, unknown> = {}
  try {
    body = await res.json()
  } catch {
    // empty
  }

  const error: ApiError = {
    message:
      (body.detail as string) ||
      (body.message as string) ||
      `Request failed with status ${res.status}`,
    status: res.status,
  }

  const fieldErrors: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(body)) {
    if (key !== "detail" && key !== "message" && Array.isArray(value)) {
      fieldErrors[key] = value as string[]
    }
  }
  if (Object.keys(fieldErrors).length > 0) {
    error.fieldErrors = fieldErrors
  }

  throw error
}

async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const method = (options.method || "GET").toUpperCase()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json"
    if (!headers["X-CSRFToken"]) {
      let csrfToken = getCsrfToken()
      if (!csrfToken) {
        await ensureCsrfCookie()
        csrfToken = getCsrfToken()
      }
      if (csrfToken) headers["X-CSRFToken"] = csrfToken
    }
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (res.status === 401 && endpoint !== "/auth/refresh/") {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      })
    } else if (typeof window !== "undefined") {
      window.location.href = "/login"
      throw { message: "Session expired", status: 401 } as ApiError
    }
  }

  return handleResponse(res)
}

export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: unknown, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: unknown, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: (endpoint: string, data?: unknown, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    request(endpoint, { ...options, method: "DELETE" }),
}

export function unwrapPaginated<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results
  }
  return []
}
