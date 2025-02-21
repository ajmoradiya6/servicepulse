"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function MetricComparison({ data }) {
  const [metric, setMetric] = useState('cpu')
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const metrics = [
    { value: 'cpu', label: 'CPU Usage' },
    { value: 'memory', label: 'Memory Usage' },
    { value: 'disk', label: 'Disk Usage' },
    { value: 'network', label: 'Network Usage' }
  ]

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Metric Comparison</h3>
          <div className="flex items-center gap-4">
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
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={setDateRange}
            />
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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