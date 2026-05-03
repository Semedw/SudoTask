"use client"

import { CheckCircle2, Code2, Trophy, BarChart3, Shield, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  {
    icon: CheckCircle2,
    title: "Auto Grading with Test Cases",
    description: "Define input/output test cases and let SudoTask automatically grade every submission with detailed results.",
    color: "bg-pastel-green text-green-900",
    iconBg: "bg-white/40",
  },
  {
    icon: Code2,
    title: "Teacher Task Builder",
    description: "Create rich programming tasks with descriptions, constraints, multiple test cases, and custom grading criteria.",
    color: "bg-pastel-blue text-blue-900",
    iconBg: "bg-white/40",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Motivate students with class leaderboards showing scores, fastest submissions, and highest pass rates.",
    color: "bg-pastel-orange text-orange-900",
    iconBg: "bg-white/40",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track student performance, identify struggling topics, and view completion rates with visual charts.",
    color: "bg-pastel-purple text-purple-900",
    iconBg: "bg-white/40",
  },
  {
    icon: Shield,
    title: "Plagiarism Detection",
    description: "Automatically detect code similarity between submissions to maintain academic integrity.",
    color: "bg-pastel-pink text-pink-900",
    iconBg: "bg-white/40",
    comingSoon: true,
  },
  {
    icon: Layers,
    title: "Multi-Language Support",
    description: "Support for Python, C++, Java, and JavaScript. Students code in their preferred language.",
    color: "bg-pastel-green text-green-900",
    iconBg: "bg-white/40",
  },
]

export function FeaturesSection() {
  const ref = useScrollAnimation()

  return (
    <section ref={ref} id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="animate-on-scroll text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need to<br />teach programming
          </h2>
          <p className="animate-on-scroll mt-6 text-lg leading-relaxed text-muted-foreground">
            From creating tasks to grading submissions, SudoTask handles the heavy lifting so you can focus on teaching.
          </p>
        </div>

        <div className="stagger-children mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`animate-on-scroll relative p-8 rounded-[2rem] ${feature.color} flex flex-col gap-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} backdrop-blur-sm shadow-sm`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  {feature.comingSoon && (
                    <Badge className="bg-white/40 text-current border-0 text-xs font-semibold hover:bg-white/50">Soon</Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed opacity-80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

