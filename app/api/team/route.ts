import { NextResponse } from "next/server"
import { teamService } from "@/lib/server-database"

export async function GET() {
  try {
    const members = await teamService.getAll()
    return NextResponse.json(members)
  } catch (error) {
    console.error("Get public team members error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
