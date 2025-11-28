"use client"

import Link from "next/link"
import { Menu, LogOut, Bell, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface NavbarProps {
  userName?: string
  userRole?: "student" | "staff" | "cellule"
  onToggleSidebar?: () => void
}

export function Navbar({ userName = "User", userRole = "student", onToggleSidebar }: NavbarProps) {
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  
  // Check if user is member of cellule informatique
  const isCelluleMember = user?.lecturer_profile?.cellule_informatique === true

  const handleLogout = async () => {
    await logout()
  }

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "staff":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "cellule":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case "student":
        return "Student"
      case "staff":
        return "Staff"
      case "cellule":
        return "IT Cell"
      default:
        return "User"
    }
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsOpen(!isOpen)
              onToggleSidebar?.()
            }}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              GC
            </div>
            <span className="hidden sm:inline">Grade Contestation</span>
          </Link>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user ? `${user.first_name} ${user.last_name}`.trim() || user.username : userName}
              </p>
              <div className="flex items-center gap-2 justify-end">
                <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
                {isCelluleMember && (
                  <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Cellule Informatique
                  </span>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
