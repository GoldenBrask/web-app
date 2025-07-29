import { NextResponse } from "next/server"
import { jobService } from "@/lib/server-database"

export async function GET() {
  try {
    const jobs = await jobService.getActive()
    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching active jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
