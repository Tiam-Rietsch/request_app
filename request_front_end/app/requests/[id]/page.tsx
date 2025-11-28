"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Printer, QrCode, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PublicRequestViewPage() {
  return (
    <LayoutWrapper hideNav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Request Details</h1>
            <p className="text-muted-foreground mt-2">Public view - QR code accessible</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <QrCode className="h-4 w-4" />
              QR Code
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

        {/* Request Information */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Request Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Request ID</p>
              <p className="font-semibold">REQ-2024-001</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student</p>
              <p className="font-semibold">John Doe</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matricule</p>
              <p className="font-semibold">MT001234</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold">Advanced Algorithms</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                EXAM
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                In Processing
              </span>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground">
            I believe my exam answer for question 3 was incorrectly marked. The solution follows the algorithm
            specification and should receive full marks. Please review my submission.
          </p>
        </Card>

        {/* Result (if available) */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result Status</h2>
          <p className="text-muted-foreground mb-4">
            This request is currently being processed. Results will be displayed here once the review is complete.
          </p>
        </Card>

        {/* Login CTA */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Want to manage your requests?</h3>
          <p className="text-muted-foreground mb-4">
            Log in to your account to track all your requests and receive notifications.
          </p>
          <Link href="/login">
            <Button>Login to Your Account</Button>
          </Link>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
