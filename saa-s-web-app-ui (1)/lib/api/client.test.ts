import { beforeEach, describe, expect, it, vi } from "vitest"

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response
}

describe("api client base URL normalization", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("uses /api fallback when env is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const { api } = await import("./client")
    await api.get("/auth/me/")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me/",
      expect.objectContaining({ method: "GET" })
    )
  })

  it("appends /api for path-style base URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "/backend")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const { api } = await import("./client")
    await api.get("/auth/me/")

    expect(fetchMock).toHaveBeenCalledWith(
      "/backend/api/auth/me/",
      expect.objectContaining({ method: "GET" })
    )
  })

  it("trims trailing slash for /api env values", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "/api/")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const { api } = await import("./client")
    await api.get("/auth/me/")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me/",
      expect.objectContaining({ method: "GET" })
    )
  })

  it("keeps absolute API URLs untouched", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8000/api/")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)

    const { api } = await import("./client")
    await api.get("/auth/me/")

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/auth/me/",
      expect.objectContaining({ method: "GET" })
    )
  })
})
