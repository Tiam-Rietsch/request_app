"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft, Clock, User, BookOpen, Tag, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function StaffRequestDetailPage() {
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)
  const [newScore, setNewScore] = useState<number | null>(null)
  const [reason, setReason] = useState<string>("")

  const request = {
    id: "REQ-2024-001",
    student: "John Doe",
    matricule: "MT001234",
    level: "Level 300",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "received",
    date: "Nov 15, 2024",
    description:
      "I believe my exam answer for question 3 was incorrectly marked. The solution follows the algorithm specification and should receive full marks. Please review my submission carefully.",
  }

  const handleSubmitResponse = () => {
    // Handle form submission logic here
    console.log("Decision:", decision)
    console.log("New Score:", newScore)
    console.log("Reason:", reason)
    setShowDecisionForm(false)
  }

  return (
    <LayoutWrapper role="staff" userName="Prof. Smith" userRole="staff">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/staff/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-3xl font-bold">Request Details</h1>
        </div>

        {/* Progress Map */}
        <Card className="p-6 mb-8">
          <h2 className="font-semibold mb-6">Request Progress</h2>
          <ProgressMap
            steps={["Sent", "Received", "Decision", "IT Processing", "Returned", "Done"]}
            currentStep={1}
            statuses={{
              0: "completed",
              1: "current",
              2: "pending",
              3: "pending",
              4: "pending",
              5: "pending",
            }}
          />
        </Card>

        {/* REQUEST BLOCK */}
        <Card className="p-6 mb-8 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">Request Block</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex gap-3">
              <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Request ID</p>
                <p className="font-semibold">{request.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-semibold">
                  {request.student} ({request.matricule})
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-semibold">{request.subject}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-semibold">{request.date}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Request Type</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {request.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 rounded-full text-sm font-medium">
                  {request.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Student's Reason</p>
              <p className="text-foreground p-4 bg-secondary rounded-lg">{request.description}</p>
            </div>
          </div>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => {
              setDecision("approve")
              setShowDecisionForm(true)
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Request
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent"
            onClick={() => {
              setDecision("reject")
              setShowDecisionForm(true)
            }}
          >
            <XCircle className="h-4 w-4" />
            Reject Request
          </Button>
        </div>

        {/* DECISION FORM */}
        {showDecisionForm && (
          <Card className="p-6 mb-8 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <h2 className="text-xl font-semibold mb-6">Response Form</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Score (0-20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  placeholder="Enter new score"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Decision {decision === "reject" && "(Required)"}
                </label>
                <textarea
                  placeholder="Explain your decision..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitResponse}>
                  Submit Response
                </Button>
                <Button variant="outline" onClick={() => setShowDecisionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Student Description</h2>
          <p className="text-muted-foreground">
            I believe my exam answer for question 3 was incorrectly marked. The solution follows the algorithm
            specification and should receive full marks. Please review my submission carefully.
          </p>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Timeline</h2>
          <div className="space-y-4">
            {[
              { time: "Nov 16, 3:45 PM", action: "Request Received", by: "You" },
              { time: "Nov 15, 9:00 AM", action: "Request Submitted", by: "John Doe" },
            ].map((log, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-20 flex-shrink-0">
                  <p className="text-sm font-medium text-muted-foreground">{log.time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">By: {log.by}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
