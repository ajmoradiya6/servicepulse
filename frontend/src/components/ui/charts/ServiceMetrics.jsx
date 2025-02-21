"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from "@/components/ui/card"

const demoData = [
  { time: '00:00', cpu: 45, memory: 60, connections: 23 },
  { time: '01:00', cpu: 55, memory: 65, connections: 28 },
  { time: '02:00', cpu: 40, memory: 62, connections: 20 },
  { time: '03:00', cpu: 65, memory: 70, connections: 25 },
  { time: '04:00', cpu: 60, memory: 68, connections: 22 },
]

export function ServiceMetrics() {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-medium mb-4">CPU Usage Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Memory Usage</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="memory" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}