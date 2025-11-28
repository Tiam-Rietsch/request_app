"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DecisionFormPage() {
  const [decision, setDecision] = useState("approved")
  const [reason, setReason] = useState("")

  return (
    <LayoutWrapper role="staff" userName="Prof. Smith" userRole="staff">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/staff/requests/1" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Make Decision</h1>
          <p className="text-muted-foreground">Review REQ-2024-001 from John Doe</p>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            {/* Decision Selection */}
            <div>
              <label className="block text-sm font-semibold mb-4">Decision</label>
              <div className="space-y-3">
                <label
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer"
                  style={{
                    borderColor: decision === "approved" ? "#10B981" : "#E5E7EB",
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={decision === "approved"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-green-700">Approve Request</p>
                    <p className="text-sm text-muted-foreground">
                      The student's contesta is valid and should be processed
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer"
                  style={{
                    borderColor: decision === "rejected" ? "#EF4444" : "#E5E7EB",
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={decision === "rejected"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-red-700">Reject Request</p>
                    <p className="text-sm text-muted-foreground">The student's contestation is not valid</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason (required for rejection) */}
            {decision === "rejected" && (
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Rejection *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are rejecting this request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>
            )}

            {/* Additional Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Comment (Optional)</label>
              <textarea
                placeholder="Add any additional notes or remarks..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "/staff/requests/1"
                }}
                className={decision === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {decision === "approved" ? "Approve & Send to IT" : "Reject & Close"}
              </Button>
              <Link href="/staff/requests/1">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
