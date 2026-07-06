import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900", className)} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}>{children}</h3>
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("mt-1 text-sm text-gray-500 dark:text-gray-400", className)}>{children}</p>
}
