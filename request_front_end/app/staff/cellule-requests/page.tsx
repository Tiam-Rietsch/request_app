"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/tables/data-table"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight } from "lucide-react"

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    received: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    in_cellule: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    returned: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    done: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  }
  return colors[status] || colors.sent
}

export default function StaffCelluleRequestsPage() {
  useRequireAuth(['lecturer', 'hod'])
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.list({ status: 'in_cellule' })
      const results = response.results || response
      setRequests(Array.isArray(results) ? results : [])
    } catch (error) {
      toast.error("Failed to load requests.")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReturn = async (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await requestsAPI.returnFromCellule(requestId)
      toast.success("Requête marquée comme retournée")
      await fetchRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors du retour")
    }
  }

  const handleRowClick = (request: any) => {
    router.push(`/staff/cellule-requests/${request.id}`)
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "student_name",
      header: "Étudiant",
      cell: ({ row }) => row.original.student_name,
    },
    {
      accessorKey: "subject_display",
      header: "Matière",
      cell: ({ row }) => row.original.subject_display,
    },
    {
      accessorKey: "type_display",
      header: "Type",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded">
          {row.original.type_display}
        </span>
      ),
    },
    {
      accessorKey: "submitted_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.submitted_at).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action rapide",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleQuickReturn(row.original.id, e)}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Marquer retournée
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <LayoutWrapper role="staff" userName={user ? `${user.first_name} ${user.last_name}` : "Staff"} userRole="staff">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper role="staff" userName={user ? `${user.first_name} ${user.last_name}` : "Staff"} userRole="staff">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cellule Informatique</h1>
          <p className="text-muted-foreground">Requêtes en traitement dans la cellule informatique</p>
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

