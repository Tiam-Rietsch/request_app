"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Plus, FileText, LogOut, X, Home, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps {
  role?: "public" | "student" | "staff" | "cellule"
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ role = "public", isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const hasCelluleAccess = () => {
    // Check cellule_informatique flag - this takes priority over role
    if (!user) return false
    return user.lecturer_profile?.cellule_informatique === true
  }

  const getMenuItems = () => {
    // Check cellule_informatique FIRST (above staff)
    const isCelluleMember = hasCelluleAccess()
    
    if (isCelluleMember) {
      // If user is cellule member, show cellule menu items
      return [
        { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/staff/requests", label: "Assigned Requests", icon: FileText },
        { href: "/staff/cellule-requests", label: "Cellule Informatique", icon: Server },
      ]
    }
    
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
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-border bg-sidebar transition-transform overflow-y-auto",
          isOpen ? "translate-x-0 z-40" : "-translate-x-full lg:translate-x-0",
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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
