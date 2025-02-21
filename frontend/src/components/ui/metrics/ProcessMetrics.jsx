"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpDown, MoreHorizontal, Activity } from 'lucide-react'

export function ProcessMetrics({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: 'cpu', direction: 'desc' })
  const [selectedProcess, setSelectedProcess] = useState(null)

  const sortedProcesses = [...(data?.processes?.list || [])].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] - b[sortConfig.key]
    }
    return b[sortConfig.key] - a[sortConfig.key]
  })

  const ProcessDetails = ({ process }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Process Details: {process.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Resource Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span>{process.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>{process.memory}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Threads:</span>
                  <span>{process.threads}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h4 className="font-medium mb-2">Network</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span>{process.connections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes In:</span>
                  <span>{(process.networkIn / 1024).toFixed(2)} KB/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes Out:</span>
                  <span>{(process.networkOut / 1024).toFixed(2)} KB/s</span>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h4 className="font-medium mb-2">CPU Usage Trend</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={process.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Process Details</h3>
            <p className="text-sm text-muted-foreground">
              {data?.processes?.total || 0} Active Processes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              CPU: {data?.metrics?.cpu.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="font-mono">
              Memory: {data?.metrics?.memory.toFixed(1)}%
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortConfig({
                      key: 'cpu',
                      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    CPU
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortConfig({
                      key: 'memory',
                      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    Memory
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProcesses.map((process, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{process.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {process.cpu.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell>{(process.memory / 1024).toFixed(2)} GB</TableCell>
                  <TableCell>
                    <Badge variant={process.status === 'running' ? 'success' : 'warning'}>
                      {process.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProcessDetails process={process} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}