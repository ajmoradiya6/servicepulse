"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export function useMetricsSocket(serviceId, settings) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [latestMetrics, setLatestMetrics] = useState({})
  const [logs, setLogs] = useState([])
  const serviceDataRef = useRef({})
  
  // Track service statuses separately
  const [serviceStatuses, setServiceStatuses] = useState({
    service1: 'running',
    service2: 'running',
    service3: 'running'
  })

  const generateServiceStatus = useCallback((currentStatus) => {
    // 90% chance to keep current status, 10% chance to change
    if (Math.random() > 0.9) {
      return currentStatus === 'running' ? 'stopped' : 'running'
    }
    return currentStatus
  }, [])

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

    return {
      timestamp: new Date().toISOString(),
      cpu: getRandom(...ranges.cpu),
      memory: getRandom(...ranges.memory),
      disk: 50 + Math.random() * 30,
      network: Math.random() * 1000,
      activeConnections: Math.floor(getRandom(...ranges.connections))
    }
  }, [serviceId, getServiceRanges])

  const generateLog = useCallback(() => ({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
    message: `Service ${serviceId} ${Math.random() > 0.5 ? 'running normally' : 'processing requests'}`
  }), [serviceId])

  // Update service statuses periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setServiceStatuses(prev => ({
        service1: generateServiceStatus(prev.service1),
        service2: generateServiceStatus(prev.service2),
        service3: generateServiceStatus(prev.service3)
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [generateServiceStatus])

  // Main update effect
  useEffect(() => {
    let interval
    
    const updateData = () => {
      const newMetrics = generateMetrics()
      const newLog = generateLog()
      
      // Update service-specific data
      serviceDataRef.current[serviceId] = {
        metrics: [
          ...(serviceDataRef.current[serviceId]?.metrics || []),
          newMetrics
        ].slice(-50),
        logs: [
          ...(serviceDataRef.current[serviceId]?.logs || []),
          newLog
        ].slice(-100)
      }

      setLatestMetrics(newMetrics)
      setLogs(serviceDataRef.current[serviceId].logs)
      setData(serviceDataRef.current[serviceId].metrics)
      setStatus('connected')

      // Add service-specific logs based on status changes
      if (serviceStatuses[serviceId] === 'stopped') {
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Service ${serviceId} is not responding`
        }, ...prev])
      }
    }

    // Initial update
    updateData()

    // Set up interval if realtime is enabled
    if (settings.realtime) {
      interval = setInterval(updateData, settings.interval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [serviceId, settings.realtime, settings.interval, generateMetrics, generateLog, serviceStatuses])

  return { 
    data, 
    status: serviceStatuses[serviceId], // Return actual service status
    error,
    latestMetrics,
    logs,
    serviceStatuses // Return all service statuses
  }
}