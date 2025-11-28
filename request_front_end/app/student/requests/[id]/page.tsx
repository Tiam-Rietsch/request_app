"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { QrCode, ArrowLeft, Clock, User, BookOpen, Tag, Download } from "lucide-react"
import Link from "next/link"
import { generateRequestPDF } from "@/lib/pdf-export"

export default function StudentRequestDetailPage() {
  const request = {
    id: "REQ-2024-001",
    student: "John Doe",
    matricule: "MT001234",
    level: "Level 300",
    field: "Computer Science",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "in_cellule",
    date: "Nov 15, 2024",
    description:
      "I believe my exam answer for question 3 was incorrectly marked. The solution follows the algorithm specification and should receive full marks. Please review my submission carefully.",
  }

  const response = {
    id: "RESP-2024-001",
    decision: "approved",
    newScore: "20",
    oldScore: "12",
    reason:
      "The contestation is valid. The student's solution is correct and matches the specifications. The score has been updated from 12 to 20.",
    staffName: "Prof. Smith",
    decisionDate: "Nov 18, 2024",
  }

  const handlePrintRequest = () => {
    generateRequestPDF(request)
  }

  const timelineData = [
    { time: "Nov 20, 2:30 PM", action: "Sent to IT Cell", by: "Prof. Smith" },
    { time: "Nov 18, 10:15 AM", action: "Decision Made (Approved)", by: "Prof. Smith" },
    { time: "Nov 16, 3:45 PM", action: "Request Received", by: "Prof. Smith" },
    { time: "Nov 15, 9:00 AM", action: "Request Submitted", by: "You" },
  ]

  return (
    <LayoutWrapper role="student" userName="John Doe" userRole="student">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/student/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-3xl font-bold">Request Details</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handlePrintRequest}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <QrCode className="h-4 w-4" />
              Share
            </Button>
          </div>
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
                <p className="text-sm text-muted-foreground">Your Name</p>
                <p className="font-semibold">{request.student}</p>
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
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                  In IT Processing
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Reason</p>
              <p className="text-foreground p-4 bg-secondary rounded-lg">{request.description}</p>
            </div>
          </div>
        </Card>

        {/* RESPONSE BLOCK */}
        {response && (
          <Card className="p-6 mb-8 border-2 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold mb-6 text-green-900 dark:text-green-100">Response Block</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Decision</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    response.decision === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {response.decision.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Score Update</p>
                <p className="font-semibold">
                  {response.oldScore} → {response.newScore}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Staff Reason</p>
              <p className="text-foreground p-4 bg-secondary rounded-lg">{response.reason}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Reviewed by</p>
                <p className="font-semibold">{response.staffName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decision Date</p>
                <p className="font-semibold">{response.decisionDate}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground">
            I believe my exam answer for question 3 was incorrectly marked. The solution follows the algorithm
            specification and should receive full marks. Please review my submission carefully.
          </p>
        </Card>

        {/* Timeline */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Timeline</h2>
          <div className="space-y-4">
            {timelineData.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-20 flex-shrink-0">
                  <p className="text-sm font-medium text-muted-foreground">{item.time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">By: {item.by}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Result Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <p className="text-muted-foreground">
            This request is currently being processed by the IT Cell. The result will be displayed here once the
            processing is complete.
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
