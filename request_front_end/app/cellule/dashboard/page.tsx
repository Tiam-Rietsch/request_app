"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Eye } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function ITCellDashboard() {
  const stats = [
    { label: "Processing", value: "8", color: "bg-purple-50 dark:bg-purple-950/20" },
    { label: "Returned", value: "5", color: "bg-yellow-50 dark:bg-yellow-950/20" },
    { label: "Completed", value: "34", color: "bg-green-50 dark:bg-green-950/20" },
  ]

  const chartData = [
    { month: "Sep", received: 12, returned: 10, completed: 8 },
    { month: "Oct", received: 18, returned: 14, completed: 12 },
    { month: "Nov", received: 15, returned: 12, completed: 16 },
  ]

  const recentRequests = [
    {
      id: 1,
      student: "John Doe",
      subject: "Advanced Algorithms",
      type: "EXAM",
      status: "in_cellule",
      assignedBy: "Prof. Smith",
      date: "Nov 20, 2024",
    },
    {
      id: 2,
      student: "Bob Johnson",
      subject: "Web Development",
      type: "EXAM",
      status: "in_cellule",
      assignedBy: "Prof. Williams",
      date: "Nov 19, 2024",
    },
    {
      id: 3,
      student: "Alice Brown",
      subject: "Database Systems",
      type: "CC",
      status: "returned",
      assignedBy: "Prof. Johnson",
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
    <LayoutWrapper role="cellule" userName="IT Cell Admin" userRole="cellule">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, IT Cell</h1>
            <p className="text-muted-foreground">Process and manage grade contestation outcomes</p>
          </div>
          <Link href="/cellule/requests">
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

        <div className="grid lg:grid-cols-1 gap-6 mb-8">
          {/* Monthly Processing Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Processing Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#3B82F6" name="Received" />
                <Bar dataKey="returned" fill="#FBBF24" name="Returned" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Requests to Process</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Student</th>
                  <th className="text-left py-3 px-4 font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned By</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-right py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-4">{req.student}</td>
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
                    <td className="py-4 px-4 text-muted-foreground">{req.assignedBy}</td>
                    <td className="py-4 px-4 text-muted-foreground">{req.date}</td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/cellule/requests/${req.id}`}>
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
