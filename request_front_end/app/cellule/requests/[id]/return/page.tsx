"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ReturnFormPage() {
  const [note, setNote] = useState("")

  return (
    <LayoutWrapper role="cellule" userName="IT Cell Admin" userRole="cellule">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/cellule/requests/1" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Return to Staff</h1>
          <p className="text-muted-foreground">Complete REQ-2024-001 processing and return to staff</p>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            {/* Request Summary */}
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Returning for Completion:</p>
              <p className="font-semibold">REQ-2024-001 - John Doe - Advanced Algorithms (EXAM)</p>
            </div>

            {/* Note Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Processing Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any notes about your processing or updates..."
                rows={5}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900/30">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                After returning, the assigned staff member will complete the request by entering the final score and
                marking it as done.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "/cellule/requests/1"
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return Request
              </Button>
              <Link href="/cellule/requests/1">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
