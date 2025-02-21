"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function MetricComparison({ data }) {
  const [metric, setMetric] = useState('cpu')

  const metrics = [
    { value: 'cpu', label: 'CPU Usage' },
    { value: 'memory', label: 'Memory Usage' },
    { value: 'disk', label: 'Disk Usage' },
    { value: 'network', label: 'Network Usage' }
  ]

  // Demo comparison data
  const comparisonData = [
    { time: '00:00', current: { cpu: 45, memory: 60 }, previous: { cpu: 40, memory: 55 }, benchmark: { cpu: 50, memory: 65 } },
    { time: '01:00', current: { cpu: 55, memory: 65 }, previous: { cpu: 50, memory: 60 }, benchmark: { cpu: 52, memory: 63 } },
    { time: '02:00', current: { cpu: 40, memory: 62 }, previous: { cpu: 45, memory: 58 }, benchmark: { cpu: 48, memory: 60 } },
    { time: '03:00', current: { cpu: 65, memory: 70 }, previous: { cpu: 60, memory: 65 }, benchmark: { cpu: 55, memory: 62 } },
    { time: '04:00', current: { cpu: 60, memory: 68 }, previous: { cpu: 55, memory: 63 }, benchmark: { cpu: 53, memory: 64 } },
  ]

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Metric Comparison</h3>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={`current.${metric}`}
                name="Current"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey={`previous.${metric}`}
                name="Previous Period"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey={`benchmark.${metric}`}
                name="Benchmark"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}