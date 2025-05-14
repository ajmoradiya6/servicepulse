"use client"

import { useState, useEffect } from 'react'
import { Bell, Settings, Moon, Sun, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"
import { useMetricsSocket } from "@/hooks/use-metrics-socket"

// Dynamically import components that use client-side data
const ServiceMetrics = dynamic(() => import('@/components/ui/charts/ServiceMetrics').then(mod => mod.ServiceMetrics), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center">Loading metrics...</div>
})

const LogsSection = dynamic(() => import('@/components/ui/logs/LogsSection').then(mod => mod.LogsSection), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center">Loading logs...</div>
})

const SettingsPanel = dynamic(() => import('@/components/ui/settings/SettingsPanel').then(mod => mod.SettingsPanel), {
  ssr: false
})

export default function Dashboard() {
  // All hooks must be called in the same order on every render
  const { theme, setTheme } = useTheme()
  const [selectedService, setSelectedService] = useState('service1')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    realtime: true,
    interval: 5,
    logAutoScroll: true,
    // Notification Settings
    notifications: {
      enabled: true,
      methods: {
        inApp: true,
        email: false,
        sms: false
      },
      alertSound: 'default',
      notifyOn: {
        serviceDown: true,
        serviceRecovered: true,
        serviceRestarted: true,
        slowService: false
      }
    },
    // Email Settings
    email: {
      recipients: '',
      subjectPrefix: '',
      includeInBody: {
        serviceName: true,
        downSinceTime: true,
        errorReason: true,
        serverHostname: true
      }
    },
    // Monitoring Thresholds
    monitoring: {
      retryAttempts: 3,
      autoRestart: false,
      gracePeriod: 10
    },
    // Log Settings
    logs: {
      saveToFile: false,
      retentionPeriod: '7',
      logLevel: 'info'
    }
  })
  const [mounted, setMounted] = useState(false)

  // Always call the hook, but it will handle server/client rendering internally
  const { 
    data: realtimeData, 
    connectionStatus,
    serviceStatus,
    error: socketError,
    latestMetrics,
    logs,
    serviceStatuses,
    isFirstLoad,
    isInitialized
  } = useMetricsSocket(selectedService, settings)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const services = [
    { id: 'service1', name: 'Authentication Service', status: 'running' },
    { id: 'service2', name: 'Payment Gateway', status: 'stopped' },
    { id: 'service3', name: 'Data Processing Service', status: 'running' }
  ]

  // Get the current service's status
  const currentService = services.find(s => s.id === selectedService)

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Health Monitor</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Services</h2>
        <div className="space-y-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={selectedService === service.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedService(service.id)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-300 ${
                selectedService === service.id && connectionStatus === 'connecting'
                  ? 'bg-yellow-500 animate-pulse-scale'
                  : serviceStatuses[service.id] === 'running'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`} />
              {service.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Service Health Monitor</h1>
            <div className="flex items-center gap-4">
              {/* Connection Status Badge */}
              <Badge 
                variant="outline" 
                className={`${
                  connectionStatus === 'connecting' 
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-green-500/10 text-green-500'
                }`}
              >
                <Activity className="w-4 h-4 mr-2" />
                {connectionStatus === 'connecting' ? 'Connecting' : 'Live'}
              </Badge>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Status</h3>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  connectionStatus === 'connecting'
                    ? 'bg-yellow-500'
                    : serviceStatuses[selectedService] === 'running'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`} />
                {connectionStatus === 'connecting' 
                  ? 'Connecting' 
                  : serviceStatuses[selectedService] === 'running' 
                  ? 'Running' 
                  : 'Stopped'}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Memory Usage</h3>
              <div className="text-2xl font-bold">
                {connectionStatus === 'connecting' ? '-' : `${latestMetrics?.memory?.toFixed(1)}%`}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">CPU Usage</h3>
              <div className="text-2xl font-bold">
                {connectionStatus === 'connecting' ? '-' : `${latestMetrics?.cpu?.toFixed(1)}%`}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Active Connections</h3>
              <div className="text-2xl font-bold">
                {connectionStatus === 'connecting' ? '-' : latestMetrics?.activeConnections}
              </div>
            </Card>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          <Tabs defaultValue="metrics" className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="metrics" className="w-full">Metrics</TabsTrigger>
              <TabsTrigger value="logs" className="w-full">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="flex-1 overflow-hidden mt-4">
              <ServiceMetrics data={realtimeData} status={connectionStatus} />
            </TabsContent>

            <TabsContent value="logs" className="flex-1 overflow-hidden mt-4">
              <LogsSection logs={logs} autoScroll={settings.logAutoScroll} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SettingsPanel 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}