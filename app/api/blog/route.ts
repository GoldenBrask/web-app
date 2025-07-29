import { NextResponse } from "next/server"
import { blogService } from "@/lib/server-database"

export async function GET() {
  try {
    const posts = await blogService.getPublished()
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
