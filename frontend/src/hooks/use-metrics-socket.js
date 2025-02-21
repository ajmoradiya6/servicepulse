"use client"

import { useState, useEffect, useCallback } from 'react'

const LOG_LEVELS = ['info', 'warning', 'error']
const LOG_MESSAGES = [
  'Service started successfully',
  'High memory usage detected',
  'Database connection established',
  'Cache miss rate increased',
  'API response time degraded',
  'Network latency spike detected',
  'Authentication service restarted',
  'Background job completed',
  'Resource limit approaching',
  'Configuration reload required'
]

export function useMetricsSocket(serviceId, settings) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const generateLog = useCallback(() => ({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)],
    message: LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)],
    service: serviceId
  }), [serviceId])

  const generateMetrics = useCallback(() => ({
    timestamp: new Date().toISOString(),
    metrics: {
      cpu: 30 + Math.random() * 50,
      memory: 40 + Math.random() * 40,
      disk: 50 + Math.random() * 30,
      network: Math.random() * 1000,
      activeConnections: Math.floor(100 + Math.random() * 100),
      logs: Array.from({ length: 1 }, () => generateLog())
    }
  }), [generateLog])

  // Function to update data
  const updateData = useCallback(() => {
    const newData = generateMetrics()
    setData(prev => ({
      ...newData,
      metrics: {
        ...newData.metrics,
        logs: [...(prev?.metrics?.logs || []), ...newData.metrics.logs].slice(-100)
      }
    }))
    setStatus('connected')

    if (Math.random() > 0.95) {
      setError('High resource usage detected')
      setTimeout(() => setError(null), 3000)
    }
  }, [generateMetrics])

  // Initial data load effect
  useEffect(() => {
    if (isFirstLoad) {
      updateData()
      setIsFirstLoad(false)
    }
  }, [isFirstLoad, updateData])

  // Interval updates effect
  useEffect(() => {
    let interval

    if (settings.realtime && !isFirstLoad) {
      interval = setInterval(() => {
        updateData()
      }, settings.interval * 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [settings.realtime, settings.interval, isFirstLoad, updateData])

  return { data, status, error }
}