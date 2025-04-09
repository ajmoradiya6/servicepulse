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
        return 'bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50'
      case 'warning':
        return 'bg-yellow-100/50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50'
      default:
        return 'bg-blue-100/50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50'
    }
  }

  const getTagColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-200 dark:bg-red-700/50 text-red-800 dark:text-red-100 border-red-300 dark:border-red-600/50'
      case 'warning':
        return 'bg-yellow-200 dark:bg-yellow-700/50 text-yellow-800 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600/50'
      default:
        return 'bg-blue-200 dark:bg-blue-700/50 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-600/50'
    }
  }

  const getBadgeColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  const getBadgeIcon = (level) => {
    switch (level) {
      case 'error':
        return '●'
      case 'warning':
        return '●'
      default:
        return '●'
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
    } catch (error) {
      console.error('Error exporting logs:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full sm:w-[300px]"
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

      <div className="flex gap-2 flex-wrap mb-4">
        <Badge variant="outline">
          Total: {filteredLogs.length}
        </Badge>
        <Badge variant="outline" className={getLogColor('info')}>
          Info: {filteredLogs.filter(l => l.level === 'info').length}
        </Badge>
        <Badge variant="outline" className={getLogColor('warning')}>
          Warnings: {filteredLogs.filter(l => l.level === 'warning').length}
        </Badge>
        <Badge variant="outline" className={getLogColor('error')}>
          Errors: {filteredLogs.filter(l => l.level === 'error').length}
        </Badge>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${getLogColor(log.level)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTagColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/70">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="text-sm font-mono text-foreground/90 tracking-tight">{log.message}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}