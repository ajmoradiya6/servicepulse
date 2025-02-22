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
  const [previousService, setPreviousService] = useState(null)
  const [selectedService, setSelectedService] = useState('service1')
  const [isTransitioning, setIsTransitioning] = useState(false)
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

  const handleServiceChange = (newService) => {
    setPreviousService(selectedService)
    setIsTransitioning(true)
    setSelectedService(newService)
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  // Loading skeleton component
  const MetricSkeleton = () => (
    <div className="animate-skeleton-pulse rounded-lg p-4" 
      style={{ "--skeleton-from": "var(--card)", "--skeleton-to": "var(--muted)" }}>
      <div className="h-4 w-24 bg-muted rounded mb-2"></div>
      <div className="h-8 w-16 bg-muted rounded"></div>
    </div>
  )

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
      {/* Sidebar with service switch animations */}
      <div className="w-64 border-r bg-card p-4">
        <h2 className="text-xl font-bold mb-4">Services</h2>
        <div className="space-y-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={selectedService === service.id ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-300 ${
                selectedService === service.id ? 'animate-state-change' : ''
              }`}
              onClick={() => handleServiceChange(service.id)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-500 ${
                isConnecting && service.id === selectedService
                  ? 'bg-yellow-500 animate-loading-spin'
                  : service.status === 'running'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`} />
              {service.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content with loading and transition animations */}
      <div className="flex-1 overflow-auto">
        <header className="border-b bg-card p-4">
          <div className="flex items-center justify-between animate-content-fade">
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
            {isConnecting ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <MetricSkeleton key={i} />
              ))
            ) : (
              // Metric cards with transition animations
              <>
                <Card className={`p-4 ${
                  isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
                }`}>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      isConnecting 
                        ? 'bg-yellow-500 animate-loading-spin' 
                        : serviceStatus === 'running'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`} />
                    {isConnecting ? (
                      <span className="flex gap-1">
                        Connecting
                        <span className="animate-loading-dots">.</span>
                        <span className="animate-loading-dots" style={{ animationDelay: "0.2s" }}>.</span>
                        <span className="animate-loading-dots" style={{ animationDelay: "0.4s" }}>.</span>
                      </span>
                    ) : (
                      serviceStatus === 'running' ? 'Running' : 'Stopped'
                    )}
                  </div>
                </Card>
                <Card 
                  className={`p-4 ${
                    isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
                  }`}
                >
                  <h3 className="font-medium mb-2">Memory Usage</h3>
                  <div className="text-2xl font-bold">
                    {isConnecting ? '-' : `${latestMetrics?.memory?.toFixed(1)}%`}
                  </div>
                </Card>
                <Card 
                  className={`p-4 ${
                    isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
                  }`}
                >
                  <h3 className="font-medium mb-2">CPU Usage</h3>
                  <div className="text-2xl font-bold">
                    {isConnecting ? '-' : `${latestMetrics?.cpu?.toFixed(1)}%`}
                  </div>
                </Card>
                <Card 
                  className={`p-4 ${
                    isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
                  }`}
                >
                  <h3 className="font-medium mb-2">Active Connections</h3>
                  <div className="text-2xl font-bold">
                    {isConnecting ? '-' : latestMetrics?.activeConnections}
                  </div>
                </Card>
              </>
            )}
          </div>
        </header>

        <div className={`p-6 ${
          isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
        }`}>
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