"use client"

import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Brush, Area, AreaChart,
  ComposedChart, ZoomOutMap, ReferenceArea
} from 'recharts'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, RefreshCw, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMetricsSocket } from "@/hooks/use-metrics-socket"
import { AlertsConfig } from "@/components/ui/metrics/AlertsConfig"
import { ProcessMetrics } from "@/components/ui/metrics/ProcessMetrics"
import { useToast } from "@/hooks/use-toast"

// Enhanced demo data with process-specific metrics
const generateDemoData = (hours = 24) => {
  return Array.from({ length: hours }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    cpu: 30 + Math.random() * 40,
    memory: 50 + Math.random() * 30,
    network: 20 + Math.random() * 40,
    diskUsage: 50 + Math.random() * 10,
    threads: 100 + Math.random() * 50,
    handles: 2300 + Math.random() * 200,
    networkIn: Math.random() * 100,
    networkOut: Math.random() * 100,
    processCount: 80 + Math.random() * 20,
    responseTime: 100 + Math.random() * 150,
  }))
}

export function ServiceMetrics() {
  const [timeRange, setTimeRange] = useState('1h')
  const [zoomDomain, setZoomDomain] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [detailView, setDetailView] = useState(false)
  const [data, setData] = useState(generateDemoData())
  const chartRef = useRef(null)
  const { data: realtimeData, status: socketStatus } = useMetricsSocket('service1')
  const { toast } = useToast()

  // Alert checking
  useEffect(() => {
    if (realtimeData?.metrics) {
      const { cpu, memory } = realtimeData.metrics
      if (cpu > 80) {
        toast({
          title: "High CPU Usage",
          description: `CPU usage has exceeded 80%: ${cpu.toFixed(1)}%`,
          variant: "destructive",
        })
      }
      if (memory > 90) {
        toast({
          title: "High Memory Usage",
          description: `Memory usage has exceeded 90%: ${memory.toFixed(1)}%`,
          variant: "destructive",
        })
      }
    }
  }, [realtimeData])

  // Zoom handling
  const handleZoom = (domain) => {
    setZoomDomain(domain)
  }

  // Export chart as image
  const exportChart = () => {
    const svgElement = chartRef.current?.container.querySelector('svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const link = document.createElement('a')
        link.download = 'service-metrics.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  // Export data as CSV
  const exportCSV = () => {
    const headers = Object.keys(data[0]).join(',')
    const csvData = data.map(row => Object.values(row).join(',')).join('\n')
    const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'service-metrics.csv'
    link.click()
  }

  const DetailedMetricView = ({ metric }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{metric} Detailed View</DialogTitle>
        </DialogHeader>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric.toLowerCase()}
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Brush dataKey="time" height={30} stroke="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Performance Metrics</h2>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setData(generateDemoData())}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={exportChart}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="process">Process Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">System Overview</h3>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                Export Data
              </Button>
            </div>
            <div className="h-[400px]" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Usage"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="memory"
                    name="Memory Usage"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="diskUsage"
                    name="Disk Usage"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Brush dataKey="time" height={30} stroke="#8884d8" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px]">
                <h4 className="font-medium mb-2">Response Time</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <h4 className="font-medium mb-2">Process Count</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="processCount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="process">
          <ProcessMetrics data={realtimeData?.metrics} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsConfig />
        </TabsContent>
      </Tabs>

      {socketStatus !== 'connected' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connecting to metrics service...
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}