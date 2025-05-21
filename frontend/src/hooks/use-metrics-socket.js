"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export function useMetricsSocket(services, selectedServiceId, settings) {
  // All useState hooks must be called in the same order on every render
  const [data, setData] = useState([]) // Data for the selected service
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [latestMetrics, setLatestMetrics] = useState({}) // Metrics for the selected service
  const [logs, setLogs] = useState([]) // Logs for the selected service
  const [serviceStatuses, setServiceStatuses] = useState({}) // Status for ALL services
  const [allLatestMetrics, setAllLatestMetrics] = useState({}) // Latest metrics for ALL services
  const [allLogs, setAllLogs] = useState({}) // Logs for ALL services

  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs don't count in the hook order
  const serviceDataRef = useRef({})
  const isFirstLoad = useRef(true)
  const isClient = useRef(false)

  // Initialize service statuses based on the provided services list
  useEffect(() => {
    if (!services || services.length === 0) return
    const initialStatuses = {}
    services.forEach(service => {
      initialStatuses[service.id] = 'running' // Assume running initially
    })
    setServiceStatuses(initialStatuses)
  }, [services]) // Re-run when the list of services changes

  const generateServiceStatus = useCallback((currentStatus) => {
    if (Math.random() > 0.95) {
      return currentStatus === 'running' ? 'stopped' : 'running'
    }
    return currentStatus
  }, [])

  const getServiceRanges = useCallback((serviceId) => {
    switch(serviceId) {
      case 'service1':
        return { cpu: [20, 40], memory: [30, 50], connections: [50, 150] }
      case 'service2':
        return { cpu: [40, 70], memory: [60, 80], connections: [100, 300] }
      case 'service3':
        return { cpu: [50, 90], memory: [70, 95], connections: [200, 500] }
      default:
        return { cpu: [35, 55], memory: [45, 65], connections: [80, 180] }
    }
  }, [])

  const generateMetrics = useCallback((serviceId) => {
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
  }, [getServiceRanges])

  const generateLog = useCallback((serviceId) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
    message: `Service ${serviceId} ${Math.random() > 0.5 ? 'running normally' : 'processing requests'}`
  }), [])

  // Initialize client-side functionality
  useEffect(() => {
    isClient.current = true
    setIsInitialized(true)
  }, [])

  // Reset connection status when switching services (now based on selectedServiceId)
  useEffect(() => {
    if (!isInitialized || !selectedServiceId) return
    
    setConnectionStatus('connecting')
    
    // Simulate connection delay
    const timer = setTimeout(() => {
      setConnectionStatus('connected')
      isFirstLoad.current = false
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedServiceId, isInitialized])

  // Update service statuses periodically for ALL services
  useEffect(() => {
    if (!isInitialized || !services || services.length === 0) return
    
    const updateStatuses = () => {
      setServiceStatuses(prev => {
        const newStatuses = { ...prev }
        services.forEach(service => {
          if (prev[service.id] !== undefined) {
            newStatuses[service.id] = generateServiceStatus(prev[service.id])
          } else {
            newStatuses[service.id] = 'running'
          }
        })
        Object.keys(newStatuses).forEach(serviceId => {
          if (!services.find(service => service.id === serviceId)) {
            delete newStatuses[serviceId]
          }
        })
        return newStatuses
      })
    }

    const interval = setInterval(updateStatuses, 10000)
    return () => clearInterval(interval)
  }, [generateServiceStatus, isInitialized, services])

  // Main update effect - generate and store data/logs for ALL services
  useEffect(() => {
    if (!isInitialized || !services || services.length === 0 || Object.keys(serviceStatuses).length === 0) return
    
    let interval
    
    const updateData = () => {
      const currentServiceData = { ...serviceDataRef.current }
      const latestMetricsForAll = {}
      const logsForAll = {}

      services.forEach(service => {
        const newMetrics = generateMetrics(service.id)
        const newLog = generateLog(service.id)
        
        currentServiceData[service.id] = {
          metrics: [
            ...(currentServiceData[service.id]?.metrics || []),
            newMetrics
          ].slice(-50),
          logs: [
            ...(currentServiceData[service.id]?.logs || []),
            newLog
          ].slice(-100)
        }
        latestMetricsForAll[service.id] = newMetrics
        logsForAll[service.id] = currentServiceData[service.id].logs

        if (serviceStatuses[service.id] === 'stopped') {
          // Add a specific log entry for stopped status
          // The notification in page.js should pick this up
        } else if (serviceStatuses[service.id] === 'error') {
          // Add a specific log entry for error status
          // The notification in page.js should pick this up
        }

      })

      serviceDataRef.current = currentServiceData
      setAllLatestMetrics(latestMetricsForAll)
      setAllLogs(logsForAll)

      if (selectedServiceId) {
        setData(serviceDataRef.current[selectedServiceId]?.metrics || [])
        setLatestMetrics(serviceDataRef.current[selectedServiceId]?.metrics?.[serviceDataRef.current[selectedServiceId]?.metrics.length - 1] || {})
        setLogs(serviceDataRef.current[selectedServiceId]?.logs || [])
      }
    }

    updateData()

    if (settings.realtime) {
      interval = setInterval(updateData, settings.interval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isInitialized, services, serviceStatuses, selectedServiceId, settings.realtime, settings.interval, generateMetrics, generateLog])

  return { 
    data,
    connectionStatus,
    error,
    latestMetrics,
    logs,
    serviceStatuses,
    allLatestMetrics,
    allLogs,
    isFirstLoad: isFirstLoad.current,
    isInitialized
  }
}