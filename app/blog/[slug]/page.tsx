"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SharedHeader } from "@/components/shared-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, Clock, Share2, Check } from "lucide-react"
import type { BlogPost } from "@/lib/types"
import { useAnalytics } from "@/hooks/use-analytics"

export default function BlogArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/blog/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setRelatedPosts(data.relatedPosts || [])
        trackEvent("blog_post_view", { slug, title: data.post.title })
      } else if (response.status === 404) {
        router.push("/blog")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      router.push("/blog")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(" ").length
    return Math.ceil(words / wordsPerMinute)
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = post?.title || ""

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        trackEvent("blog_post_share", { slug: params.slug, method: "native" })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        trackEvent("blog_post_share", { slug: params.slug, method: "clipboard" })
      } catch (error) {
        console.error("Failed to copy to clipboard")
      }
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n\n").map((paragraph, index) => {
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
            {paragraph.replace("## ", "")}
          </h2>
        )
      }
      if (paragraph.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
            {paragraph.replace("### ", "")}
          </h3>
        )
      }
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {paragraph}
        </p>
      )
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/4 mb-8" />
                <div className="h-12 bg-muted rounded w-3/4 mb-4" />
                <div className="h-6 bg-muted rounded w-1/2 mb-8" />
                <div className="h-64 bg-muted rounded mb-8" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader />

      <main className="pt-20">
        <article className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
              </Link>

              {/* Article header */}
              <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadingTime(post.content)} min de lecture</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xl text-muted-foreground">{post.excerpt}</p>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {copied ? "Copié !" : "Partager"}
                  </Button>
                </div>
              </header>

              {/* Featured image */}
              {post.image && (
                <div className="mb-8">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article content */}
              <div className="prose prose-lg max-w-none mb-12">{formatContent(post.content)}</div>

              {/* Share section */}
              <div className="border-t pt-8 mb-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Partager cet article</h3>
                  <Button variant="outline" onClick={handleShare}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {copied ? "Copié !" : "Partager"}
                  </Button>
                </div>
              </div>

              {/* Related articles */}
              {relatedPosts.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold mb-8">Articles similaires</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                        {relatedPost.image && (
                          <div className="relative h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={relatedPost.image || "/placeholder.svg"}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="line-clamp-2 text-lg">{relatedPost.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{relatedPost.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>{relatedPost.author}</span>
                            <span>{formatDate(relatedPost.published_at)}</span>
                          </div>
                          <Link href={`/blog/${relatedPost.slug}`}>
                            <Button variant="outline" className="w-full bg-transparent">
                              Lire l'article
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2024 Junior MIAGE Concept. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
