import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProgressMapProps {
  steps: string[]
  currentStep: number
  statuses?: {
    [key: number]: "completed" | "current" | "pending"
  }
}

export function ProgressMap({ steps, currentStep, statuses }: ProgressMapProps) {
  const getStepStyles = (index: number) => {
    const status = statuses?.[index]
    
    if (status === "completed" || status === "current") {
      return {
        circle: "bg-green-500 border-2 border-green-600",
        showCheck: true,
      }
    }
    
    return {
      circle: "bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600",
      showCheck: false,
    }
  }

  const getConnectorStyles = (index: number) => {
    const status = statuses?.[index]
    if (status === "completed" || status === "current") {
      return "bg-green-500"
    }
    return "bg-gray-300 dark:bg-gray-600"
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step Dot */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center cursor-help transition-colors",
                    getStepStyles(index).circle,
                  )}
                >
                  {getStepStyles(index).showCheck && (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{step}</p>
              </TooltipContent>
            </Tooltip>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 transition-colors",
                  getConnectorStyles(index),
                )}
              />
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
