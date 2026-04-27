import { api, unwrapPaginated } from "./client"
import type { ClassRoom, ClassMembership, LeaderboardEntry, ClassAnalytics } from "@/lib/types"

export async function getClasses() {
  const data = await api.get("/classes/")
  return unwrapPaginated<ClassRoom>(data)
}

export async function createClass(payload: { name: string; description?: string }) {
  return (await api.post("/classes/", payload)) as ClassRoom
}

export async function getClass(classId: number) {
  return (await api.get(`/classes/${classId}/`)) as ClassRoom
}

export async function updateClass(
  classId: number,
  payload: { name?: string; description?: string }
) {
  return (await api.patch(`/classes/${classId}/`, payload)) as ClassRoom
}

export async function deleteClass(classId: number) {
  return await api.delete(`/classes/${classId}/`)
}

export async function regenerateClassCode(classId: number) {
  return (await api.post(`/classes/${classId}/regenerate_code/`)) as {
    class_code: string
  }
}

export async function joinClass(payload: { class_code: string }) {
  return (await api.post("/classes/join/", payload)) as ClassMembership
}

export async function getLeaderboard(classId: number) {
  return (await api.get(`/classes/${classId}/leaderboard/`)) as {
    classroom: ClassRoom
    leaderboard: LeaderboardEntry[]
  }
}

export async function getClassAnalytics(classId: number) {
  return (await api.get(`/classes/${classId}/analytics/`)) as ClassAnalytics
}
