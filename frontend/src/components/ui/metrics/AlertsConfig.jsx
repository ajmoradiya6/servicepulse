"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, AlertTriangle } from 'lucide-react'

export function AlertsConfig() {
  const [thresholds, setThresholds] = useState({
    cpu: 80,
    memory: 90,
    disk: 85,
    responseTime: 1000
  })

  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    slack: false
  })

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Alert Thresholds</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpu-threshold">CPU Usage (%)</Label>
            <Input
              id="cpu-threshold"
              type="number"
              value={thresholds.cpu}
              onChange={(e) => setThresholds(prev => ({...prev, cpu: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-threshold">Memory Usage (%)</Label>
            <Input
              id="memory-threshold"
              type="number"
              value={thresholds.memory}
              onChange={(e) => setThresholds(prev => ({...prev, memory: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notify">Email Notifications</Label>
              <Switch
                id="email-notify"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, email: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notify">Browser Notifications</Label>
              <Switch
                id="browser-notify"
                checked={notifications.browser}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, browser: checked}))}
              />
            </div>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alerts will be triggered when metrics exceed these thresholds
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  )
}