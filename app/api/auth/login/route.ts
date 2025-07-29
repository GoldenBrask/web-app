import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/server-database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const result = await authService.login(email, password)

    if (!result) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    const response = NextResponse.json({
      message: "Connexion réussie",
      user: result.user,
    })

    // Set HTTP-only cookie for security
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
