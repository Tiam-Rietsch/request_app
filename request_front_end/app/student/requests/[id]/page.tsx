"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft, Clock, User, BookOpen, Tag, Download, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

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

const getProgressStep = (status: string) => {
  const steps: { [key: string]: number } = {
    sent: 0,
    received: 1,
    approved: 2,
    in_cellule: 3,
    returned: 4,
    done: 5,
  }
  return steps[status] || 0
}

export default function StudentRequestDetailPage() {
  useRequireAuth(['student'])
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const requestId = params?.id as string
  
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user && requestId) {
      fetchRequest()
    }
  }, [authLoading, user, requestId])

  const fetchRequest = async () => {
    try {
      const data = await requestsAPI.get(requestId)
      setRequest(data)
    } catch (error: any) {
      console.error("Failed to fetch request:", error)
      setError(error.message || "Erreur lors du chargement de la requête")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <LayoutWrapper role="student" userName="..." userRole="student">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (error || !request) {
    return (
      <LayoutWrapper role="student" userName={user ? `${user.first_name} ${user.last_name}` : "Étudiant"} userRole="student">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Link href="/student/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <Card className="p-6">
            <p className="text-red-500">{error || "Requête introuvable"}</p>
          </Card>
        </div>
      </LayoutWrapper>
    )
  }

  const currentStep = getProgressStep(request.status)

  return (
    <LayoutWrapper role="student" userName={user ? `${user.first_name} ${user.last_name}` : "Étudiant"} userRole="student">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/student/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-3xl font-bold">Détails de la Requête</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent"
              onClick={() => window.open(`${API_BASE_URL}/api/requests/${request.id}/print/`, '_blank')}
            >
              <Download className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Request Block (takes 2/3 width) */}
          <div className="lg:col-span-2">
            {/* REQUEST BLOCK */}
            <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Bloc Requête</h2>
                {/* Progress Map - Compact in top right */}
                <ProgressMap
                  steps={["Envoyée", "Reçue", "Approuvée", "En cellule", "Retournée", "Terminée"]}
                  currentStep={currentStep}
                  statuses={Object.fromEntries(
                    Array.from({ length: 6 }, (_, i) => [
                      i,
                      i < currentStep ? "completed" : i === currentStep ? "current" : "pending"
                    ])
                  )}
                />
              </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex gap-3">
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">ID Requête</p>
                <p className="font-medium font-mono text-xs">{request.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Étudiant</p>
                <p className="font-medium text-sm">{request.student_name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Matière</p>
                <p className="font-medium text-sm">{request.subject_display}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Soumise le</p>
                <p className="font-medium text-sm">
                  {format(new Date(request.submitted_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Type de requête</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {request.type_display}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Note actuelle</p>
                <p className="text-sm font-semibold">{request.current_score || "0"}/20</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Niveau & Filière</p>
              <p className="font-semibold">{request.class_level_display} - {request.field_display}</p>
            </div>

            {request.assigned_to_name && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Assignée à</p>
                <p className="font-semibold">{request.assigned_to_name}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Votre Description</p>
              <p className="text-foreground p-4 bg-secondary rounded-lg whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>
        </Card>
          </div>

          {/* Right Column - Historique (takes 1/3 width) */}
          <div className="lg:col-span-1">
            {/* Timeline - Compact */}
            {request.logs && request.logs.length > 0 && (
              <Card className="p-4 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Historique</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {request.logs.map((log: any, index: number) => (
                    <div key={log.id || index} className="pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(new Date(log.timestamp), 'dd MMM, HH:mm', { locale: fr })}
                      </div>
                      <p className="text-sm font-medium">{log.note || log.action}</p>
                      {log.actor_name && (
                        <p className="text-xs text-muted-foreground mt-1">Par: {log.actor_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* RESPONSE BLOCK */}
        {request.result && (
          <Card className="p-6 mb-8 border-2 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold mb-6 text-green-900 dark:text-green-100">Bloc Résultat</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Décision</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    request.result.status === "accepted"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {request.result.status_display}
                </span>
              </div>
              {request.result.new_score && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nouvelle Note</p>
                  <p className="font-semibold text-2xl">{request.result.new_score}</p>
                </div>
              )}
            </div>

            {request.result.reason && (
              <div className="border-t border-border pt-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Raison</p>
                <p className="text-foreground p-4 bg-secondary rounded-lg whitespace-pre-wrap">{request.result.reason}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {request.result.created_by_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Traité par</p>
                  <p className="font-semibold">{request.result.created_by_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Date de décision</p>
                <p className="font-semibold">
                  {format(new Date(request.result.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Pièces jointes</h2>
            <div className="space-y-3">
              {request.attachments.map((attachment: any) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{attachment.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {(attachment.size / 1024).toFixed(2)} KB - {format(new Date(attachment.uploaded_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`${API_BASE_URL}${attachment.file}`, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </LayoutWrapper>
  )
}
