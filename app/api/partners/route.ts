import { NextResponse } from "next/server"
import { partnerService } from "@/lib/server-database"

export async function GET() {
  try {
    const partners = await partnerService.getAll()
    return NextResponse.json(partners)
  } catch (error) {
    console.error("Get public partners error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
