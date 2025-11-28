"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CreateRequestPage() {
  const [formData, setFormData] = useState({
    classLevel: "",
    field: "",
    axis: "",
    subject: "",
    type: "CC",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <LayoutWrapper role="student" userName="John Doe" userRole="student">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Request</h1>
          <p className="text-muted-foreground">Submit a new grade contestation request</p>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Class Level</label>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select level</option>
                  <option value="100">Level 100</option>
                  <option value="200">Level 200</option>
                  <option value="300">Level 300</option>
                  <option value="400">Level 400</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Field</label>
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select field</option>
                  <option value="cs">Computer Science</option>
                  <option value="eng">Engineering</option>
                  <option value="bus">Business</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Axis (Optional)</label>
              <Input name="axis" placeholder="e.g., Theory, Practical" value={formData.axis} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select subject</option>
                <option value="algo">Advanced Algorithms</option>
                <option value="db">Database Systems</option>
                <option value="web">Web Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Request Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" value="CC" checked={formData.type === "CC"} onChange={handleChange} />
                  <span>CC (Continuous Control)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="EXAM"
                    checked={formData.type === "EXAM"}
                    onChange={handleChange}
                  />
                  <span>EXAM</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                placeholder="Describe your grade contestation reason..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "/student/requests/1"
                }}
              >
                Submit Request
              </Button>
              <Link href="/student/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
