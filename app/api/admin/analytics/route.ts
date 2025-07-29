import { type NextRequest, NextResponse } from "next/server"
import { authService, pool } from "@/lib/server-database"
import { calculateAnalyticsStats } from "@/lib/analytics-utils"

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return false

  const decoded = await authService.verifyToken(token)
  return decoded && decoded.role === "admin"
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get analytics events from database
    const eventsResult = await pool.query(
      "SELECT * FROM analytics_events WHERE timestamp >= $1 ORDER BY timestamp DESC",
      [cutoffDate],
    )

    // Get analytics sessions from database
    const sessionsResult = await pool.query(
      "SELECT * FROM analytics_sessions WHERE start_time >= $1 ORDER BY start_time DESC",
      [cutoffDate],
    )

    const events = eventsResult.rows.map((row) => ({
      id: row.id,
      type: row.event_type,
      page: row.page,
      element: row.element,
      value: row.value,
      timestamp: new Date(row.timestamp).getTime(),
      sessionId: row.session_id,
      userAgent: row.user_agent,
      referrer: row.referrer,
      location: row.location || {},
      device: row.device || { type: "desktop", os: "unknown", browser: "unknown", screenResolution: "unknown" },
    }))

    const sessions = sessionsResult.rows.map((row) => ({
      id: row.id,
      startTime: new Date(row.start_time).getTime(),
      endTime: row.end_time ? new Date(row.end_time).getTime() : undefined,
      pageViews: row.page_views,
      events: row.events,
      referrer: row.referrer,
      landingPage: row.landing_page,
      exitPage: row.exit_page,
      duration: row.duration,
      bounced: row.bounced,
    }))

    const data = { events, sessions }
    const stats = calculateAnalyticsStats(data, days)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
