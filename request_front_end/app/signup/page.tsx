"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useState, useEffect } from "react"
import { classLevelsAPI, fieldsAPI } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    classLevel: "",
    field: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [classLevels, setClassLevels] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])
  const { signup } = useAuth()

  useEffect(() => {
    // Fetch class levels
    const fetchClassLevels = async () => {
      try {
        const response = await classLevelsAPI.list()
        // Handle both paginated and non-paginated responses
        const levels = Array.isArray(response) ? response : (response.results || [])
        setClassLevels(levels)
      } catch (error) {
        console.error("Failed to fetch class levels:", error)
        setClassLevels([])
      }
    }

    fetchClassLevels()
  }, [])

  useEffect(() => {
    // Fetch fields when class level changes
    const fetchFields = async () => {
      if (formData.classLevel) {
        try {
          const response = await fieldsAPI.list(parseInt(formData.classLevel))
          // Handle both paginated and non-paginated responses
          const fieldsData = Array.isArray(response) ? response : (response.results || [])
          setFields(fieldsData)
        } catch (error) {
          console.error("Failed to fetch fields:", error)
          setFields([])
        }
      } else {
        setFields([])
      }
    }

    fetchFields()
  }, [formData.classLevel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.matricule || !formData.classLevel || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setLoading(true)
    try {
      await signup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        matricule: formData.matricule,
        class_level: parseInt(formData.classLevel),
        field: formData.field ? parseInt(formData.field) : undefined,
        password: formData.password,
      })
      toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWrapper hideNav>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              GC
            </div>
            <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Inscription pour les étudiants</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom *</label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matricule *</label>
              <Input
                type="text"
                name="matricule"
                placeholder="ex: MT001234"
                value={formData.matricule}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Niveau *</label>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  disabled={loading}
                  required
                >
                  <option value="">Sélectionner</option>
                  {classLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Filière</label>
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  disabled={loading || !formData.classLevel}
                >
                  <option value="">Sélectionner</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe *</label>
              <Input
                type="password"
                name="password"
                placeholder="Créer un mot de passe fort"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe *</label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Création..." : "Créer un compte"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Vous avez déjà un compte?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
