import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressMapProps {
  steps: string[]
  currentStep: number
  statuses?: {
    [key: number]: "completed" | "current" | "pending"
  }
}

export function ProgressMap({ steps, currentStep, statuses }: ProgressMapProps) {
  const getStatusColor = (index: number) => {
    if (statuses?.[index] === "completed") return "bg-green-500"
    if (statuses?.[index] === "current") return "bg-primary"
    return "bg-muted"
  }

  const getStatusTextColor = (index: number) => {
    if (statuses?.[index] === "completed" || statuses?.[index] === "current") {
      return "text-foreground"
    }
    return "text-muted-foreground"
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between gap-1">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1 min-w-0">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                  getStatusColor(index),
                )}
              >
                {statuses?.[index] === "completed" ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <Circle className="h-2 w-2 text-white fill-current" />
                )}
              </div>
              <p
                className={cn(
                  "text-xs font-medium mt-1 text-center leading-tight line-clamp-2",
                  getStatusTextColor(index),
                )}
              >
                {step}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-0.5 rounded-full transition-colors flex-shrink-0",
                  statuses?.[index] === "completed" || statuses?.[index] === "current" ? "bg-green-500" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                getStatusColor(index),
              )}
            >
              {statuses?.[index] === "completed" ? (
                <Check className="h-3 w-3 text-white" />
              ) : (
                <Circle className="h-2 w-2 text-white fill-current" />
              )}
            </div>
            <p className={cn("text-xs font-medium", getStatusTextColor(index))}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
