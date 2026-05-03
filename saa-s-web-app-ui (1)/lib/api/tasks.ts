import { api, unwrapPaginated } from "./client"
import type { Task, TestCase, Criteria } from "@/lib/types"

export async function getTasks(classId?: number) {
  const base = "/tasks/"
  const params = classId ? `?class_id=${classId}` : ""
  const data = await api.get(`${base}${params}`)
  return unwrapPaginated<Task>(data)
}

export async function getTask(id: number) {
  return (await api.get(`/tasks/${id}/`)) as Task
}

export async function createTask(payload: {
  
  classroom_id: number
  title: string
  description: string
  difficulty?: string
  tags?: string[]
  deadline?: string | null
}) {
  return (await api.post("/tasks/", payload)) as Task
}

export async function updateTask(
  id: number,
  payload: Partial<{
    title: string
    description: string
    difficulty: string
    tags: string[]
    deadline: string | null
  }>
) {
  return (await api.patch(`/tasks/${id}/`, payload)) as Task
}

export async function deleteTask(id: number) {
  return await api.delete(`/tasks/${id}/`)
}

export async function getTestCases(taskId: number) {
  const data = await api.get(`/tasks/testcases/?task_id=${taskId}`)
  return unwrapPaginated<TestCase>(data)
}

export async function addTestCase(
  taskId: number,
  payload: {
    input_data: string
    expected_output: string
    is_hidden?: boolean
    weight_points?: number
    order?: number
  }
) {
  return (await api.post("/tasks/testcases/", {
    task: taskId,
    ...payload,
  })) as TestCase
}

export async function updateTestCase(
  id: number,
  payload: Partial<{
    input_data: string
    expected_output: string
    is_hidden: boolean
    weight_points: number
    order: number
  }>
) {
  return (await api.patch(`/tasks/testcases/${id}/`, payload)) as TestCase
}

export async function deleteTestCase(id: number) {
  return await api.delete(`/tasks/testcases/${id}/`)
}

export async function getCriteria(taskId: number) {
  return (await api.get(`/tasks/criteria/?task_id=${taskId}`)) as Criteria[]
}

export async function addCriteria(
  taskId: number,
  payload: { name: string; points: number; description?: string }
) {
  return (await api.post("/tasks/criteria/", {
    task: taskId,
    ...payload,
  })) as Criteria
}

export async function updateCriteria(
  id: number,
  payload: Partial<{ name: string; points: number; description: string }>
) {
  return (await api.patch(`/tasks/criteria/${id}/`, payload)) as Criteria
}

export async function deleteCriteria(id: number) {
  return await api.delete(`/tasks/criteria/${id}/`)
}
