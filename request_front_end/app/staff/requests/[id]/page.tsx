"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressMap } from "@/components/shared/progress-map"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft, Clock, User, BookOpen, Tag, FileText, Download, CheckCircle2, XCircle, Printer } from "lucide-react"
import Link from "next/link"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { requestsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

export default function StaffRequestDetailPage() {
  useRequireAuth(['lecturer', 'hod'])
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const requestId = params?.id as string
  
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [approveReason, setApproveReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

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

  const handleApprove = async () => {
    if (!approveReason.trim()) {
      toast.error("Veuillez fournir une raison pour l'approbation")
      return
    }

    setSubmitting(true)
    try {
      // First approve the request
      await requestsAPI.decision(requestId, 'approved', approveReason)
      
      // Then send to IT cell
      await requestsAPI.sendToCellule(requestId)
      
      toast.success("Requête approuvée et envoyée à la cellule informatique")
      setShowApproveModal(false)
      setApproveReason("")
      await fetchRequest()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'approbation")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("La raison du rejet est obligatoire")
      return
    }

    setSubmitting(true)
    try {
      // Reject goes directly to done
      await requestsAPI.decision(requestId, 'rejected', rejectReason)
      
      toast.success("Requête rejetée")
      setShowRejectModal(false)
      setRejectReason("")
      await fetchRequest()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors du rejet")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.open(`${API_BASE_URL}/api/requests/${requestId}/print/`, '_blank')
  }

  const getProgressMapData = (currentStatus: string) => {
    const statusOrder = ["sent", "received", "approved", "in_cellule", "returned", "done"]
    const steps = [
      "Envoyée",
      "Reçue",
      "Approuvée",
      "En cellule",
      "Retournée",
      "Terminée",
    ]
    const currentStepIndex = statusOrder.indexOf(currentStatus)

    const statuses: { [key: number]: "completed" | "current" | "pending" } = {}
    for (let i = 0; i < steps.length; i++) {
      if (i < currentStepIndex) {
        statuses[i] = "completed"
      } else if (i === currentStepIndex) {
        statuses[i] = "current"
      } else {
        statuses[i] = "pending"
      }
    }
    return { steps, currentStep: currentStepIndex, statuses }
  }

  if (authLoading || loading) {
    return (
      <LayoutWrapper role="staff" userName="..." userRole="staff">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (error || !request) {
    return (
      <LayoutWrapper role="staff" userName={user ? `${user.first_name} ${user.last_name}` : "Staff"} userRole="staff">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto">
          <Link href="/staff/requests" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <Card className="p-6">
            <p className="text-destructive">{error || "Requête introuvable"}</p>
          </Card>
        </div>
      </LayoutWrapper>
    )
  }

  const progressMapProps = getProgressMapData(request.status)

  return (
    <LayoutWrapper role="staff" userName={user ? `${user.first_name} ${user.last_name}` : "Staff"} userRole="staff">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/staff/requests" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
        </div>

        {/* Grid Layout: Main Content (2/3) + Historique (1/3) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* REQUEST BLOCK with Progress Map */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Bloc Requête</h2>
                <div className="flex-shrink-0">
                  <ProgressMap
                    steps={progressMapProps.steps}
                    currentStep={progressMapProps.currentStep}
                    statuses={progressMapProps.statuses}
                  />
                </div>
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
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Type de requête</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                      {request.type_display}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Statut</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status_display}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-foreground p-4 bg-secondary rounded-lg whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Result Block (if exists) */}
            {request.result && (
              <Card className="p-6 border-2 border-green-200 dark:border-green-800">
                <h2 className="text-xl font-semibold mb-4">Bloc Résultat</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Décision</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        request.result.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {request.result.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                      </span>
                    </div>
                    {request.result.new_score && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Nouvelle note</p>
                        <p className="text-2xl font-bold text-green-600">{request.result.new_score}/20</p>
                      </div>
                    )}
                  </div>
                  {request.result.reason && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Raison</p>
                      <p className="text-sm p-4 bg-secondary rounded-lg whitespace-pre-wrap">{request.result.reason}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Pièces jointes</h2>
                <div className="space-y-3">
                  {request.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{attachment.filename || "Fichier"}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${API_BASE_URL}${attachment.file}`, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons - Show when status is 'received' or 'sent' */}
            {['received', 'sent'].includes(request.status) && (
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApproveModal(true)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approuver la requête
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle className="h-4 w-4" />
                  Rejeter la requête
                </Button>
              </div>
            )}
          </div>

          {/* Historique Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Historique</h2>
              {request.logs && request.logs.length > 0 ? (
                <div className="space-y-3">
                  {request.logs.map((log: any, index: number) => (
                    <div key={index} className="pb-3 border-b border-border last:border-0 last:pb-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm', { locale: fr })}
                      </p>
                      <p className="text-sm font-medium">{log.note || log.action}</p>
                      {log.actor_name && (
                        <p className="text-xs text-muted-foreground mt-1">Par: {log.actor_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la requête</DialogTitle>
            <DialogDescription>
              La requête sera approuvée et envoyée à la cellule informatique pour traitement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approve-reason">Commentaire (optionnel)</Label>
              <Textarea
                id="approve-reason"
                placeholder="Ajouter un commentaire sur l'approbation..."
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false)
                setApproveReason("")
              }}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Traitement..." : "Confirmer l'approbation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la requête</DialogTitle>
            <DialogDescription>
              La requête sera rejetée et clôturée immédiatement. Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reject-reason">
                Raison du rejet <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Expliquez pourquoi cette requête est rejetée..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-2"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                La raison du rejet est obligatoire
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setRejectReason("")
              }}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={submitting || !rejectReason.trim()}
              variant="destructive"
            >
              {submitting ? "Traitement..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  )
}
