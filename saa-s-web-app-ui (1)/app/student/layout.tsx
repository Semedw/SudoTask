import { StudentHeader } from "@/components/student/header"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  )
}
