"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export function SettingsPanel({ open, onOpenChange, settings, onSettingsChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Monitoring Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="realtime">Real-time Monitoring</Label>
                <Switch
                  id="realtime"
                  checked={settings.realtime}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ ...settings, realtime: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Update Interval</Label>
                <Select
                  value={settings.interval.toString()}
                  onValueChange={(value) => 
                    onSettingsChange({ ...settings, interval: parseInt(value) })
                  }
                  disabled={!settings.realtime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Log Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="log-autoscroll">Auto-scroll Logs</Label>
                <Switch
                  id="log-autoscroll"
                  checked={settings.logAutoScroll}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ ...settings, logAutoScroll: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}