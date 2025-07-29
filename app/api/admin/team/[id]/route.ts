import { type NextRequest, NextResponse } from "next/server"
import { teamService, authService } from "@/lib/database"

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return false

  const decoded = await authService.verifyToken(token)
  return decoded && decoded.role === "admin"
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const memberData = await request.json()
    const member = await teamService.update(id, memberData)
    return NextResponse.json(member)
  } catch (error) {
    console.error("Update team member API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    await teamService.delete(id)
    return NextResponse.json({ message: "Membre supprimé" })
  } catch (error) {
    console.error("Delete team member API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
