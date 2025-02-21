"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

const LOG_LEVELS = ['info', 'warning', 'error']
const LOG_MESSAGES = {
  service1: [
    { level: 'info', message: 'Authentication service started' },
    { level: 'warning', message: 'High memory usage in auth cache' },
    { level: 'info', message: 'User session validated' },
    { level: 'error', message: 'Failed login attempt detected' },
    { level: 'info', message: 'Token refresh completed' }
  ],
  service2: [
    { level: 'info', message: 'Payment gateway initialized' },
    { level: 'warning', message: 'Transaction timeout' },
    { level: 'error', message: 'Payment verification failed' },
    { level: 'info', message: 'New payment processed' },
    { level: 'warning', message: 'Rate limit approaching' }
  ],
  service3: [
    { level: 'info', message: 'Data processing started' },
    { level: 'warning', message: 'Processing queue backup' },
    { level: 'error', message: 'ETL job failed' },
    { level: 'info', message: 'Backup completed' },
    { level: 'warning', message: 'High disk usage detected' }
  ]
}

export function useMetricsSocket(serviceId, settings) {
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  
  // Store service-specific data in a ref to persist across renders
  const serviceDataRef = useRef({})
  const [data, setData] = useState(null)

  // Add latest metrics state
  const [latestMetrics, setLatestMetrics] = useState({
    cpu: 0,
    memory: 0,
    activeConnections: 0
  })

  // Add logs state
  const [logs, setLogs] = useState([])

  // Service-specific ranges and configurations
  const getServiceRanges = useCallback((service) => {
    switch(service) {
      case 'service1':
        return { cpu: [20, 40], memory: [30, 50], connections: [50, 150] }
      case 'service2':
        return { cpu: [40, 70], memory: [60, 80], connections: [100, 300] }
      case 'service3':
        return { cpu: [50, 90], memory: [70, 95], connections: [200, 500] }
      default:
        return { cpu: [30, 50], memory: [40, 60], connections: [100, 200] }
    }
  }, [])

  const generateMetrics = useCallback(() => {
    const ranges = getServiceRanges(serviceId)
    const getRandom = (min, max) => min + Math.random() * (max - min)

    // Get the last metrics for this service to ensure continuity
    const lastMetrics = serviceDataRef.current[serviceId]?.metrics?.slice(-1)[0]
    const baseValue = lastMetrics || {
      cpu: ranges.cpu[0],
      memory: ranges.memory[0],
      disk: 50,
      network: 500
    }

    // Generate new values with small variations from last values
    const variation = 5 // Maximum percentage change
    const newMetrics = {
      timestamp: new Date().toISOString(),
      cpu: Math.max(ranges.cpu[0], Math.min(ranges.cpu[1], 
        baseValue.cpu + (Math.random() - 0.5) * variation)),
      memory: Math.max(ranges.memory[0], Math.min(ranges.memory[1], 
        baseValue.memory + (Math.random() - 0.5) * variation)),
      disk: Math.max(40, Math.min(90, baseValue.disk + (Math.random() - 0.5) * variation)),
      network: Math.max(100, Math.min(1000, baseValue.network + (Math.random() - 0.5) * 50)),
      activeConnections: Math.floor(getRandom(...ranges.connections))
    }

    return newMetrics
  }, [serviceId, getServiceRanges])

  const generateLog = useCallback(() => {
    const serviceLogs = LOG_MESSAGES[serviceId] || LOG_MESSAGES.service1
    const logEntry = serviceLogs[Math.floor(Math.random() * serviceLogs.length)]
    
    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level: logEntry.level,
      message: logEntry.message,
      service: serviceId
    }
  }, [serviceId])

  // Function to update data
  const updateData = useCallback(() => {
    const newMetrics = generateMetrics()
    const newLog = generateLog()
    
    // Update service-specific data store
    serviceDataRef.current[serviceId] = {
      metrics: [
        ...(serviceDataRef.current[serviceId]?.metrics || []),
        newMetrics
      ].slice(-50),
      logs: [
        ...(serviceDataRef.current[serviceId]?.logs || []),
        newLog
      ].slice(-100) // Keep last 100 logs
    }

    // Update latest metrics for overview tiles
    setLatestMetrics({
      cpu: newMetrics.cpu,
      memory: newMetrics.memory,
      activeConnections: newMetrics.activeConnections
    })

    // Update logs
    setLogs(serviceDataRef.current[serviceId].logs)

    setData({
      serviceId,
      metrics: serviceDataRef.current[serviceId].metrics
    })
    setStatus('connected')
  }, [generateMetrics, generateLog, serviceId])

  // Handle service switching
  useEffect(() => {
    setStatus('connecting')
    
    // If we have existing data for this service, use it
    if (serviceDataRef.current[serviceId]) {
      setLogs(serviceDataRef.current[serviceId].logs || [])
      setData({
        serviceId,
        metrics: serviceDataRef.current[serviceId].metrics
      })
      setStatus('connected')
    } else {
      // Initialize new service data
      setIsFirstLoad(true)
      setLogs([])
    }
  }, [serviceId])

  // Initial data load effect
  useEffect(() => {
    if (isFirstLoad) {
      // Generate initial dataset
      const initialDataPoints = 10
      for (let i = 0; i < initialDataPoints; i++) {
        updateData()
      }
      setIsFirstLoad(false)
    }
  }, [isFirstLoad, updateData])

  // Regular update interval
  useEffect(() => {
    let interval
    if (settings.realtime && !isFirstLoad) {
      interval = setInterval(() => {
        updateData()
      }, settings.interval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [settings.realtime, settings.interval, isFirstLoad, updateData])

  return { 
    data: data?.metrics || [], 
    status, 
    error,
    latestMetrics,
    logs
  }
}