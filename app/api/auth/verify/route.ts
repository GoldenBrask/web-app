import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/server-database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = await authService.verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    })
  } catch (error) {
    console.error("Verify token error:", error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
