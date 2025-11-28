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
  subject: string
  type: string
  status: string
  responsible: string
  date: string
}

const allRequests: Request[] = [
  {
    id: 1,
    student: "John Doe",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "in_cellule",
    responsible: "Admin 1",
    date: "Nov 20, 2024",
  },
  {
    id: 2,
    student: "Bob Johnson",
    subject: "Web Development",
    type: "EXAM",
    status: "in_cellule",
    responsible: "Admin 2",
    date: "Nov 19, 2024",
  },
  {
    id: 3,
    student: "Alice Brown",
    subject: "Database Systems",
    type: "CC",
    status: "returned",
    responsible: "Admin 1",
    date: "Nov 18, 2024",
  },
  {
    id: 4,
    student: "Charlie Wilson",
    subject: "Advanced Algorithms",
    type: "EXAM",
    status: "in_cellule",
    responsible: "Admin 2",
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

export default function ITCellRequestsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [searchFilter, setSearchFilter] = useState("")

  const handleRowClick = (request: Request) => {
    router.push(`/cellule/requests/${request.id}`)
  }

  const filteredRequests = allRequests.filter((req) => {
    const matchStatus = !statusFilter || req.status === statusFilter
    const matchType = !typeFilter || req.type === typeFilter
    const matchSearch = !searchFilter || req.student.toLowerCase().includes(searchFilter.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "student",
      header: "Student",
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
      accessorKey: "responsible",
      header: "Responsible",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("responsible")}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("date")}</span>,
    },
  ]

  return (
    <LayoutWrapper role="cellule" userName="IT Cell Admin" userRole="cellule">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Requests in IT Cell</h1>
          <p className="text-muted-foreground">Process approved grade contestation requests</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="in_cellule">In Processing</option>
                <option value="returned">Returned</option>
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
