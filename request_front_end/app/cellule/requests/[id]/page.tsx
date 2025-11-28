"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft, Clock, User, BookOpen, Tag, Send, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ITCellRequestDetailPage() {
  const [isUpdated, setIsUpdated] = useState(false)
  const status = "in_cellule"

  const request = {
    id: "REQ-2024-001",
    student: "John Doe",
    matricule: "MT001234",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "in_cellule",
    approvedDate: "Nov 18, 2024",
  }

  const response = {
    newScore: "20",
    oldScore: "12",
    reason: "The contestation is valid. The student's solution is correct and matches the specifications.",
    staffName: "Prof. Smith",
  }

  return (
    <LayoutWrapper role="cellule" userName="IT Cell Admin" userRole="cellule">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cellule/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
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
            currentStep={3}
            statuses={{
              0: "completed",
              1: "completed",
              2: "completed",
              3: "current",
              4: "pending",
              5: "pending",
            }}
          />
        </Card>

        {/* Request Information */}
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
                <p className="text-sm text-muted-foreground">Approved Date</p>
                <p className="font-semibold">{request.approvedDate}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Request Type</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {request.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                  {request.status}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Response Information */}
        <Card className="p-6 mb-8 border-2 border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold mb-6 text-green-900 dark:text-green-100">
            Response Block (Staff Decision)
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Score Update</p>
              <p className="font-semibold text-lg">
                {response.oldScore} → {response.newScore}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Reviewed by</p>
              <p className="font-semibold">{response.staffName}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Staff Reason</p>
            <p className="text-foreground p-4 bg-secondary rounded-lg">{response.reason}</p>
          </div>
        </Card>

        {/* Action Buttons */}
        {status === "in_cellule" && !isUpdated && (
          <div className="mb-8">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsUpdated(true)}>
              <Send className="h-4 w-4" />
              Mark as Updated
            </Button>
          </div>
        )}

        {isUpdated && (
          <Card className="p-6 mb-8 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-green-800 dark:text-green-300">Request marked as updated successfully.</p>
            </div>
          </Card>
        )}

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Request Details</h2>
          <p className="text-muted-foreground mb-4">
            <strong>Student's Reason:</strong> I believe my exam answer for question 3 was incorrectly marked. The
            solution follows the algorithm specification and should receive full marks.
          </p>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Timeline</h2>
          <div className="space-y-4">
            {[
              { time: "Nov 20, 2:30 PM", action: "Sent to IT Cell", by: "Prof. Smith" },
              { time: "Nov 18, 10:15 AM", action: "Decision Made (Approved)", by: "Prof. Smith" },
              { time: "Nov 16, 3:45 PM", action: "Request Received", by: "Prof. Smith" },
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
