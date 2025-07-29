import { type NextRequest, NextResponse } from "next/server"
import { teamService, authService } from "@/lib/server-database"

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

    const members = await teamService.getAll()
    return NextResponse.json(members)
  } catch (error) {
    console.error("Get team members API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const memberData = await request.json()
    const member = await teamService.create(memberData)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Create team member API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
