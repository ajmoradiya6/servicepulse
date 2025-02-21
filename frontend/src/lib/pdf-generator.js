"use client"

import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function generateMetricsReport(data, timeRange) {
  const doc = new jsPDF()
  
  // Add header
  doc.setFontSize(20)
  doc.text('Service Metrics Report', 14, 15)
  
  // Add timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25)
  doc.text(`Time Range: ${timeRange}`, 14, 30)

  // Add system overview
  doc.setFontSize(14)
  doc.text('System Overview', 14, 40)
  
  const systemData = [
    ['Metric', 'Value'],
    ['CPU Usage', `${data.cpu}%`],
    ['Memory Usage', `${data.memory}%`],
    ['Disk Usage', `${data.disk}%`],
    ['Process Count', data.processes.total],
  ]
  
  doc.autoTable({
    startY: 45,
    head: [systemData[0]],
    body: systemData.slice(1),
  })

  // Add process details
  doc.text('Process Details', 14, doc.autoTable.previous.finalY + 10)
  
  const processData = data.processList.map(proc => [
    proc.name,
    `${proc.cpu}%`,
    `${proc.memory}MB`,
    proc.status
  ])
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Process', 'CPU', 'Memory', 'Status']],
    body: processData,
  })

  return doc
}