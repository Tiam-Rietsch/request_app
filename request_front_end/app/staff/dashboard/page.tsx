"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Eye } from "lucide-react"
import Link from "next/link"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function StaffDashboard() {
  const stats = [
    { label: "Total Requests", value: "45", color: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Pending", value: "8", color: "bg-yellow-50 dark:bg-yellow-950/20" },
    { label: "Completed", value: "37", color: "bg-green-50 dark:bg-green-950/20" },
  ]

  const statusData = [
    { name: "Sent", value: 3, fill: "#3B82F6" },
    { name: "Received", value: 2, fill: "#06B6D4" },
    { name: "Approved", value: 15, fill: "#10B981" },
    { name: "Rejected", value: 5, fill: "#EF4444" },
    { name: "In Cell", value: 8, fill: "#A855F7" },
    { name: "Done", value: 12, fill: "#6B7280" },
  ]

  const recentRequests = [
    {
      id: 1,
      student: "John Doe",
      level: "Level 300",
      subject: "Advanced Algorithms",
      type: "EXAM",
      status: "received",
      date: "Nov 20, 2024",
    },
    {
      id: 2,
      student: "Jane Smith",
      level: "Level 200",
      subject: "Database Systems",
      type: "CC",
      status: "sent",
      date: "Nov 19, 2024",
    },
    {
      id: 3,
      student: "Bob Johnson",
      level: "Level 400",
      subject: "Web Development",
      type: "EXAM",
      status: "approved",
      date: "Nov 18, 2024",
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
    <LayoutWrapper role="staff" userName="Prof. Smith" userRole="staff">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Prof. Smith</h1>
            <p className="text-muted-foreground">Review and manage assigned requests</p>
          </div>
          <Link href="/staff/requests">
            <Button className="gap-2">
              <Eye className="h-4 w-4" />
              View All
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Assigned Subjects */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Your Subjects</h2>
            <div className="space-y-3">
              {[
                { name: "Advanced Algorithms", requests: 12 },
                { name: "Data Structures", requests: 8 },
                { name: "Web Development", requests: 15 },
                { name: "Database Systems", requests: 10 },
              ].map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-sm bg-secondary px-3 py-1 rounded-full">{subject.requests} requests</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Student</th>
                  <th className="text-left py-3 px-4 font-semibold">Level</th>
                  <th className="text-left py-3 px-4 font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-right py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-4">{req.student}</td>
                    <td className="py-4 px-4 text-muted-foreground">{req.level}</td>
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
                    <td className="py-4 px-4 text-right">
                      <Link href={`/staff/requests/${req.id}`}>
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
