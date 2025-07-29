"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MousePointer,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { formatDuration, formatNumber } from "@/lib/analytics-utils"
import type { AnalyticsStats } from "@/lib/analytics-utils"

export default function AnalyticsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [dateRange, setDateRange] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user.role === "admin") {
            setIsAuthenticated(true)
            loadAnalytics()
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
  }, [router, dateRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError("Erreur lors du chargement des analytics")
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      setError("Erreur lors du chargement des analytics")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Vérification de l'authentification...</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>Réessayer</Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Aucune donnée d'analytics disponible</p>
          <p className="text-sm text-gray-500">
            Les données seront collectées automatiquement lors des visites du site
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(Number.parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnalytics} variant="outline">
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pages vues</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalPageViews)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.dailyTraffic.length > 1 && (
                  <span className="flex items-center">
                    {stats.dailyTraffic[stats.dailyTraffic.length - 1].views >
                    stats.dailyTraffic[stats.dailyTraffic.length - 2].views ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    vs hier
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visiteurs uniques</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.uniqueVisitors)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.realTimeVisitors > 0 && (
                  <span className="flex items-center">
                    <Activity className="h-3 w-3 text-green-500 mr-1" />
                    {stats.realTimeVisitors} en ligne
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.averageSessionDuration)}</div>
              <p className="text-xs text-muted-foreground">Par session</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de rebond</CardTitle>
              <MousePointer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.bounceRate < 40 ? (
                  <span className="text-green-600">Excellent</span>
                ) : stats.bounceRate < 70 ? (
                  <span className="text-yellow-600">Moyen</span>
                ) : (
                  <span className="text-red-600">À améliorer</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Trafic quotidien
              </CardTitle>
              <CardDescription>Pages vues et visiteurs par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.dailyTraffic.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{day.views}</span> vues
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{day.visitors}</span> visiteurs
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (day.views / Math.max(...stats.dailyTraffic.map((d) => d.views))) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Types d'appareils
              </CardTitle>
              <CardDescription>Répartition par type d'appareil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.deviceTypes.map((device) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.type === "Desktop" && <Monitor className="h-4 w-4 text-gray-600" />}
                      {device.type === "Mobile" && <Smartphone className="h-4 w-4 text-gray-600" />}
                      {device.type === "Tablet" && <Tablet className="h-4 w-4 text-gray-600" />}
                      <span className="text-sm font-medium">{device.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{device.count}</span>
                      <Badge variant="secondary">{device.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Pages populaires</CardTitle>
              <CardDescription>Pages les plus visitées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPages.slice(0, 5).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium truncate">{page.page || "/"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{page.views}</span>
                      <Badge variant="outline">{page.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>Sources de trafic</CardTitle>
              <CardDescription>D'où viennent vos visiteurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topReferrers.slice(0, 5).map((referrer, index) => (
                  <div key={referrer.referrer} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium truncate">
                        {referrer.referrer === "Direct" ? "Accès direct" : referrer.referrer}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{referrer.visits}</span>
                      <Badge variant="outline">{referrer.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Browsers */}
          <Card>
            <CardHeader>
              <CardTitle>Navigateurs</CardTitle>
              <CardDescription>Navigateurs utilisés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.browsers.map((browser, index) => (
                  <div key={browser.browser} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium">{browser.browser}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{browser.count}</span>
                      <Badge variant="outline">{browser.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Traffic */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Trafic par heure</CardTitle>
            <CardDescription>Répartition du trafic sur 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {stats.hourlyTraffic.map((hour) => (
                <div key={hour.hour} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{hour.hour}h</div>
                  <div
                    className="bg-blue-100 dark:bg-blue-900 rounded"
                    style={{
                      height: `${Math.max((hour.views / Math.max(...stats.hourlyTraffic.map((h) => h.views))) * 60, 4)}px`,
                    }}
                    title={`${hour.views} vues à ${hour.hour}h`}
                  />
                  <div className="text-xs text-gray-600 mt-1">{hour.views}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
