"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function PayPerHourPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [showDaysDropdown, setShowDaysDropdown] = useState(false)
  const daysDropdownRef = useRef<HTMLDivElement>(null)

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (daysDropdownRef.current && !daysDropdownRef.current.contains(event.target as Node)) {
        setShowDaysDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const removeDay = (day: string) => {
    setSelectedDays(prev => prev.filter(d => d !== day))
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Pay per Hour"
        description="Manage your pay per hour courses and bookings"
      />

      <div className="px-6">
        <Card>
          <CardHeader>
            <CardTitle>Pay per Hour Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Time Slot - AM and PM */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Time Slot</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AM Time Slot */}
                <div className="space-y-2">
                  <Label htmlFor="timeSlotAM" className="text-sm font-medium">
                    Morning
                  </Label>
                  <Input
                    id="timeSlotAM"
                    type="time"
                    min="00:00"
                    max="11:59"
                    className="w-full"
                  />
                </div>

                {/* PM Time Slot */}
                <div className="space-y-2">
                  <Label htmlFor="timeSlotPM" className="text-sm font-medium">
                    Evening
                  </Label>
                  <Input
                    id="timeSlotPM"
                    type="time"
                    min="12:00"
                    max="23:59"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Days Available - Multi-Select Dropdown */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Days Available</Label>
              <div className="relative" ref={daysDropdownRef}>
                <div
                  className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                  onClick={() => setShowDaysDropdown(!showDaysDropdown)}
                >
                  {selectedDays.length > 0 ? (
                    selectedDays.map((day) => (
                      <Badge
                        key={day}
                        variant="secondary"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeDay(day)
                        }}
                      >
                        {day}
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Select days</span>
                  )}
                </div>
                {showDaysDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent"
                        onClick={() => toggleDay(day)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{day}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fee per Hour */}
            <div className="space-y-2">
              <Label htmlFor="feePerHour" className="text-base font-semibold">
                Fee per hour
              </Label>
              <Input
                id="feePerHour"
                type="number"
                placeholder="Enter fee per hour"
                className="w-full"
              />
            </div>

            {/* Submit and Edit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors"
              >
                Edit
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
              >
                Submit
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

