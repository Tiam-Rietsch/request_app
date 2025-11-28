"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useState } from "react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <LayoutWrapper hideNav>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              GC
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Test Accounts Info */}
          <div className="bg-secondary p-4 rounded-lg mb-6 text-sm">
            <p className="font-semibold mb-2">Test Accounts:</p>
            <div className="space-y-1 text-muted-foreground">
              <p>👨‍🎓 Student: student@example.com / password</p>
              <p>👨‍🏫 Staff: staff@example.com / password</p>
              <p>💻 IT Cell: itcell@example.com / password</p>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                type="text"
                placeholder="Enter your username or matricule"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                // Route based on test account
                if (username.includes("student")) {
                  window.location.href = "/student/dashboard"
                } else if (username.includes("staff")) {
                  window.location.href = "/staff/dashboard"
                } else if (username.includes("cellule") || username.includes("it")) {
                  window.location.href = "/cellule/dashboard"
                }
              }}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue as</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Link href="/student/dashboard">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                👨‍🎓
              </Button>
            </Link>
            <Link href="/staff/dashboard">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                👨‍🏫
              </Button>
            </Link>
            <Link href="/cellule/dashboard">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                💻
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
