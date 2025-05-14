"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Mail, AlertTriangle, FileText, Gauge } from 'lucide-react'

const SECTIONS = [
  { key: "monitoring", label: "Monitoring", icon: <Gauge className="w-4 h-4 mr-2" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4 mr-2" /> },
  { key: "email", label: "Email", icon: <Mail className="w-4 h-4 mr-2" /> },
  { key: "thresholds", label: "Thresholds", icon: <AlertTriangle className="w-4 h-4 mr-2" /> },
  { key: "logs", label: "Logs", icon: <FileText className="w-4 h-4 mr-2" /> },
]

export function SettingsPanel({ open, onOpenChange, settings, onSettingsChange }) {
  const [selectedSection, setSelectedSection] = useState("monitoring")

  const updateSettings = (path, value) => {
    const newSettings = { ...settings }
    const keys = path.split('.')
    let current = newSettings
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    onSettingsChange(newSettings)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 !gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(80vh-4rem)]">
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-muted/40 pl-4 pr-4 pb-4 pt-4 flex flex-col">
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.key}
                  className={`flex items-center w-full px-3 py-2 text-left transition-all duration-150 border-l-4 ${selectedSection === section.key
                    ? 'bg-primary/10 border-primary font-semibold text-primary shadow-sm'
                    : 'border-transparent hover:bg-muted hover:text-primary'} text-sm`}
                  onClick={() => setSelectedSection(section.key)}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            {selectedSection === "monitoring" && (
              <section>
                <h2 className="text-lg font-semibold mb-6">Monitoring Settings</h2>
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label htmlFor="realtime" className="text-base">Real-time Monitoring</Label>
                      <p className="text-sm text-muted-foreground">Enable continuous monitoring of services</p>
                    </div>
                    <Switch
                      id="realtime"
                      checked={settings.realtime}
                      onCheckedChange={(checked) => onSettingsChange({ ...settings, realtime: checked })}
                    />
                  </div>
                  <div>
                    <Label className="text-base mb-2 block">Update Interval</Label>
                    <Select
                      value={settings.interval.toString()}
                      onValueChange={(value) => onSettingsChange({ ...settings, interval: parseInt(value) })}
                      disabled={!settings.realtime}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </section>
            )}

            {selectedSection === "notifications" && (
              <section>
                <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label htmlFor="notifications-enabled" className="text-base">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts about service status changes</p>
                    </div>
                    <Switch
                      id="notifications-enabled"
                      checked={settings.notifications.enabled}
                      onCheckedChange={(checked) => updateSettings('notifications.enabled', checked)}
                    />
                  </div>
                  <div className="mb-4">
                    <Label className="text-base">Notification Methods</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="in-app"
                          checked={settings.notifications.methods.inApp}
                          onCheckedChange={(checked) => updateSettings('notifications.methods.inApp', checked)}
                        />
                        <Label htmlFor="in-app">In-app</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="email"
                          checked={settings.notifications.methods.email}
                          onCheckedChange={(checked) => updateSettings('notifications.methods.email', checked)}
                        />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="sms"
                          checked={settings.notifications.methods.sms}
                          onCheckedChange={(checked) => updateSettings('notifications.methods.sms', checked)}
                        />
                        <Label htmlFor="sms">SMS (Coming Soon)</Label>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label className="text-base">Alert Sound</Label>
                    <Select
                      value={settings.notifications.alertSound}
                      onValueChange={(value) => updateSettings('notifications.alertSound', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="bell">Bell</SelectItem>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base">Notify On</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="service-down"
                          checked={settings.notifications.notifyOn.serviceDown}
                          onCheckedChange={(checked) => updateSettings('notifications.notifyOn.serviceDown', checked)}
                        />
                        <Label htmlFor="service-down">Service Down</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="service-recovered"
                          checked={settings.notifications.notifyOn.serviceRecovered}
                          onCheckedChange={(checked) => updateSettings('notifications.notifyOn.serviceRecovered', checked)}
                        />
                        <Label htmlFor="service-recovered">Service Recovered</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                        <Checkbox
                          id="service-restarted"
                          checked={settings.notifications.notifyOn.serviceRestarted}
                          onCheckedChange={(checked) => updateSettings('notifications.notifyOn.serviceRestarted', checked)}
                        />
                        <Label htmlFor="service-restarted">Service Restarted</Label>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {selectedSection === "email" && (
              <section>
                <h2 className="text-lg font-semibold mb-6">Email Settings</h2>
                <Card className="p-6 mb-6">
                  {settings.notifications.methods.email ? (
                    <>
                      <div className="mb-4">
                        <Label htmlFor="email-recipients" className="text-base">Recipient Email Addresses</Label>
                        <Input
                          id="email-recipients"
                          placeholder="email1@example.com, email2@example.com"
                          value={settings.email.recipients}
                          onChange={(e) => updateSettings('email.recipients', e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <Label htmlFor="email-subject-prefix" className="text-base">Custom Email Subject Prefix</Label>
                        <Input
                          id="email-subject-prefix"
                          placeholder="[Service Alert]"
                          value={settings.email.subjectPrefix}
                          onChange={(e) => updateSettings('email.subjectPrefix', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-base">Include in Email Body</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                            <Checkbox
                              id="include-service-name"
                              checked={settings.email.includeInBody.serviceName}
                              onCheckedChange={(checked) => updateSettings('email.includeInBody.serviceName', checked)}
                            />
                            <Label htmlFor="include-service-name">Service Name</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                            <Checkbox
                              id="include-down-time"
                              checked={settings.email.includeInBody.downSinceTime}
                              onCheckedChange={(checked) => updateSettings('email.includeInBody.downSinceTime', checked)}
                            />
                            <Label htmlFor="include-down-time">Down Since Time</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                            <Checkbox
                              id="include-error-reason"
                              checked={settings.email.includeInBody.errorReason}
                              onCheckedChange={(checked) => updateSettings('email.includeInBody.errorReason', checked)}
                            />
                            <Label htmlFor="include-error-reason">Error Reason</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50">
                            <Checkbox
                              id="include-hostname"
                              checked={settings.email.includeInBody.serverHostname}
                              onCheckedChange={(checked) => updateSettings('email.includeInBody.serverHostname', checked)}
                            />
                            <Label htmlFor="include-hostname">Server Hostname</Label>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      Enable email notifications to configure email settings
                    </div>
                  )}
                </Card>
              </section>
            )}

            {selectedSection === "thresholds" && (
              <section>
                <h2 className="text-lg font-semibold mb-6">Service Monitoring Thresholds</h2>
                <Card className="p-6 mb-6">
                  <div className="mb-4">
                    <Label htmlFor="retry-attempts" className="text-base">Number of Retry Attempts</Label>
                    <Input
                      id="retry-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.monitoring.retryAttempts}
                      onChange={(e) => updateSettings('monitoring.retryAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4 p-2 rounded-md bg-muted/50">
                    <div>
                      <Label htmlFor="auto-restart" className="text-base">Enable Auto-Restart</Label>
                      <p className="text-sm text-muted-foreground">Automatically restart services when they fail</p>
                    </div>
                    <Switch
                      id="auto-restart"
                      checked={settings.monitoring.autoRestart}
                      onCheckedChange={(checked) => updateSettings('monitoring.autoRestart', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grace-period" className="text-base">Grace Period (seconds)</Label>
                    <Input
                      id="grace-period"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.monitoring.gracePeriod}
                      onChange={(e) => updateSettings('monitoring.gracePeriod', parseInt(e.target.value))}
                    />
                  </div>
                </Card>
              </section>
            )}

            {selectedSection === "logs" && (
              <section>
                <h2 className="text-lg font-semibold mb-6">Log Settings</h2>
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label htmlFor="log-autoscroll" className="text-base">Auto-scroll Logs</Label>
                      <p className="text-sm text-muted-foreground">Automatically scroll to new log entries</p>
                    </div>
                    <Switch
                      id="log-autoscroll"
                      checked={settings.logAutoScroll}
                      onCheckedChange={(checked) => onSettingsChange({ ...settings, logAutoScroll: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4 p-2 rounded-md bg-muted/50">
                    <div>
                      <Label htmlFor="save-logs" className="text-base">Save Logs to File</Label>
                      <p className="text-sm text-muted-foreground">Store logs in a local file</p>
                    </div>
                    <Switch
                      id="save-logs"
                      checked={settings.logs.saveToFile}
                      onCheckedChange={(checked) => updateSettings('logs.saveToFile', checked)}
                    />
                  </div>
                  <div className="mb-4">
                    <Label className="text-base">Log Retention Period</Label>
                    <Select
                      value={settings.logs.retentionPeriod}
                      onValueChange={(value) => updateSettings('logs.retentionPeriod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base">Log Level</Label>
                    <Select
                      value={settings.logs.logLevel}
                      onValueChange={(value) => updateSettings('logs.logLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </section>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}