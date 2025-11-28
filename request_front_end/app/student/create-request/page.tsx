"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth, useRequireAuth } from "@/lib/auth-context"
import { classLevelsAPI, fieldsAPI, axesAPI, subjectsAPI, requestsAPI } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CreateRequestPage() {
  useRequireAuth(['student'])
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    classLevel: "",
    field: "",
    axis: "",
    subject: "",
    type: "cc",
    description: "",
  })

  const [classLevels, setClassLevels] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])
  const [axes, setAxes] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Initialize form with user's student profile data
  useEffect(() => {
    if (user?.student_profile) {
      setFormData(prev => ({
        ...prev,
        classLevel: user.student_profile.class_level?.toString() || "",
        field: user.student_profile.field?.toString() || "",
      }))
    }
  }, [user])

  // Fetch class levels on mount
  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        const response = await classLevelsAPI.list()
        const levels = Array.isArray(response) ? response : (response.results || [])
        setClassLevels(levels)
      } catch (error) {
        console.error("Failed to fetch class levels:", error)
        setClassLevels([])
      }
    }

    fetchClassLevels()
  }, [])

  // Fetch fields when class level changes
  useEffect(() => {
    const fetchFields = async () => {
      if (formData.classLevel) {
        try {
          const response = await fieldsAPI.list(parseInt(formData.classLevel))
          const fieldsData = Array.isArray(response) ? response : (response.results || [])
          setFields(fieldsData)
          // Reset dependent fields
          setFormData(prev => ({ ...prev, field: "", axis: "", subject: "" }))
          setAxes([])
          setSubjects([])
        } catch (error) {
          console.error("Failed to fetch fields:", error)
          setFields([])
        }
      } else {
        setFields([])
        setAxes([])
        setSubjects([])
      }
    }

    fetchFields()
  }, [formData.classLevel])

  // Fetch axes and subjects when field changes
  useEffect(() => {
    const fetchFieldData = async () => {
      if (formData.field) {
        try {
          // Fetch axes
          const axesResponse = await axesAPI.list(parseInt(formData.field))
          const axesData = Array.isArray(axesResponse) ? axesResponse : (axesResponse.results || [])
          setAxes(axesData)

          // Fetch subjects
          const subjectsResponse = await subjectsAPI.list({
            field_id: parseInt(formData.field),
            level_id: parseInt(formData.classLevel)
          })
          const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : (subjectsResponse.results || [])
          setSubjects(subjectsData)
          
          // Reset dependent fields
          setFormData(prev => ({ ...prev, axis: "", subject: "" }))
        } catch (error) {
          console.error("Failed to fetch field data:", error)
          setAxes([])
          setSubjects([])
        }
      } else {
        setAxes([])
        setSubjects([])
      }
    }

    fetchFieldData()
  }, [formData.field, formData.classLevel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.classLevel || !formData.field || !formData.subject || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)
    try {
      const requestData = {
        class_level: parseInt(formData.classLevel),
        field: parseInt(formData.field),
        axis: formData.axis ? parseInt(formData.axis) : undefined,
        subject: parseInt(formData.subject),
        type: formData.type,
        description: formData.description,
      }

      const response = await requestsAPI.create(requestData)
      toast.success("Requête créée avec succès!")
      router.push(`/student/requests/${response.id}`)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la requête")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <LayoutWrapper role="student" userName="..." userRole="student">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper role="student" userName={user ? `${user.first_name} ${user.last_name}` : "Étudiant"} userRole="student">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nouvelle Requête</h1>
          <p className="text-muted-foreground">Soumettre une nouvelle contestation de note</p>
        </div>

        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Niveau * 
                  {user?.student_profile?.class_level && (
                    <span className="ml-2 text-xs text-muted-foreground">(Pré-rempli depuis votre profil)</span>
                  )}
                </label>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionner un niveau</option>
                  {classLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Filière *
                  {user?.student_profile?.field && (
                    <span className="ml-2 text-xs text-muted-foreground">(Pré-remplie depuis votre profil)</span>
                  )}
                </label>
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                  disabled={!formData.classLevel || loading}
                >
                  <option value="">Sélectionner une filière</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.code} - {field.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Axe (Optionnel)</label>
              <select
                name="axis"
                value={formData.axis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md"
                disabled={!formData.field || loading}
              >
                <option value="">Sélectionner un axe</option>
                {axes.map((axis) => (
                  <option key={axis.id} value={axis.id}>
                    {axis.code} - {axis.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Matière *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md"
                required
                disabled={!formData.field || loading}
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code ? `${subject.code} - ` : ''}{subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type de requête *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="type" 
                    value="cc" 
                    checked={formData.type === "cc"} 
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>CC (Contrôle Continu)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="exam"
                    checked={formData.type === "exam"}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>EXAM (Examen)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                placeholder="Décrivez la raison de votre contestation..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Envoi en cours..." : "Soumettre la requête"}
              </Button>
              <Link href="/student/dashboard">
                <Button type="button" variant="outline" disabled={loading}>
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
