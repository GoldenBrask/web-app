import { type NextRequest, NextResponse } from "next/server"
import { authService, pool } from "@/lib/server-database"

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

    // Get team members count
    const teamResult = await pool.query("SELECT COUNT(*) FROM team_members")
    const teamMembers = Number.parseInt(teamResult.rows[0].count)

    // Get partners count
    const partnersResult = await pool.query("SELECT COUNT(*) FROM partners")
    const partners = Number.parseInt(partnersResult.rows[0].count)

    // Get published blog posts count
    const blogResult = await pool.query("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'")
    const blogPosts = Number.parseInt(blogResult.rows[0].count)

    // Get monthly page views
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const viewsResult = await pool.query(
      "SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view' AND timestamp >= $1",
      [thirtyDaysAgo],
    )
    const monthlyViews = Number.parseInt(viewsResult.rows[0].count)

    return NextResponse.json({
      teamMembers,
      partners,
      blogPosts,
      monthlyViews,
    })
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
