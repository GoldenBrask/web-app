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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, ArrowLeft, Linkedin, Mail, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { teamService, type TeamMember } from "@/lib/database"

export default function TeamManagement() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: "",
    role: "",
    description: "",
    image: "",
    linkedin: "",
    email: "",
    skills: [],
    experience: "",
    education: "",
    projects: [],
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user.role === "admin") {
            setIsAuthenticated(true)
            loadTeamMembers()
          } else {
            router.push("/admin/login")
          }
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const members = await teamService.getAll()
      setTeamMembers(members)
    } catch (err) {
      setError("Erreur lors du chargement des membres de l'équipe")
      console.error("Error loading team members:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      if (editingMember) {
        // Update existing member
        const updatedMember = await teamService.update(editingMember.id, formData)
        setTeamMembers((prev) => prev.map((member) => (member.id === editingMember.id ? updatedMember : member)))
      } else {
        // Create new member
        const newMember = await teamService.create(formData as Omit<TeamMember, "id" | "created_at" | "updated_at">)
        setTeamMembers((prev) => [newMember, ...prev])
      }

      setIsModalOpen(false)
      setEditingMember(null)
      resetForm()
    } catch (err) {
      setError("Erreur lors de la sauvegarde")
      console.error("Error saving team member:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData(member)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return

    try {
      setError(null)
      await teamService.delete(id)
      setTeamMembers((prev) => prev.filter((member) => member.id !== id))
    } catch (err) {
      setError("Erreur lors de la suppression")
      console.error("Error deleting team member:", err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      description: "",
      image: "",
      linkedin: "",
      email: "",
      skills: [],
      experience: "",
      education: "",
      projects: [],
    })
  }

  const handleSkillsChange = (value: string) => {
    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill)
    setFormData({ ...formData, skills })
  }

  const handleProjectsChange = (value: string) => {
    const projects = value.split("\n").filter((project) => project.trim())
    setFormData({ ...formData, projects })
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion de l'équipe</h1>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMember ? "Modifier le membre" : "Ajouter un membre"}</DialogTitle>
                  <DialogDescription>Remplissez les informations du membre de l'équipe</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alexandre Martin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rôle</Label>
                      <Input
                        id="role"
                        value={formData.role || ""}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Président & Lead Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Master 2 MIAGE, spécialisé en..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alexandre@junior-miage-concept.fr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin || ""}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                    <Input
                      id="skills"
                      value={formData.skills?.join(", ") || ""}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      placeholder="React, Node.js, TypeScript, AWS"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Expérience</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience || ""}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="3 ans d'expérience en développement web..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="education">Formation</Label>
                    <Textarea
                      id="education"
                      value={formData.education || ""}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="Master 2 MIAGE - Université Paris-Dauphine"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projects">Projets (un par ligne)</Label>
                    <Textarea
                      id="projects"
                      value={formData.projects?.join("\n") || ""}
                      onChange={(e) => handleProjectsChange(e.target.value)}
                      placeholder="Plateforme e-commerce pour PME&#10;Application mobile de gestion RH"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">URL de l'image</Label>
                    <Input
                      id="image"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/placeholder.svg?height=120&width=120&text=AM"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingMember ? "Modifier" : "Ajouter"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des membres...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    width="120"
                    height="120"
                    alt={member.name}
                    className="mx-auto rounded-full mb-4"
                  />
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{member.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    {member.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {member.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${member.email}`}>
                          <Mail className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(member)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && teamMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun membre d'équipe trouvé</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier membre
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
