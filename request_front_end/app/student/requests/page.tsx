"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

interface Request {
  id: number
  subject: string
  type: string
  status: string
  date: string
  assignedTo: string
}

const requests: Request[] = [
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
  {
    id: 4,
    subject: "Data Structures",
    type: "CC",
    status: "sent",
    date: "Nov 1, 2024",
    assignedTo: "Prof. Brown",
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

export default function StudentRequestsPage() {
  const router = useRouter()

  const handleRowClick = (request: Request) => {
    router.push(`/student/requests/${request.id}`)
  }

  const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => row.getValue("subject"),
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
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
    },
  ]

  return (
    <LayoutWrapper role="student" userName="John Doe" userRole="student">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Requests</h1>
            <p className="text-muted-foreground">View and manage all your grade contestations</p>
          </div>
          <Link href="/student/create-request">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card className="p-6">
          <DataTable
            columns={columns}
            data={requests}
            enablePagination={true}
            enableSorting={true}
            onRowClick={handleRowClick}
          />
        </Card>
      </div>
    </LayoutWrapper>
  )
}
