"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { Search, Download, Filter } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export function LogsSection({ logs = [], autoScroll = true }) {
  const scrollRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  
  const debouncedSearch = useDebounce(searchTerm, 300)

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          log.level.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter
      return matchesSearch && matchesLevel
    })
  }, [logs, debouncedSearch, levelFilter])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20'
      default:
        return 'bg-blue-50 dark:bg-blue-950/20'
    }
  }

  const exportLogs = async () => {
    setIsExporting(true)
    try {
      const csvContent = filteredLogs.map(log => 
        `${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')},${log.level},${log.message.replace(/,/g, ';')}`
      ).join('\n')
      
      const blob = new Blob([`Timestamp,Level,Message\n${csvContent}`], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `service-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={exportLogs}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">
            Total: {filteredLogs.length}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10">
            Info: {filteredLogs.filter(l => l.level === 'info').length}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10">
            Warnings: {filteredLogs.filter(l => l.level === 'warning').length}
          </Badge>
          <Badge variant="outline" className="bg-red-500/10">
            Errors: {filteredLogs.filter(l => l.level === 'error').length}
          </Badge>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found matching your criteria
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`${getLogColor(log.level)} rounded-sm`}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      log.level === 'error' ? 'bg-red-500 text-white' :
                      log.level === 'warning' ? 'bg-yellow-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-sm text-muted-foreground min-w-[80px]">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="text-sm">
                      {log.message}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}