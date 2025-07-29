import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/server-database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email et mot de passe requis" }, { status: 400 })
    }

    const result = await authService.login(email, password)

    if (!result) {
      return NextResponse.json({ success: false, error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
    })

    // Set HTTP-only cookie for additional security
    response.cookies.set("admin-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "Erreur interne du serveur" }, { status: 500 })
  }
}
