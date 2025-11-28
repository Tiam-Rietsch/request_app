"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Request {
  id: string
  subject: {
    name: string
  }
  type: string
  status: string
  submitted_at: string
  assigned_to_name: string | null
}

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

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    sent: "Envoyée",
    received: "Reçue",
    approved: "Approuvée",
    rejected: "Rejetée",
    in_cellule: "En cellule",
    returned: "Retournée",
    done: "Terminée",
  }
  return labels[status] || status
}

export default function StudentRequestsPage() {
  useRequireAuth(['student'])
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchRequests()
    }
  }, [authLoading, user])

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.list()
      const results = response.results || response
      setRequests(Array.isArray(results) ? results : [])
    } catch (error) {
      console.error("Failed to fetch requests:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (request: Request) => {
    router.push(`/student/requests/${request.id}`)
  }

  const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "subject",
      header: "Matière",
      cell: ({ row }) => row.original.subject?.name || 'N/A',
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded">
          {row.getValue("type")?.toString().toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        )
      },
    },
    {
      accessorKey: "submitted_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.getValue("submitted_at")), 'dd MMM yyyy', { locale: fr })}
        </span>
      ),
    },
    {
      accessorKey: "assigned_to_name",
      header: "Assignée à",
      cell: ({ row }) => row.getValue("assigned_to_name") || 'Non assignée',
    },
  ]

  if (authLoading || loading) {
    return (
      <LayoutWrapper role="student" userName="..." userRole="student">
        <div className="p-4 sm:p-6 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper role="student" userName={user ? `${user.first_name} ${user.last_name}` : "Étudiant"} userRole="student">
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Requêtes</h1>
            <p className="text-muted-foreground">Voir et gérer toutes vos contestations de notes</p>
          </div>
          <Link href="/student/create-request">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Requête
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Vous n'avez aucune requête pour le moment</p>
              <Link href="/student/create-request">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre première requête
                </Button>
              </Link>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={requests}
              enablePagination={true}
              enableSorting={true}
              onRowClick={handleRowClick}
            />
          )}
        </Card>
      </div>
    </LayoutWrapper>
  )
}
