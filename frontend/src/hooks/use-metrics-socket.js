"use client"

import { useState, useEffect } from 'react'

export function useMetricsSocket(serviceId) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    // Simulate WebSocket with interval for demo
    // In production, replace with actual WebSocket connection
    const interval = setInterval(() => {
      const newData = {
        timestamp: new Date().toISOString(),
        metrics: {
          cpu: Math.random() * 100,
          memory: 50 + Math.random() * 50,
          disk: 40 + Math.random() * 60,
          network: Math.random() * 1000,
          processes: {
            total: Math.floor(80 + Math.random() * 40),
            running: Math.floor(70 + Math.random() * 20),
            suspended: Math.floor(5 + Math.random() * 10),
          },
          threads: {
            total: Math.floor(200 + Math.random() * 100),
            active: Math.floor(150 + Math.random() * 50),
          }
        }
      }
      setData(newData)
      setStatus('connected')
    }, 1000)

    return () => clearInterval(interval)
  }, [serviceId])

  return { data, status }
}