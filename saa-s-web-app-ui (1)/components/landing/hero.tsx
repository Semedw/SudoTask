"use client"

import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function HeroSection() {
  const ref = useScrollAnimation()

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 lg:px-8 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-on-scroll">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Trusted by 500+ educators worldwide
            </Badge>
          </div>
          <h1 className="animate-on-scroll text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Automated Code Grading for Classrooms
          </h1>
          <p className="animate-on-scroll mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Teachers save hours creating tasks with test cases. Students get instant feedback on their code.
            Build better programmers with real-time grading and analytics.
          </p>
          <div className="animate-on-scroll mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/register">
                Create a Class
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
              <Link href="/student/join">
                <Play className="h-4 w-4" />
                Join a Class
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-on-scroll-scale animate-on-scroll mx-auto mt-20 max-w-5xl">
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-lg bg-muted/50 p-1">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-4 font-mono text-xs font-medium text-muted-foreground">SudoTask Dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-3 p-4">
                {[
                  { label: "Total Classes", value: "12" },
                  { label: "Active Students", value: "284" },
                  { label: "Tasks Graded", value: "1,847" },
                  { label: "Avg. Pass Rate", value: "78%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
