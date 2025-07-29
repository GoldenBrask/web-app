"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Handshake, FileText, BarChart3, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  teamMembers: number
  partners: number
  blogPosts: number
  monthlyViews: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    teamMembers: 0,
    partners: 0,
    blogPosts: 0,
    monthlyViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user.role === "admin") {
            setIsAuthenticated(true)
            loadStats()
          } else {
            router.push("/admin/login")
          }
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/admin/login")
    }
  }

  if (!isAuthenticated) {
    return <div>Vérification de l'authentification...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administration - Junior MIAGE Concept</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tableau de bord</h2>
          <p className="text-gray-600 dark:text-gray-300">Gérez le contenu de votre site web Junior MIAGE Concept</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres d'équipe</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">Profils actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partenaires</CardTitle>
              <Handshake className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.partners}</div>
              <p className="text-xs text-muted-foreground">Partenariats actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles de blog</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.blogPosts}</div>
              <p className="text-xs text-muted-foreground">Articles publiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vues mensuelles</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.monthlyViews}</div>
              <p className="text-xs text-muted-foreground">Derniers 30 jours</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Gestion de l'équipe</CardTitle>
              <CardDescription>Ajoutez, modifiez ou supprimez les membres de votre équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/team">
                <Button className="w-full">Gérer l'équipe</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Handshake className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Gestion des partenaires</CardTitle>
              <CardDescription>Gérez vos partenaires et leurs informations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/partners">
                <Button className="w-full">Gérer les partenaires</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Gestion du blog</CardTitle>
              <CardDescription>Créez et publiez des articles de blog</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/blog">
                <Button className="w-full">Gérer le blog</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Configurez les paramètres généraux du site</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button className="w-full bg-transparent" variant="outline">
                  Paramètres
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Consultez les statistiques de votre site</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full bg-transparent" variant="outline">
                  Voir les stats
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Retour au site</CardTitle>
              <CardDescription>Voir le site public</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full bg-transparent" variant="outline">
                  Voir le site
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Gestion de la brochure</CardTitle>
              <CardDescription>Téléchargez et gérez la brochure de présentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/brochure">
                <Button className="w-full">Gérer la brochure</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
