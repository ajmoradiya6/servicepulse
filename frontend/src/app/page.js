"use client"

import { useState, useEffect } from 'react'
import { Bell, Settings, Moon, Sun, Activity, X, CheckCircle2, AlertCircle, AlertTriangle, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"
import { useMetricsSocket } from "@/hooks/use-metrics-socket"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      levels: {
        warn: true,
        error: true
      },
      serviceStatus: {
        onStop: true,
        onStart: false,
        onRestart: true,
        onError: true
      },
      resourceUsage: {
        cpu: true,
        memory: true
      },
      realTime: true,
      playSound: true,
      alertSound: "default",
      showLogs: true,
      logLevels: {
        warn: true,
        error: true
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
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    url: '',
    port: ''
  })
  const [services, setServices] = useState([
    { id: 'service1', name: 'Authentication Service', status: 'running', url: 'https://auth.example.com', port: '3000' },
    { id: 'service2', name: 'Payment Gateway', status: 'stopped', url: 'https://pay.example.com', port: '3001' },
    { id: 'service3', name: 'Data Processing Service', status: 'running', url: 'https://data.example.com', port: '3002' }
  ])

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

  // Get the current service's status
  const currentService = services.find(s => s.id === selectedService)

  // Function to generate a unique ID for notifications
  const generateNotificationId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Function to add a new notification
  const addNotification = (notification) => {
    setNotifications(prev => {
      // Check if a similar notification already exists in the last 5 seconds
      const recentNotifications = prev.filter(n => 
        Date.now() - n.timestamp < 5000 && 
        n.message === notification.message &&
        n.service === notification.service
      )

      if (recentNotifications.length > 0) {
        return prev // Don't add duplicate notification
      }

      return [{
        id: generateNotificationId(),
        timestamp: new Date(),
        ...notification
      }, ...prev].slice(0, 50) // Keep last 50 notifications
    })
  }

  // Function to remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Constants for resource thresholds
  const CPU_THRESHOLD = 80 // 80%
  const MEMORY_THRESHOLD = 85 // 85%

  // Function to check resource usage and send notifications
  const checkResourceUsage = (metrics, service) => {
    if (!metrics || service.id !== selectedService) return

    if (metrics.cpu > CPU_THRESHOLD && settings.notifications?.resourceUsage?.cpu) {
      addNotification({
        type: 'warning',
        title: 'High CPU Usage',
        message: `${service.name} CPU usage is at ${metrics.cpu.toFixed(1)}%`,
        service: service.name
      })
    }

    if (metrics.memory > MEMORY_THRESHOLD && settings.notifications?.resourceUsage?.memory) {
      addNotification({
        type: 'warning',
        title: 'High Memory Usage',
        message: `${service.name} memory usage is at ${metrics.memory.toFixed(1)}%`,
        service: service.name
      })
    }
  }

  // Update the useEffect to include resource usage checks
  useEffect(() => {
    if (!isInitialized || isFirstLoad) return

    // Check for service status changes
    Object.entries(serviceStatuses).forEach(([serviceId, status]) => {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      if (status === 'stopped' && settings.notifications?.serviceStatus?.onStop) {
        addNotification({
          type: 'error',
          title: 'Service Stopped',
          message: `${service.name} has stopped running`,
          service: service.name
        })
      } else if (status === 'running' && settings.notifications?.serviceStatus?.onStart) {
        addNotification({
          type: 'success',
          title: 'Service Started',
          message: `${service.name} is now running`,
          service: service.name
        })
      } else if (status === 'error' && settings.notifications?.serviceStatus?.onError) {
        addNotification({
          type: 'error',
          title: 'Service Error',
          message: `${service.name} encountered an error`,
          service: service.name
        })
      } else if (status === 'restarting' && settings.notifications?.serviceStatus?.onRestart) {
        addNotification({
          type: 'warning',
          title: 'Service Restarting',
          message: `${service.name} is restarting`,
          service: service.name
        })
      }
    })

    // Check resource usage only for the selected service
    const currentService = services.find(s => s.id === selectedService)
    if (currentService && serviceStatuses[selectedService] === 'running' && latestMetrics) {
      checkResourceUsage(latestMetrics, currentService)
    }
  }, [serviceStatuses, latestMetrics, selectedService, isInitialized, isFirstLoad])

  const handleAddService = () => {
    if (newService.name && newService.url && newService.port) {
      const serviceId = `service${services.length + 1}`
      const newServiceData = {
        id: serviceId,
        name: newService.name,
        status: 'running',
        url: newService.url,
        port: newService.port
      }
      setServices(prev => [...prev, newServiceData])
      setNewService({ name: '', url: '', port: '' })
      setShowAddService(false)
    }
  }

  const handleDeleteService = (serviceId) => {
    setServices(prev => prev.filter(service => service.id !== serviceId))
    if (selectedService === serviceId) {
      setSelectedService(services[0]?.id || '')
    }
  }

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <Dialog open={showAddService} onOpenChange={setShowAddService}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input
                    id="service-name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Enter service name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-url">Service URL</Label>
                  <Input
                    id="service-url"
                    value={newService.url}
                    onChange={(e) => setNewService({ ...newService, url: e.target.value })}
                    placeholder="Enter domain or IP (e.g., asd.com or 192.168.1.56)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-port">Port Number</Label>
                  <Input
                    id="service-port"
                    value={newService.port}
                    onChange={(e) => setNewService({ ...newService, port: e.target.value })}
                    placeholder="Enter port number"
                    type="number"
                  />
                </div>
                <Button onClick={handleAddService} className="w-full">
                  Add Service
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {services.map((service) => (
            <div key={service.id} className="flex items-center group">
              <Button
                variant={selectedService === service.id ? "default" : "ghost"}
                className="w-full justify-start flex-1"
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteService(service.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
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

              {/* Notifications Dropdown */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-2">
                    <h4 className="font-medium">Notifications</h4>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={clearNotifications}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      <div className="p-2">
                        {notifications.map((notification) => {
                          const getIcon = () => {
                            switch (notification.type) {
                              case 'success':
                                return <CheckCircle2 className="h-5 w-5 text-green-500" />
                              case 'error':
                                return <AlertCircle className="h-5 w-5 text-red-500" />
                              case 'warning':
                                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              default:
                                return <PlayCircle className="h-5 w-5 text-blue-500" />
                            }
                          }

                          const getBorderColor = () => {
                            switch (notification.type) {
                              case 'success':
                                return 'border-green-500/20 bg-green-500/5'
                              case 'error':
                                return 'border-red-500/20 bg-red-500/5'
                              case 'warning':
                                return 'border-yellow-500/20 bg-yellow-500/5'
                              default:
                                return 'border-blue-500/20 bg-blue-500/5'
                            }
                          }

                          return (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg mb-2 border ${getBorderColor()}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {getIcon()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{notification.title}</span>
                                      {notification.service && (
                                        <Badge variant="outline" className="text-xs font-normal">
                                          {notification.service}
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 -mt-1 -mr-1"
                                      onClick={() => removeNotification(notification.id)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-muted-foreground mt-2 block">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

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
                {connectionStatus === 'connecting' ? '-' : (
                  <AnimatedNumber 
                    value={latestMetrics?.memory || 0} 
                    suffix="%" 
                    decimals={1}
                  />
                )}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">CPU Usage</h3>
              <div className="text-2xl font-bold">
                {connectionStatus === 'connecting' ? '-' : (
                  <AnimatedNumber 
                    value={latestMetrics?.cpu || 0} 
                    suffix="%" 
                    decimals={1}
                  />
                )}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Active Connections</h3>
              <div className="text-2xl font-bold">
                {connectionStatus === 'connecting' ? '-' : (
                  <AnimatedNumber 
                    value={latestMetrics?.activeConnections || 0} 
                    decimals={0}
                  />
                )}
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