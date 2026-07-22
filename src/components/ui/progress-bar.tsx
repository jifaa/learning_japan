"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning"
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  const variantClasses = {
    default: "[&>div]:bg-primary",
    success: "[&>div]:bg-success",
    warning: "[&>div]:bg-warning",
  }

  return (
    <div suppressHydrationWarning className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div suppressHydrationWarning className="flex items-center justify-between text-sm">
          {label && <p className="font-medium text-foreground">{label}</p>}
          {showValue && (
            <p suppressHydrationWarning className="text-muted-foreground">
              {value}/{max}
            </p>
          )}
        </div>
      )}
      <div
        suppressHydrationWarning
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size]
        )}
      >
        <div
          suppressHydrationWarning
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
