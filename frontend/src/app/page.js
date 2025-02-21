"use client"

import { useState, useEffect } from 'react'
import { Bell, Settings, Moon, Sun, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { ServiceMetrics } from "@/components/ui/charts/ServiceMetrics"
import { LogsSection } from "@/components/ui/logs/LogsSection"
import { SettingsPanel } from "@/components/ui/settings/SettingsPanel"
import { useToast } from "@/hooks/use-toast"
import { useMetricsSocket } from "@/hooks/use-metrics-socket"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [selectedService, setSelectedService] = useState('service1')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    realtime: true,
    interval: 5,
    logAutoScroll: true
  })

  const { 
    data: realtimeData, 
    status: connectionStatus, 
    serviceStatus,
    error: socketError,
    latestMetrics,
    logs,
    serviceStatuses,
    isConnecting
  } = useMetricsSocket(selectedService, settings)

  const { toast } = useToast()

  const services = [
    { id: 'service1', name: 'Authentication Service', status: serviceStatuses.service1 },
    { id: 'service2', name: 'Payment Gateway', status: serviceStatuses.service2 },
    { id: 'service3', name: 'Data Processing Service', status: serviceStatuses.service3 }
  ]

  useEffect(() => {
    if (socketError) {
      toast({
        title: "Monitoring Alert",
        description: socketError,
        variant: "destructive",
      })
    }
  }, [socketError, toast])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4">
        <h2 className="text-xl font-bold mb-4 animate-fade-in">Services</h2>
        <div className="space-y-2">
          {services.map((service, index) => (
            <Button
              key={service.id}
              variant={selectedService === service.id ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedService(service.id)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-500 ${
                isConnecting && service.id === selectedService
                  ? 'bg-yellow-500 animate-pulse'
                  : service.status === 'running'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`} />
              {service.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="border-b bg-card p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Service Health Monitor</h1>
            <div className="flex items-center gap-4">
              {connectionStatus === 'connected' ? (
                <Badge variant="outline" className="bg-green-500/10">
                  <Activity className="mr-2 h-4 w-4" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10">
                  <Activity className="mr-2 h-4 w-4 animate-pulse" />
                  Connecting...
                </Badge>
              )}
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
            {[
              {
                title: "Status",
                content: (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 transition-colors duration-500 ${
                      isConnecting 
                        ? 'bg-yellow-500 animate-pulse' 
                        : serviceStatus === 'running'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`} />
                    {isConnecting ? 'Connecting' : serviceStatus === 'running' ? 'Running' : 'Stopped'}
                  </div>
                )
              },
              {
                title: "Memory Usage",
                content: isConnecting ? '-' : `${latestMetrics?.memory?.toFixed(1)}%`
              },
              {
                title: "CPU Usage",
                content: isConnecting ? '-' : `${latestMetrics?.cpu?.toFixed(1)}%`
              },
              {
                title: "Active Connections",
                content: isConnecting ? '-' : latestMetrics?.activeConnections
              }
            ].map((card, index) => (
              <Card 
                key={card.title}
                className={`p-4 transition-all duration-300 animate-fade-in-up hover:shadow-lg`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-medium mb-2">{card.title}</h3>
                <div className="text-2xl font-bold">
                  {typeof card.content === 'string' ? (
                    <div className="transition-all duration-300">
                      {card.content}
                    </div>
                  ) : (
                    card.content
                  )}
                </div>
              </Card>
            ))}
          </div>
        </header>

        <div className="p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              <ServiceMetrics data={realtimeData} status={connectionStatus} />
            </TabsContent>

            <TabsContent value="logs">
              <LogsSection 
                logs={logs} 
                autoScroll={settings.logAutoScroll}
              />
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