"use client"

import { useState, useEffect, useCallback } from 'react'

const METRICS_ENDPOINT = 'ws://localhost:8080/metrics'

export function useMetricsSocket(serviceId) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)

  // Generate realistic demo data
  const generateMetrics = useCallback(() => ({
    timestamp: new Date().toISOString(),
    metrics: {
      cpu: 30 + Math.random() * 50,
      memory: 40 + Math.random() * 40,
      disk: 50 + Math.random() * 30,
      network: Math.random() * 1000,
      activeConnections: Math.floor(100 + Math.random() * 100),
      processes: {
        total: Math.floor(80 + Math.random() * 20),
        running: Math.floor(60 + Math.random() * 15),
        suspended: Math.floor(5 + Math.random() * 5),
        list: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Process ${i + 1}`,
          cpu: Math.random() * 20,
          memory: Math.floor(100 + Math.random() * 400),
          threads: Math.floor(10 + Math.random() * 20),
          status: Math.random() > 0.2 ? 'running' : 'warning'
        }))
      },
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
        // For demo, we'll use an interval to simulate WebSocket
        setStatus('connecting')
        
        interval = setInterval(() => {
          const newData = generateMetrics()
          setData(newData)
          setStatus('connected')

          // Simulate occasional errors
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