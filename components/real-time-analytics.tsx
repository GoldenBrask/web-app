"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Eye } from "lucide-react"
import { getAnalyticsData, calculateAnalyticsStats } from "@/lib/analytics-utils"

export function RealTimeAnalytics() {
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 0,
    pageViews: 0,
    topPages: [] as Array<{ page: string; views: number }>,
    recentEvents: [] as Array<{ type: string; page: string; timestamp: number }>,
  })

  useEffect(() => {
    const updateRealTimeData = () => {
      const data = getAnalyticsData()
      const stats = calculateAnalyticsStats(data, 1) // Last 24 hours

      // Get events from last 5 minutes
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      const recentEvents = data.events
        .filter((event) => event.timestamp >= fiveMinutesAgo)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)

      setRealtimeData({
        activeUsers: stats.realTimeVisitors,
        pageViews: stats.totalPageViews,
        topPages: stats.topPages.slice(0, 5),
        recentEvents: recentEvents.map((event) => ({
          type: event.type,
          page: event.page,
          timestamp: event.timestamp,
        })),
      })
    }

    updateRealTimeData()
    const interval = setInterval(updateRealTimeData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
          <Activity className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{realtimeData.activeUsers}</div>
          <p className="text-xs text-muted-foreground">En temps réel</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pages vues (24h)</CardTitle>
          <Eye className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realtimeData.pageViews}</div>
          <p className="text-xs text-muted-foreground">Dernières 24h</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activité récente</CardTitle>
          <CardDescription>Derniers événements (5 min)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {realtimeData.recentEvents.length > 0 ? (
              realtimeData.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                    <span className="truncate">{event.page}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">Aucune activité récente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
