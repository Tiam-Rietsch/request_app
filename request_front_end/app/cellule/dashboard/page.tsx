"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Eye } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { format, startOfMonth, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

export default function ITCellDashboard() {
  useRequireAuth(['cellule', 'lecturer', 'hod']) // Allow lecturers with cellule_informatique flag
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
      label: "En traitement", 
      value: requests.filter(r => r.status === 'in_cellule').length.toString(), 
      color: "bg-purple-50 dark:bg-purple-950/20" 
    },
    { 
      label: "Retournées", 
      value: requests.filter(r => r.status === 'returned').length.toString(), 
      color: "bg-yellow-50 dark:bg-yellow-950/20" 
    },
    { 
      label: "Total traitées", 
      value: requests.filter(r => ['returned', 'done'].includes(r.status)).length.toString(), 
      color: "bg-green-50 dark:bg-green-950/20" 
    },
  ]

  // Calculate monthly trend data (last 3 months)
  const getMonthlyData = () => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthStart = startOfMonth(monthDate)
      const monthName = format(monthStart, 'MMM', { locale: fr })
      
      const monthRequests = requests.filter(req => {
        const reqDate = new Date(req.submitted_at)
        return reqDate.getMonth() === monthStart.getMonth() && reqDate.getFullYear() === monthStart.getFullYear()
      })
      
      months.push({
        month: monthName,
        received: monthRequests.filter(r => r.status === 'in_cellule').length,
        returned: monthRequests.filter(r => r.status === 'returned').length,
        completed: monthRequests.filter(r => r.status === 'done').length,
      })
    }
    return months
  }

  const chartData = getMonthlyData()

  const recentRequests = requests
    .filter(r => r.status === 'in_cellule')
    .slice(0, 10)

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
      <LayoutWrapper role="cellule" userName="..." userRole="cellule">
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
      role="cellule" 
      userName={user ? `${user.first_name} ${user.last_name}` : "Cellule IT"} 
      userRole="cellule"
    >
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, Cellule Informatique
            </h1>
            <p className="text-muted-foreground">Traiter et gérer les résultats de contestation</p>
          </div>
          <Link href="/cellule/requests">
            <Button className="gap-2">
              <Eye className="h-4 w-4" />
              Voir tout
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
            <h2 className="text-xl font-semibold mb-6">Tendance de traitement</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#3B82F6" name="Reçues" />
                <Bar dataKey="returned" fill="#FBBF24" name="Retournées" />
                <Bar dataKey="completed" fill="#10B981" name="Terminées" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Requêtes à traiter</h2>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune requête en cellule pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Étudiant</th>
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
                      <td className="py-4 px-4">{req.student_name || 'N/A'}</td>
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
                        <Link href={`/cellule/requests/${req.id}`}>
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
