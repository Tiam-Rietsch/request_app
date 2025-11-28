"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Plus, FileText, LogOut, X, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role?: "public" | "student" | "staff" | "cellule"
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ role = "public", isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const getMenuItems = () => {
    switch (role) {
      case "student":
        return [
          { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/student/create-request", label: "New Request", icon: Plus },
          { href: "/student/requests", label: "My Requests", icon: FileText },
        ]
      case "staff":
        return [
          { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/staff/requests", label: "Assigned Requests", icon: FileText },
        ]
      case "cellule":
        return [
          { href: "/cellule/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/cellule/requests", label: "Requests in Cell", icon: FileText },
        ]
      default:
        return [{ href: "/", label: "Home", icon: Home }]
    }
  }

  const menuItems = getMenuItems()

  if (role === "public") {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-border bg-sidebar transition-transform lg:static lg:z-0 lg:translate-x-0",
          isOpen ? "translate-x-0 z-40" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-4 gap-4">
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden absolute right-4 top-4" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>

          {/* Menu Items */}
          <nav className="space-y-2 mt-8 lg:mt-0">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <button className="flex items-center gap-3 px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors w-full">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
