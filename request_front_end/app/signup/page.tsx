"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useState } from "react"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    classLevel: "",
    field: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <LayoutWrapper hideNav>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              GC
            </div>
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Student registration only</p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matricule</label>
              <Input
                type="text"
                name="matricule"
                placeholder="e.g., MT001234"
                value={formData.matricule}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Level</label>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                >
                  <option value="">Select level</option>
                  <option value="100">Level 100</option>
                  <option value="200">Level 200</option>
                  <option value="300">Level 300</option>
                  <option value="400">Level 400</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Field</label>
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                >
                  <option value="">Select field</option>
                  <option value="cs">Computer Science</option>
                  <option value="eng">Engineering</option>
                  <option value="bus">Business</option>
                  <option value="sci">Science</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = "/login"
              }}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
