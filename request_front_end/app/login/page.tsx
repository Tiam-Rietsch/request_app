"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LayoutWrapper } from "@/components/shared/layout-wrapper"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      toast.success("Connexion réussie!")
      // Router will be handled by the auth context
    } catch (error: any) {
      toast.error(error.message || "Nom d'utilisateur ou mot de passe incorrect")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWrapper hideNav>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              GC
            </div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue</h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
              <Input
                type="text"
                placeholder="Entrez votre matricule"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <Input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Vous n'avez pas de compte?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
