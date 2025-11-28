"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
  role?: "public" | "student" | "staff" | "cellule"
  userName?: string
  userRole?: "student" | "staff" | "cellule"
  hideNav?: boolean
}

export function LayoutWrapper({ children, role = "public", userName, userRole, hideNav = false }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNav && (
        <Navbar userName={userName} userRole={userRole} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Static sidebar - does not scroll */}
        {role !== "public" && <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {/* Main content area - scrolls only */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
