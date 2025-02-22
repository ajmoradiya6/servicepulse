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

export function LogsSection({ logs = [], autoScroll = true, isLoading }) {
  const scrollRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
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

  const getLogStyles = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/10 border-red-500 text-red-500 border rounded-lg'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-500 border rounded-lg'
      default:
        return 'bg-blue-500/10 border-blue-500 text-blue-500 border rounded-lg'
    }
  }

  const getLevelBadgeStyles = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/20 text-red-700'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-700'
      default:
        return 'bg-blue-500/20 text-blue-700'
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

  // Loading skeleton for logs
  const LogSkeleton = () => (
    <div className="animate-skeleton-pulse p-3 rounded-lg" 
      style={{ "--skeleton-from": "var(--card)", "--skeleton-to": "var(--muted)" }}>
      <div className="flex items-center gap-3">
        <div className="w-16 h-6 bg-muted rounded"></div>
        <div className="w-20 h-4 bg-muted rounded"></div>
        <div className="flex-1 h-4 bg-muted rounded"></div>
      </div>
    </div>
  )

  return (
    <Card className="p-4 animate-fade-in">
      <div className="space-y-4">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
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
              <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap animate-fade-in" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="w-24 h-6 bg-muted rounded animate-skeleton-pulse"></div>
            ))
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Logs */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <LogSkeleton key={i} />
              ))
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground animate-fade-in">
                No logs found matching your criteria
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`${getLogStyles(log.level)} animate-fade-in transition-all duration-300 ${
                    isTransitioning ? 'animate-service-exit' : 'animate-service-enter'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded transition-colors duration-300 ${getLevelBadgeStyles(log.level)}`}>
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