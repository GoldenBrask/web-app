import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie" })

  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  })

  return response
}
