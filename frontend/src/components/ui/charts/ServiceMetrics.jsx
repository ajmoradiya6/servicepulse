"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Activity } from 'lucide-react'

export function ServiceMetrics({ data = [], status }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setChartData(data.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        ...point
      })))
    }
  }, [data])

  return (
    <div className="space-y-4">
      {status !== 'connected' && (
        <Alert>
          <Activity className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            {status === 'connecting' ? 'Connecting to metrics service...' : 'Connection error'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <Card className="p-4">
        <h3 className="font-medium mb-4">Resource Usage Trend</h3>
        <div className="h-[300px]">
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