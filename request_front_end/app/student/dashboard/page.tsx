"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function StudentDashboard() {
  useRequireAuth(['student'])
  const { user, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
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

  const stats = [
    { 
      label: "Total Requêtes", 
      value: requests.length.toString(), 
      color: "bg-blue-50 dark:bg-blue-950/20" 
    },
    { 
      label: "En cours", 
      value: requests.filter(r => !['done'].includes(r.status)).length.toString(), 
      color: "bg-yellow-50 dark:bg-yellow-950/20" 
    },
    { 
      label: "Terminées", 
      value: requests.filter(r => r.status === 'done').length.toString(), 
      color: "bg-green-50 dark:bg-green-950/20" 
    },
  ]

  const recentRequests = requests.slice(0, 5)

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
    <LayoutWrapper 
      role="student" 
      userName={user ? `${user.first_name} ${user.last_name}` : "Étudiant"} 
      userRole="student"
    >
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.first_name || 'Étudiant'}
            </h1>
            <p className="text-muted-foreground">Suivez et gérez vos contestations de notes</p>
          </div>
          <Link href="/student/create-request">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Requête
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
            <h2 className="text-xl font-semibold">Requêtes Récentes</h2>
            <Link href="/student/requests">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                Voir tout
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune requête pour le moment</p>
              <Link href="/student/create-request">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Créer votre première requête
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Matière</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="py-4 px-4">{req.subject?.name || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded">
                          {req.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {format(new Date(req.submitted_at), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/student/requests/${req.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </LayoutWrapper>
  )
}
