import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({ progress, className, barClassName, showLabel, size = "md" }: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }

  const getColor = () => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", getColor(), barClassName)}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}
