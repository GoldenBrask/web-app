import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/server-database"

export async function POST(request: NextRequest) {
  try {
    const session = await request.json()

    // Use UPSERT to handle both insert and update
    await pool.query(
      `INSERT INTO analytics_sessions (id, start_time, page_views, events, referrer, landing_page, exit_page, bounced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         page_views = EXCLUDED.page_views,
         events = EXCLUDED.events,
         exit_page = EXCLUDED.exit_page,
         bounced = EXCLUDED.bounced`,
      [
        session.id,
        new Date(session.startTime),
        session.pageViews,
        session.events,
        session.referrer,
        session.landingPage,
        session.exitPage,
        session.bounced,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save analytics session error:", error)
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}
