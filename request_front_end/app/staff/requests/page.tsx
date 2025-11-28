"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/tables/data-table"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

interface Request {
  id: number
  student: string
  level: string
  subject: string
  type: string
  status: string
  date: string
}

const allRequests: Request[] = [
  {
    id: 1,
    student: "John Doe",
    level: "Level 300",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "sent",
    date: "Nov 20, 2024",
  },
  {
    id: 2,
    student: "Jane Smith",
    level: "Level 200",
    subject: "Database Systems",
    type: "CC",
    status: "received",
    date: "Nov 19, 2024",
  },
  {
    id: 3,
    student: "Bob Johnson",
    level: "Level 400",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "approved",
    date: "Nov 18, 2024",
  },
  {
    id: 4,
    student: "Alice Brown",
    level: "Level 300",
    subject: "Web Development",
    type: "EXAM",
    status: "in_cellule",
    date: "Nov 17, 2024",
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

export default function StaffRequestsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [searchFilter, setSearchFilter] = useState("")

  const handleRowClick = (request: Request) => {
    router.push(`/staff/requests/${request.id}`)
  }

  const filteredRequests = allRequests.filter((req) => {
    const matchStatus = !statusFilter || req.status === statusFilter
    const matchType = !typeFilter || req.type === typeFilter
    const matchSubject = !subjectFilter || req.subject === subjectFilter
    const matchSearch = !searchFilter || req.student.toLowerCase().includes(searchFilter.toLowerCase())
    return matchStatus && matchType && matchSubject && matchSearch
  })

  const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "student",
      header: "Student",
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("level")}</span>,
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded">
          {row.getValue("type")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(status)}`}>
            {status.replace("_", " ").toUpperCase()}
          </span>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("date")}</span>,
    },
  ]

  return (
    <LayoutWrapper role="staff" userName="Prof. Smith" userRole="staff">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assigned Requests</h1>
          <p className="text-muted-foreground">Review and process student grade contestations</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">All Types</option>
                <option value="CC">CC</option>
                <option value="EXAM">EXAM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">All Subjects</option>
                <option value="Advanced Algorithms">Advanced Algorithms</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Web Development">Web Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search students..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-6">
          <DataTable
            columns={columns}
            data={filteredRequests}
            enablePagination={true}
            enableSorting={true}
            onRowClick={handleRowClick}
          />
        </Card>
      </div>
    </LayoutWrapper>
  )
}
