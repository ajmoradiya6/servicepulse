"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function SettingsPanel({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="admin@example.com" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="service-start">Service Started</Label>
                <Switch id="service-start" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="service-stop">Service Stopped</Label>
                <Switch id="service-stop" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="errors">Errors and Warnings</Label>
                <Switch id="errors" />
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}