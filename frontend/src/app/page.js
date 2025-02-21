"use client"

import { useState, useEffect } from 'react'
import { useMetricsSocket } from "@/hooks/use-metrics-socket"
import { ServiceMetrics } from "@/components/ui/charts/ServiceMetrics"
import { ProcessMetrics } from "@/components/ui/metrics/ProcessMetrics"
import { MetricComparison } from "@/components/ui/metrics/MetricComparison"
import { AlertsConfig } from "@/components/ui/metrics/AlertsConfig"
import { LogsSection } from "@/components/ui/logs/LogsSection"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, Settings, Moon, Sun, Download, RefreshCw, 
  Activity, Server, AlertTriangle, CheckCircle 
} from 'lucide-react'
import { useTheme } from "next-themes"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const { data: realtimeData, status: socketStatus } = useMetricsSocket('service1')
  const { toast } = useToast()
  const [showAlerts, setShowAlerts] = useState(false)

  // Health status indicators
  const healthStatus = {
    cpu: realtimeData?.metrics?.cpu < 80 ? 'healthy' : 'warning',
    memory: realtimeData?.metrics?.memory < 90 ? 'healthy' : 'critical',
    disk: realtimeData?.metrics?.disk < 85 ? 'healthy' : 'warning',
    network: realtimeData?.metrics?.network < 1000 ? 'healthy' : 'warning'
  }

  const StatusBadge = ({ status }) => {
    const variants = {
      healthy: { color: 'bg-green-500', text: 'Healthy' },
      warning: { color: 'bg-yellow-500', text: 'Warning' },
      critical: { color: 'bg-red-500', text: 'Critical' }
    }
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${variants[status].color}`} />
        <span>{variants[status].text}</span>
      </div>
    )
  }

  const exportMetrics = () => {
    // Placeholder for metrics export functionality
    toast({
      title: "Export Metrics",
      description: "Metrics export functionality not yet implemented."
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-xl font-bold">Service Health Monitor</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowAlerts(true)}>
              <Bell className="h-5 w-5" />
              {healthStatus.cpu === 'critical' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-8">
        {/* Service Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <h3 className="text-2xl font-bold">{realtimeData?.metrics?.cpu?.toFixed(1)}%</h3>
              </div>
              <StatusBadge status={healthStatus.cpu} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <h3 className="text-2xl font-bold">{realtimeData?.metrics?.memory?.toFixed(1)}%</h3>
              </div>
              <StatusBadge status={healthStatus.memory} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Disk Usage</p>
                <h3 className="text-2xl font-bold">{realtimeData?.metrics?.disk?.toFixed(1)}%</h3>
              </div>
              <StatusBadge status={healthStatus.disk} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Network</p>
                <h3 className="text-2xl font-bold">{(realtimeData?.metrics?.network / 1000).toFixed(1)} MB/s</h3>
              </div>
              <StatusBadge status={healthStatus.network} />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="processes">Processes</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ServiceMetrics data={realtimeData?.metrics} />
            <MetricComparison data={realtimeData?.metrics} />
          </TabsContent>

          <TabsContent value="processes">
            <ProcessMetrics data={realtimeData} />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Performance Analysis</h3>
                <Button variant="outline" size="sm" onClick={() => exportMetrics()}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ServiceMetrics data={realtimeData?.metrics} />
                <MetricComparison data={realtimeData?.metrics} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <LogsSection />
          </TabsContent>
        </Tabs>

        {/* Alert Sheet */}
        <Sheet open={showAlerts} onOpenChange={setShowAlerts}>
          <SheetContent>
            <AlertsConfig />
          </SheetContent>
        </Sheet>
      </main>

      {/* Connection Status */}
      {socketStatus !== 'connected' && (
        <div className="fixed bottom-4 right-4">
          <Badge variant="outline" className="bg-yellow-500/10">
            <Activity className="mr-2 h-4 w-4 animate-pulse" />
            Connecting to metrics service...
          </Badge>
        </div>
      )}
    </div>
  )
}