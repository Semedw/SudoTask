"use client"

import Link from "next/link"
import { ArrowRight, Users, CheckCircle2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const statCards = [
  { label: "Total Classes", value: "12", color: "bg-pastel-pink text-pink-900" },
  { label: "Active Students", value: "284", color: "bg-pastel-orange text-orange-900" },
  { label: "Tasks Graded", value: "1,847", color: "bg-pastel-purple text-purple-900" },
  { label: "Pass Rate", value: "78%", color: "bg-pastel-green text-green-900" },
]

export function HeroSection() {
  const ref = useScrollAnimation()

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-36 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-on-scroll inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-medium text-muted-foreground mb-8">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Trusted by 500+ educators worldwide
          </div>
          <h1 className="animate-on-scroll text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
            The smarter way to<br />
            <span className="relative">
              <span className="relative inline-block px-2">
                <span className="relative z-10">grade code</span>
                <span className="absolute inset-x-0 bottom-1 h-4 bg-pastel-orange rounded-full -z-0 opacity-70" />
              </span>
            </span>{" "}
            in class
          </h1>
          <p className="animate-on-scroll mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Teachers create tasks with test cases. Students get instant feedback.
            Save hours on grading and focus on what matters — teaching.
          </p>
          <div className="animate-on-scroll mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-10 py-6 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-transform" asChild>
              <Link href="/register">
                Start for free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="gap-2 px-10 py-6 rounded-full text-lg font-bold bg-secondary hover:bg-black/5 transition-colors" asChild>
              <Link href="/login">
                Sign in
              </Link>
            </Button>
          </div>
        </div>

        {/* Soft pastel stat cards preview */}
        <div className="animate-on-scroll mx-auto mt-20 max-w-4xl">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.label} className={`p-6 rounded-[2rem] ${stat.color} flex flex-col gap-3 transition-transform hover:scale-[1.03] hover:shadow-md`}>
                <p className="text-sm font-semibold opacity-70">{stat.label}</p>
                <p className="text-4xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

