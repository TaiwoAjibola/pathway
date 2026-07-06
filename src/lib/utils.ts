import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function daysUntil(date: Date | string | null | undefined): number {
  if (!date) return 0
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function daysSince(date: Date | string | null | undefined): number {
  if (!date) return 0
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    COMPLETED: "bg-green-500",
    IN_PROGRESS: "bg-blue-500",
    NOT_STARTED: "bg-gray-300 dark:bg-gray-600",
    WAITING: "bg-yellow-400",
    BLOCKED: "bg-red-500",
    EXPIRED: "bg-red-600",
    NEEDS_REVIEW: "bg-orange-500",
    LOCKED: "bg-gray-200 dark:bg-gray-700",
    UNLOCKED: "bg-blue-400",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    PENDING: "bg-yellow-400",
    UPLOADED: "bg-blue-400",
    REVIEWING: "bg-purple-400",
    EXPIRING_SOON: "bg-orange-400",
    NOT_UPLOADED: "bg-gray-300 dark:bg-gray-600",
  }
  return map[status] || "bg-gray-300"
}

export function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    CRITICAL: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
    HIGH: "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400",
    MEDIUM: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    LOW: "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400",
  }
  return map[priority] || "text-gray-600 bg-gray-50"
}
