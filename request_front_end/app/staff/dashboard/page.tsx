"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { Eye } from "lucide-react"
import Link from "next/link"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function StaffDashboard() {
  useRequireAuth(['lecturer', 'hod'])
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
      label: "En attente", 
      value: requests.filter(r => ['sent', 'received'].includes(r.status)).length.toString(), 
      color: "bg-yellow-50 dark:bg-yellow-950/20" 
    },
    { 
      label: "Terminées", 
      value: requests.filter(r => r.status === 'done').length.toString(), 
      color: "bg-green-50 dark:bg-green-950/20" 
    },
  ]

  // Calculate status distribution
  const statusCounts = requests.reduce((acc: any, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1
    return acc
  }, {})

  const statusData = [
    { name: "Envoyée", value: statusCounts.sent || 0, fill: "#3B82F6" },
    { name: "Reçue", value: statusCounts.received || 0, fill: "#06B6D4" },
    { name: "Approuvée", value: statusCounts.approved || 0, fill: "#10B981" },
    { name: "En cellule", value: statusCounts.in_cellule || 0, fill: "#A855F7" },
    { name: "Retournée", value: statusCounts.returned || 0, fill: "#F59E0B" },
    { name: "Terminée", value: statusCounts.done || 0, fill: "#6B7280" },
  ].filter(item => item.value > 0)

  // Calculate subject distribution
  const subjectCounts = requests.reduce((acc: any, req) => {
    const subjectName = req.subject?.name || 'N/A'
    acc[subjectName] = (acc[subjectName] || 0) + 1
    return acc
  }, {})

  const topSubjects = Object.entries(subjectCounts)
    .map(([name, count]) => ({ name, requests: count as number }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5)

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
      <LayoutWrapper role="staff" userName="..." userRole="staff">
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
      role="staff" 
      userName={user ? `${user.first_name} ${user.last_name}` : "Enseignant"} 
      userRole="staff"
    >
      <div className="p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.first_name || 'Enseignant'}
            </h1>
            <p className="text-muted-foreground">Examinez et gérez les requêtes assignées</p>
          </div>
          <Link href="/staff/requests">
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Distribution des statuts</h2>
            {statusData.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </Card>

          {/* Top Subjects */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Matières principales</h2>
            {topSubjects.length > 0 ? (
              <div className="space-y-3">
                {topSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm bg-secondary px-3 py-1 rounded-full">
                      {subject.requests} requête{subject.requests > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune matière disponible
              </div>
            )}
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Requêtes Récentes</h2>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune requête assignée pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Étudiant</th>
                    <th className="text-left py-3 px-4 font-semibold">Niveau</th>
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
                      <td className="py-4 px-4 text-muted-foreground">{req.class_level?.name || 'N/A'}</td>
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
                        <Link href={`/staff/requests/${req.id}`}>
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
