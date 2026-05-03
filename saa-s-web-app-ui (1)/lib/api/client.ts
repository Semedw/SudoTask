import type { ApiError } from "@/lib/types"

function normalizeApiBaseUrl(rawBaseUrl?: string) {
  const fallbackBase = "/api"
  const base = (rawBaseUrl || fallbackBase).trim()
  const withoutTrailingSlash = base.replace(/\/+$/, "")

  if (!withoutTrailingSlash) return fallbackBase

  // Keep absolute URLs untouched except for trailing slash cleanup.
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash
  }

  const withLeadingSlash = withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`

  if (withLeadingSlash === "/api" || withLeadingSlash.startsWith("/api/")) {
    return withLeadingSlash
  }

  return `${withLeadingSlash}/api`
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)

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

  const normalizedEndpoint = normalizeEndpoint(endpoint)

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

  const url = `${API_BASE_URL}${normalizedEndpoint}`

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })

  if (res.status === 401 && endpoint !== "/auth/refresh/") {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
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

function normalizeEndpoint(endpoint: string) {
  if (!endpoint) return "/"

  const hasQuery = endpoint.includes("?")
  const [rawPath, queryString = ""] = endpoint.split("?", 2)
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`
  const normalizedPath = path.endsWith("/") ? path : `${path}/`

  if (!hasQuery) return normalizedPath
  return `${normalizedPath}?${queryString}`
}

export function unwrapPaginated<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T[] }).results
  }
  return []
}
