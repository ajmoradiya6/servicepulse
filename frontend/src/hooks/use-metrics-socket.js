"use client"

import { useState, useEffect, useCallback } from 'react'

const LOG_LEVELS = ['info', 'warning', 'error']
const LOG_MESSAGES = {
  service1: [
    'Authentication service started',
    'Login attempt failed',
    'Token refresh completed',
    'User session expired',
    'OAuth validation success'
  ],
  service2: [
    'Payment processed successfully',
    'Transaction declined',
    'Gateway timeout',
    'Refund initiated',
    'Invoice generated'
  ],
  service3: [
    'Data batch processed',
    'ETL job completed',
    'Processing queue full',
    'Data validation error',
    'Backup completed'
  ]
}

export function useMetricsSocket(serviceId, settings) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // Service-specific random ranges
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

  const generateLog = useCallback(() => {
    const messages = LOG_MESSAGES[serviceId] || LOG_MESSAGES.service1
    return {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      service: serviceId
    }
  }, [serviceId])

  const generateMetrics = useCallback(() => {
    const ranges = getServiceRanges(serviceId)
    const getRandom = (min, max) => min + Math.random() * (max - min)

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: getRandom(...ranges.cpu),
        memory: getRandom(...ranges.memory),
        disk: 50 + Math.random() * 30,
        network: Math.random() * 1000,
        activeConnections: Math.floor(getRandom(...ranges.connections)),
        logs: Array.from({ length: 1 }, () => generateLog())
      }
    }
  }, [serviceId, getServiceRanges, generateLog])

  // Reset data when service changes
  useEffect(() => {
    setData(null)
    setStatus('connecting')
    setIsFirstLoad(true)
  }, [serviceId])

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

    // Service-specific error thresholds
    const ranges = getServiceRanges(serviceId)
    if (newData.metrics.cpu > ranges.cpu[1] * 0.9) {
      setError(`High CPU usage detected in ${serviceId}`)
      setTimeout(() => setError(null), 3000)
    }
  }, [generateMetrics, serviceId, getServiceRanges])

  // Initial data load effect
  useEffect(() => {
    if (isFirstLoad) {
      // Add a small delay to show connecting state
      setTimeout(() => {
        updateData()
        setIsFirstLoad(false)
      }, 500)
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