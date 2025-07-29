import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/server-database"

export async function POST(request: NextRequest) {
  try {
    const { id, endTime, duration } = await request.json()

    await pool.query(
      `UPDATE analytics_sessions 
       SET end_time = $1, duration = $2 
       WHERE id = $3`,
      [new Date(endTime), duration, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("End analytics session error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
