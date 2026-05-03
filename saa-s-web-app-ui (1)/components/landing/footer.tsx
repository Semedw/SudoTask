"use client"

import Link from "next/link"
import { Terminal } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
}

export function FooterSection() {
  const ref = useScrollAnimation()

  return (
    <footer ref={ref} className="bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="animate-on-scroll-fade animate-on-scroll grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-md">
                <Terminal className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SudoTask</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Automated code grading for modern classrooms. Save time, give instant feedback.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            {"© 2026 SudoTask. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  )
}
