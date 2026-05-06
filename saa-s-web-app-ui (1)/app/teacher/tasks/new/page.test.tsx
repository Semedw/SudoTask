import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { getClasses } from "@/lib/api/classes"
import { createTask } from "@/lib/api/tasks"
import NewTaskPage from "@/app/teacher/tasks/new/page"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/lib/api/classes", () => ({
  getClasses: vi.fn(),
}))

vi.mock("@/lib/api/tasks", () => ({
  createTask: vi.fn(),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props)
    }
    return <button {...props}>{children}</button>
  },
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      {...props}
    />
  ),
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}))

describe("Teacher new task page save flow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getClasses).mockResolvedValue([
      {
        id: 1,
        name: "Data Structures",
        description: "",
        class_code: "ABC123",
        created_at: "2024-01-01T00:00:00Z",
        student_count: 0,
        task_count: 0,
        teacher: {
          id: 99,
          email: "teacher@test.com",
          username: "teacher",
          role: "TEACHER",
          first_name: "Teach",
          last_name: "Er",
          created_at: "2024-01-01T00:00:00Z",
        },
      },
    ] as any)
  })

  it("creates task and redirects on successful save", async () => {
    vi.mocked(createTask).mockResolvedValue({ id: 11 } as any)
    const user = userEvent.setup()

    render(<NewTaskPage />)

    await user.type(
      screen.getByLabelText(/task title/i),
      "Binary Search Implementation"
    )
    await user.type(
      screen.getByLabelText(/description/i),
      "Implement binary search over sorted array."
    )

    await user.click(screen.getByRole("button", { name: /save task/i }))

    await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1))
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        classroom_id: 1,
        title: "Binary Search Implementation",
        description: "Implement binary search over sorted array.",
        difficulty: "MEDIUM",
      })
    )
    expect(toast.success).toHaveBeenCalledWith("Task saved successfully")
    expect(mockPush).toHaveBeenCalledWith("/teacher/tasks")
  })

  it("shows error and does not redirect when save fails", async () => {
    vi.mocked(createTask).mockRejectedValue({ message: "Server exploded" })
    const user = userEvent.setup()

    render(<NewTaskPage />)

    await user.type(screen.getByLabelText(/task title/i), "Hash Map Task")
    await user.type(screen.getByLabelText(/description/i), "Build a hash map.")
    await user.click(screen.getByRole("button", { name: /save task/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Server exploded")
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
