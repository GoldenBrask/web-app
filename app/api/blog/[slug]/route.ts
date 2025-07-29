import { NextResponse } from "next/server"
import { blogService } from "@/lib/server-database"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const posts = await blogService.getPublished()
    const post = posts.find((p) => p.slug === params.slug)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Find related posts based on shared tags
    const relatedPosts = posts
      .filter((p) => p.id !== post.id && p.tags.some((tag) => post.tags.includes(tag)))
      .slice(0, 3)

    return NextResponse.json({ post, relatedPosts })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}
