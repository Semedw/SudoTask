import { api } from "./client"
import type { User } from "@/lib/types"

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  username: string
  password: string
  password2: string
  role: string
  first_name: string
  last_name: string
}

interface AuthResponse {
  user: User
}

export async function login(payload: LoginPayload) {
  return (await api.post("/auth/login/", payload)) as AuthResponse
}

export async function register(payload: RegisterPayload) {
  return (await api.post("/auth/register/", payload)) as AuthResponse
}

export async function getMe() {
  return (await api.get("/auth/me/")) as User
}

export async function updateProfile(data: Partial<User>) {
  return (await api.patch("/auth/me/update/", data)) as User
}

export async function logout() {
  await api.post("/auth/logout/")
}
