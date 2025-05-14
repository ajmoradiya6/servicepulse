"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Activity } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

export function ServiceMetrics({ data = [], status, serviceName }) {
  const [chartData, setChartData] = useState([])
  const { notify } = useNotifications()

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData(data.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        ...point
      })))
    }
  }, [data])

  useEffect(() => {
    if (status === 'stopped' || status === 'error') {
      const latestMetrics = chartData[chartData.length - 1]
      const reason = status === 'error' 
        ? 'Service encountered an error'
        : 'Service has stopped running'

      notify({
        title: `Service ${status === 'error' ? 'Error' : 'Down'}`,
        message: `${serviceName} is ${status === 'error' ? 'experiencing issues' : 'down'}`,
        type: 'error',
        serviceName,
        reason,
        logData: latestMetrics ? `CPU: ${latestMetrics.cpu}%\nMemory: ${latestMetrics.memory}%\nNetwork: ${(latestMetrics.network / 1000).toFixed(2)} MB/s` : null
      })
    }
  }, [status, serviceName, chartData, notify])

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">CPU Usage</h3>
            <Badge variant={chartData[chartData.length - 1]?.cpu > 80 ? "destructive" : "outline"}>
              {chartData[chartData.length - 1]?.cpu?.toFixed(1)}%
            </Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Memory Usage</h3>
            <Badge variant={chartData[chartData.length - 1]?.memory > 90 ? "destructive" : "outline"}>
              {chartData[chartData.length - 1]?.memory?.toFixed(1)}%
            </Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Network</h3>
            <Badge variant="outline">
              {(chartData[chartData.length - 1]?.network / 1000).toFixed(2)} MB/s
            </Badge>
          </div>
        </Card>
      </div>

      {status === 'stopped' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Service is currently down. Please check the logs for more information.
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Service is experiencing issues. Please check the logs for more information.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 flex-1 flex flex-col min-h-0">
        <h3 className="font-medium mb-4">Resource Usage Trend</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#2563eb" 
                name="CPU"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#8b5cf6" 
                name="Memory"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}