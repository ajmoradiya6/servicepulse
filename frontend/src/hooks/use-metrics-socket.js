"use client"

import { useState, useEffect, useCallback } from 'react'

export function useMetricsSocket(serviceId) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)

  const generateMetrics = useCallback(() => ({
    timestamp: new Date().toISOString(),
    metrics: {
      cpu: 30 + Math.random() * 50,
      memory: 40 + Math.random() * 40,
      disk: 50 + Math.random() * 30,
      network: Math.random() * 1000,
      activeConnections: Math.floor(100 + Math.random() * 100),
      logs: Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
        message: `Log message ${i + 1}`
      }))
    }
  }), [])

  useEffect(() => {
    let interval
    
    const connectWebSocket = () => {
      try {
        setStatus('connecting')
        
        interval = setInterval(() => {
          const newData = generateMetrics()
          setData(newData)
          setStatus('connected')

          if (Math.random() > 0.95) {
            setError('High resource usage detected')
            setTimeout(() => setError(null), 3000)
          }
        }, 1000)
      } catch (err) {
        setStatus('error')
        setError(err.message)
      }
    }

    connectWebSocket()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [serviceId, generateMetrics])

  return { data, status, error }
}