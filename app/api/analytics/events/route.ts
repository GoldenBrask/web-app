import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/server-database"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    await pool.query(
      `INSERT INTO analytics_events (id, event_type, page, element, value, session_id, user_agent, referrer, location, device, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        event.id,
        event.type,
        event.page,
        event.element,
        event.value,
        event.sessionId,
        event.userAgent,
        event.referrer,
        JSON.stringify(event.location),
        JSON.stringify(event.device),
        new Date(event.timestamp),
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save analytics event error:", error)
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 })
  }
}
