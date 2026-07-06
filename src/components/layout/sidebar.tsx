"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calculator,
  Languages,
  CalendarDays,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/crs", label: "Profile Score", icon: Calculator },
  { href: "/app/language", label: "Language Tests", icon: Languages },
  { href: "/app/timeline", label: "Timeline", icon: CalendarDays },
  { href: "/app/applicants", label: "Applicants", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-lg">
          {!collapsed && <span className="text-blue-600">Pathway</span>}
          {collapsed && <span className="text-blue-600 text-xl">P</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">User</p>
              <p className="text-gray-500 dark:text-gray-400">Canada PR</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
