"use client"

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function AnimatedDigit({ digit, isAnimating }) {
  return (
    <div className="relative h-[1.2em] w-[0.6em] overflow-hidden inline-block">
      <AnimatePresence mode="wait">
        <motion.div
          key={digit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
            velocity: 2,
            restDelta: 0.001
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className={`transition-colors duration-300 ${isAnimating ? 'text-primary' : ''}`}>
            {digit}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function AnimatedNumber({ value, decimals = 1, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsAnimating(true)
      setDisplayValue(value)
      prevValue.current = value
      const timer = setTimeout(() => setIsAnimating(false), 800)
      return () => clearTimeout(timer)
    }
  }, [value])

  const formattedValue = Number(displayValue).toFixed(decimals)
  const digits = formattedValue.split('')

  return (
    <div className="inline-flex items-center">
      {digits.map((digit, index) => (
        <AnimatedDigit 
          key={`${index}-${digit}`} 
          digit={digit} 
          isAnimating={isAnimating}
        />
      ))}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </div>
  )
} 