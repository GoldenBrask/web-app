"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, ArrowLeft, Eye, Calendar, User } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  status: "draft" | "published"
  tags: string[]
  image?: string
}

export default function BlogManagement() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    status: "draft",
    tags: [],
    image: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadBlogPosts()
    }
  }, [router])

  const loadBlogPosts = () => {
    const saved = localStorage.getItem("blog-posts")
    if (saved) {
      setBlogPosts(JSON.parse(saved))
    } else {
      // Default blog posts
      const defaultPosts: BlogPost[] = [
        {
          id: 1,
          title: "L'avenir de la transformation digitale en 2024",
          slug: "avenir-transformation-digitale-2024",
          excerpt: "Découvrez les tendances qui façonneront la transformation digitale des entreprises cette année.",
          content: "La transformation digitale continue d'évoluer rapidement...",
          author: "Alexandre Martin",
          publishedAt: "2024-01-15",
          status: "published",
          tags: ["Digital", "Transformation", "Tendances"],
          image: "/placeholder.svg?height=200&width=400&text=Blog+Post",
        },
        {
          id: 2,
          title: "Comment choisir la bonne stack technologique pour votre projet",
          slug: "choisir-stack-technologique-projet",
          excerpt: "Guide pratique pour sélectionner les technologies adaptées à vos besoins.",
          content: "Le choix de la stack technologique est crucial...",
          author: "Sarah Dubois",
          publishedAt: "2024-01-10",
          status: "published",
          tags: ["Développement", "Technologies", "Guide"],
          image: "/placeholder.svg?height=200&width=400&text=Tech+Stack",
        },
      ]
      setBlogPosts(defaultPosts)
      localStorage.setItem("blog-posts", JSON.stringify(defaultPosts))
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleSave = () => {
    const slug = formData.slug || generateSlug(formData.title || "")
    const postData = {
      ...formData,
      slug,
      publishedAt: formData.publishedAt || new Date().toISOString().split("T")[0],
    }

    if (editingPost) {
      const updated = blogPosts.map((post) =>
        post.id === editingPost.id ? ({ ...postData, id: editingPost.id } as BlogPost) : post,
      )
      setBlogPosts(updated)
      localStorage.setItem("blog-posts", JSON.stringify(updated))
    } else {
      const newPost = {
        ...postData,
        id: Date.now(),
      } as BlogPost
      const updated = [...blogPosts, newPost]
      setBlogPosts(updated)
      localStorage.setItem("blog-posts", JSON.stringify(updated))
    }

    setIsModalOpen(false)
    setEditingPost(null)
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      status: "draft",
      tags: [],
      image: "",
    })
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData(post)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      const updated = blogPosts.filter((post) => post.id !== id)
      setBlogPosts(updated)
      localStorage.setItem("blog-posts", JSON.stringify(updated))
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData({ ...formData, tags })
  }

  if (!isAuthenticated) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du blog</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/blog">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le blog
                </Button>
              </Link>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPost ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
                    <DialogDescription>Rédigez votre article de blog</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          value={formData.title || ""}
                          onChange={(e) => {
                            const title = e.target.value
                            setFormData({
                              ...formData,
                              title,
                              slug: generateSlug(title),
                            })
                          }}
                          placeholder="Titre de l'article"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input
                          id="slug"
                          value={formData.slug || ""}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="url-de-l-article"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Extrait</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt || ""}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Résumé de l'article..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Contenu</Label>
                      <Textarea
                        id="content"
                        value={formData.content || ""}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Contenu complet de l'article..."
                        rows={10}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="author">Auteur</Label>
                        <Input
                          id="author"
                          value={formData.author || ""}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          placeholder="Nom de l'auteur"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Statut</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="published">Publié</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                      <Input
                        id="tags"
                        value={formData.tags?.join(", ") || ""}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="Digital, Transformation, Tendances"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">URL de l'image</Label>
                      <Input
                        id="image"
                        value={formData.image || ""}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="/placeholder.svg?height=200&width=400&text=Blog+Post"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSave}>{editingPost ? "Modifier" : "Publier"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {post.image && (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status === "published" ? "Publié" : "Brouillon"}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {post.publishedAt}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{post.author}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun article trouvé</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier article
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
