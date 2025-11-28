"use client"

import { Clock } from "lucide-react"
import { useState } from "react"

interface TimelineEvent {
  time: string
  action: string
  by: string
}

interface TimelinePopoverProps {
  events: TimelineEvent[]
}

export function TimelinePopover({ events }: TimelinePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label="View timeline"
      >
        <Clock className="h-5 w-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 p-4 animate-in fade-in-0 zoom-in-95">
          <h3 className="text-sm font-semibold mb-3">Request Timeline</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="text-sm pb-3 border-b border-border last:border-0 last:pb-0">
                <p className="font-medium text-xs text-muted-foreground">{event.time}</p>
                <p className="text-foreground">{event.action}</p>
                <p className="text-xs text-muted-foreground">By: {event.by}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
