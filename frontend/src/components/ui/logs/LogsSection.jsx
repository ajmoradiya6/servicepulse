"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const LogEntry = ({ type, message, timestamp }) => (
  <div className={`p-2 border-l-4 ${
    type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
    type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
    'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
  } mb-2`}>
    <div className="flex items-center gap-2">
      <Badge variant={
        type === 'error' ? 'destructive' :
        type === 'warning' ? 'warning' : 'default'
      }>
        {type.toUpperCase()}
      </Badge>
      <span className="text-xs text-muted-foreground">{timestamp}</span>
    </div>
    <p className="mt-1 text-sm">{message}</p>
  </div>
)

export function LogsSection() {
  const demoLogs = [
    { type: 'info', message: 'Service started successfully', timestamp: '2024-01-20 10:00:00' },
    { type: 'warning', message: 'High memory usage detected', timestamp: '2024-01-20 10:01:23' },
    { type: 'error', message: 'Connection timeout', timestamp: '2024-01-20 10:02:45' },
    { type: 'info', message: 'Backup completed', timestamp: '2024-01-20 10:03:12' },
  ]

  return (
    <Card className="p-4">
      <Tabs defaultValue="application">
        <TabsList>
          <TabsTrigger value="application">Application Logs</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="application">
          <ScrollArea className="h-[400px] pr-4">
            {demoLogs.map((log, index) => (
              <LogEntry key={index} {...log} />
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="system">
          <ScrollArea className="h-[400px] pr-4">
            {demoLogs.reverse().map((log, index) => (
              <LogEntry key={index} {...log} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}