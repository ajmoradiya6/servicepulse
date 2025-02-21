"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ProcessMetrics({ data }) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Process Details</h3>
          <Badge variant="outline">{data?.processes?.total || 0} Processes</Badge>
        </div>
        
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>Process {i + 1}</TableCell>
                  <TableCell>{(Math.random() * 10).toFixed(1)}%</TableCell>
                  <TableCell>{(Math.random() * 100).toFixed(0)} MB</TableCell>
                  <TableCell>
                    <Badge variant={Math.random() > 0.2 ? "success" : "warning"}>
                      {Math.random() > 0.2 ? "Running" : "Warning"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  )
}