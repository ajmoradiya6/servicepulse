"use client"

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

export function generateLogReport(logs) {
  const doc = new jsPDF()
  
  // Add header
  doc.setFontSize(20)
  doc.text('Service Logs Report', 14, 15)
  
  // Add timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 25)

  // Add stats
  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length
  }

  doc.text('Summary:', 14, 35)
  doc.text(`Total Logs: ${stats.total}`, 14, 42)
  doc.text(`Info: ${stats.info}`, 14, 49)
  doc.text(`Warnings: ${stats.warning}`, 14, 56)
  doc.text(`Errors: ${stats.error}`, 14, 63)

  // Add logs table
  const tableData = logs.map(log => [
    format(new Date(log.timestamp), 'HH:mm:ss'),
    log.level.toUpperCase(),
    log.message
  ])

  doc.autoTable({
    startY: 70,
    head: [['Time', 'Level', 'Message']],
    body: tableData,
    styles: {
      fontSize: 8
    },
    headStyles: {
      fillColor: [41, 128, 185]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  })

  return doc
}