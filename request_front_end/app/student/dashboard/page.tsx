"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Plus, Eye } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const stats = [
    { label: "Total Requests", value: "12", color: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Pending", value: "3", color: "bg-yellow-50 dark:bg-yellow-950/20" },
    { label: "Completed", value: "9", color: "bg-green-50 dark:bg-green-950/20" },
  ]

  const recentRequests = [
    {
      id: 1,
      subject: "Advanced Algorithms",
      type: "EXAM",
      status: "in_cellule",
      date: "Nov 15, 2024",
      assignedTo: "Prof. Smith",
    },
    {
      id: 2,
      subject: "Database Systems",
      type: "CC",
      status: "approved",
      date: "Nov 10, 2024",
      assignedTo: "Prof. Johnson",
    },
    {
      id: 3,
      subject: "Web Development",
      type: "EXAM",
      status: "done",
      date: "Nov 5, 2024",
      assignedTo: "Prof. Williams",
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      sent: "status-sent",
      received: "status-received",
      approved: "status-approved",
      rejected: "status-rejected",
      in_cellule: "status-in_cellule",
      returned: "status-returned",
      done: "status-done",
    }
    return colors[status] || "status-sent"
  }

  return (
    <LayoutWrapper role="student" userName="John Doe" userRole="student">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, John</h1>
            <p className="text-muted-foreground">Track and manage your grade contestations</p>
          </div>
          <Link href="/student/create-request">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`p-6 ${stat.color}`}>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Recent Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Requests</h2>
            <Link href="/student/requests">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned To</th>
                  <th className="text-right py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-4">{req.subject}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(req.status)}`}>
                        {req.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{req.date}</td>
                    <td className="py-4 px-4">{req.assignedTo}</td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/student/requests/${req.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
