import { NextResponse } from "next/server"
import { pool } from "@/lib/server-database"

export async function GET() {
  try {
    // Test database connection
    const result = await pool.query("SELECT NOW() as current_time, version() as postgres_version")

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: result.rows[0].current_time,
        version: result.rows[0].postgres_version.split(" ")[0] + " " + result.rows[0].postgres_version.split(" ")[1],
      },
      environment: {
        node_env: process.env.NODE_ENV,
        db_host: process.env.DB_HOST || "localhost",
        db_name: process.env.DB_NAME || "junior_miage_db",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
