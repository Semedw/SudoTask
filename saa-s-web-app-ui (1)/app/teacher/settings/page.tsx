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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-name">Full Name</Label>
              <Input id="settings-name" defaultValue={teacherProfile.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" defaultValue={teacherProfile.email} />
            </div>
            <Button
              className="w-fit"
              onClick={() => toast.success("Profile updated")}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Organization</CardTitle>
            <CardDescription>Your organization details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" defaultValue={teacherProfile.organization} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Department</Label>
              <Input defaultValue="Computer Science" />
            </div>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => toast.success("Organization updated")}
            >
              Update Organization
            </Button>
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Plan & Billing</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">Pro Plan</p>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">$19/month - Renews March 1, 2026</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Usage</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Classes</p>
                  <p className="text-lg font-bold text-foreground">5 <span className="text-sm font-normal text-muted-foreground">/ Unlimited</span></p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="text-lg font-bold text-foreground">142 <span className="text-sm font-normal text-muted-foreground">/ Unlimited</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">API Keys</CardTitle>
            <CardDescription>Manage API access for integrations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              <p className="mt-1 text-xs text-muted-foreground">
                API access will be available in a future update. Integrate SudoTask with your existing tools.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
