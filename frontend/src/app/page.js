"use client"

import { useState, useEffect } from 'react'
import { Bell, Settings, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { ServiceMetrics } from "@/components/ui/charts/ServiceMetrics"
import { SettingsPanel } from "@/components/ui/settings/SettingsPanel"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [selectedService, setSelectedService] = useState('service1')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useToast()
  
  const services = [
    { id: 'service1', name: 'Authentication Service', status: 'running' },
    { id: 'service2', name: 'Payment Gateway', status: 'stopped' },
    { id: 'service3', name: 'Data Processing Service', status: 'running' }
  ]

  // Simulate service monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fetching service health
      fetch(`/api/services/${selectedService}/health`)
        .catch(error => {
          toast({
            title: "Service Error",
            description: "Failed to fetch service health data",
            variant: "destructive",
          })
        })
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [selectedService])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4">
        <h2 className="text-xl font-bold mb-4">Services</h2>
        <div className="space-y-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant={selectedService === service.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedService(service.id)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${
                service.status === 'running' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {service.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Service Health Monitor</h1>
            <div className="flex items-center gap-4">
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
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Status</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                Running
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Memory Usage</h3>
              <div className="text-2xl font-bold">64%</div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">CPU Usage</h3>
              <div className="text-2xl font-bold">28%</div>
            </Card>
          </div>

          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="logs" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Application Logs</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
                    [INFO] Service started successfully
                    [WARNING] High memory usage detected
                    [INFO] Connection pool initialized
                  </pre>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="metrics">
              <ServiceMetrics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}