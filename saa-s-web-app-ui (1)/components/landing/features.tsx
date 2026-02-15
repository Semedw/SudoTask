"use client"

import { CheckCircle2, Code2, Trophy, BarChart3, Shield, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  {
    icon: CheckCircle2,
    title: "Auto Grading with Test Cases",
    description: "Define input/output test cases and let SudoTask automatically grade every submission with detailed results.",
  },
  {
    icon: Code2,
    title: "Teacher Task Builder",
    description: "Create rich programming tasks with descriptions, constraints, multiple test cases, and custom grading criteria.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Motivate students with class leaderboards showing scores, fastest submissions, and highest pass rates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track student performance, identify struggling topics, and view completion rates with visual charts.",
  },
  {
    icon: Shield,
    title: "Plagiarism Detection",
    description: "Automatically detect code similarity between submissions to maintain academic integrity.",
    comingSoon: true,
  },
  {
    icon: Layers,
    title: "Multi-Language Support",
    description: "Support for Python, C++, Java, and JavaScript. Students code in their preferred language.",
  },
]

export function FeaturesSection() {
  const ref = useScrollAnimation()

  return (
    <section ref={ref} id="features" className="border-t border-border bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-on-scroll text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to teach programming
          </h2>
          <p className="animate-on-scroll mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            From creating tasks to grading submissions, SudoTask handles the heavy lifting so you can focus on teaching.
          </p>
        </div>

        <div className="stagger-children mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="animate-on-scroll relative border-border bg-card transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  {feature.comingSoon && (
                    <Badge variant="secondary" className="text-xs">Soon</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
