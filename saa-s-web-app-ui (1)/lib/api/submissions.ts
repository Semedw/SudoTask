import { api, unwrapPaginated } from "./client"
import type { Submission, TestCodeResponse, Language } from "@/lib/types"

export async function submitCode(
  taskId: number,
  payload: { code: string; language: Language }
) {
  return (await api.post(`/tasks/${taskId}/submit/`, payload)) as Submission
}

export async function testCode(
  taskId: number,
  payload: { code: string; language: Language }
) {
  return (await api.post(`/tasks/${taskId}/test/`, payload)) as TestCodeResponse
}

export async function getSubmission(id: number) {
  return (await api.get(`/submissions/${id}/`)) as Submission
}

export async function getSubmissions(taskId?: number) {
  const params = taskId ? `?task_id=${taskId}` : ""
  const data = await api.get(`/submissions/${params}`)
  return unwrapPaginated<Submission>(data)
}

export async function pollSubmission(
  id: number,
  maxAttempts = 30,
  delayMs = 1000
): Promise<Submission> {
  for (let i = 0; i < maxAttempts; i++) {
    const submission = await getSubmission(id)
    if (submission.status !== "pending" && submission.status !== "running") {
      return submission
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return getSubmission(id)
}
