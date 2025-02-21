"use client"

import { useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export function LogsSection({ logs = [], autoScroll = true }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/10 border-red-500 text-red-500'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
      default:
        return 'bg-blue-500/10 border-blue-500 text-blue-500'
    }
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">System Logs</h3>
        <Badge variant="outline" className="font-mono">
          {logs.length} entries
        </Badge>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 border rounded-lg ${getLogColor(log.level)} animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={getLogColor(log.level)}>
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-sm opacity-70">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              <p className="text-sm">{log.message}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </Card>
  )
}