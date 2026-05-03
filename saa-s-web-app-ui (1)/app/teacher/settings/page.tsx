"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { teacherProfile } from "@/lib/mock-data"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-lg font-medium text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Profile</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Update your personal information</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Full Name</Label>
              <Input id="settings-name" defaultValue={teacherProfile.name} className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email</Label>
              <Input id="settings-email" type="email" defaultValue={teacherProfile.email} className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold" />
            </div>
            <Button
              className="w-full rounded-full py-6 font-bold shadow-md hover:scale-[1.01] transition-transform"
              onClick={() => toast.success("Profile updated")}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Organization</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Your organization details</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Organization Name</Label>
              <Input id="org-name" defaultValue={teacherProfile.organization} className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Department</Label>
              <Input defaultValue="Computer Science" className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold" />
            </div>
            <Button
              variant="ghost"
              className="w-full rounded-full py-6 font-bold bg-secondary/50"
              onClick={() => toast.success("Organization updated")}
            >
              Update Organization
            </Button>
          </div>
        </div>

        {/* Plan & Billing */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Plan & Billing</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Manage your subscription</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-3xl bg-pastel-blue p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-black text-blue-900">Pro Plan</p>
                  <Badge className="bg-white/50 text-blue-900 border-0 font-bold px-3">Active</Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-blue-900/60">$19/month - Renews March 1, 2026</p>
              </div>
              <Button variant="secondary" size="sm" className="rounded-full font-bold px-4 bg-white hover:bg-white/90 text-blue-900">
                Manage
              </Button>
            </div>

            <Separator className="bg-secondary/50" />

            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold text-foreground uppercase tracking-widest">Usage Stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-secondary/30 p-5 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Classes</p>
                  <p className="text-2xl font-black text-foreground mt-1">5 <span className="text-xs font-bold text-muted-foreground">/ ∞</span></p>
                </div>
                <div className="rounded-3xl bg-secondary/30 p-5 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Students</p>
                  <p className="text-2xl font-black text-foreground mt-1">142 <span className="text-xs font-bold text-muted-foreground">/ ∞</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">API Keys</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Integrate SudoTask with your tools</p>
          </div>
          <div className="rounded-[2rem] bg-secondary/20 p-10 text-center border-2 border-dashed border-secondary">
             <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Badge variant="secondary" className="bg-pastel-orange text-orange-900 border-0 font-bold">SOON</Badge>
             </div>
             <p className="text-lg font-bold text-foreground">Developer API</p>
             <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
               API access will be available in a future update. You'll be able to create integrations and automate your workflow.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
