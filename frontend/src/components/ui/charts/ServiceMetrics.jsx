"use client"

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Brush, Area, AreaChart,
  ComposedChart
} from 'recharts'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Enhanced demo data with more metrics
const demoData = [
  { time: '00:00', cpu: 45, memory: 60, network: 30, diskUsage: 55, threads: 120, handles: 2400 },
  { time: '01:00', cpu: 55, memory: 65, network: 35, diskUsage: 56, threads: 125, handles: 2450 },
  { time: '02:00', cpu: 40, memory: 62, network: 28, diskUsage: 54, threads: 118, handles: 2380 },
  { time: '03:00', cpu: 65, memory: 70, network: 42, diskUsage: 58, threads: 130, handles: 2500 },
  { time: '04:00', cpu: 60, memory: 68, network: 38, diskUsage: 57, threads: 127, handles: 2470 },
  { time: '05:00', cpu: 48, memory: 63, network: 32, diskUsage: 56, threads: 122, handles: 2420 },
].map(item => ({
  ...item,
  networkIn: Math.random() * 100,
  networkOut: Math.random() * 100,
}))

export function ServiceMetrics() {
  const [timeRange, setTimeRange] = useState('1h')

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('CPU') || entry.name.includes('Memory') ? '%' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Performance Metrics</h2>
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
      </div>

      <Tabs defaultValue="combined" className="space-y-4">
        <TabsList>
          <TabsTrigger value="combined">Combined Metrics</TabsTrigger>
          <TabsTrigger value="network">Network Activity</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <Card className="p-4">
            <h3 className="font-medium mb-4">CPU & Memory Usage</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={demoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
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
                  <Brush dataKey="time" height={30} stroke="#8884d8" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Network I/O</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="networkIn"
                    name="Network In"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="networkOut"
                    name="Network Out"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Brush dataKey="time" height={30} stroke="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-4">
            <h3 className="font-medium mb-4">System Resources</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={demoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="threads"
                    name="Thread Count"
                    fill="#3b82f6"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="handles"
                    name="Handle Count"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Brush dataKey="time" height={30} stroke="#8884d8" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}