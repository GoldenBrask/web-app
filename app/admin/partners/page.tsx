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
import { Plus, Edit, Trash2, ArrowLeft, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Partner {
  id: number
  name: string
  logo: string
  website: string
  description?: string
}

export default function PartnersManagement() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [partners, setPartners] = useState<Partner[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: "",
    logo: "",
    website: "",
    description: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      loadPartners()
    }
  }, [router])

  const loadPartners = () => {
    const saved = localStorage.getItem("partners")
    if (saved) {
      setPartners(JSON.parse(saved))
    } else {
      // Default partners
      const defaultPartners: Partner[] = [
        {
          id: 1,
          name: "Capgemini",
          logo: "/placeholder.svg?height=80&width=160&text=Capgemini",
          website: "https://www.capgemini.com",
          description: "Leader mondial du conseil et des services numériques",
        },
        {
          id: 2,
          name: "Deloitte",
          logo: "/placeholder.svg?height=80&width=160&text=Deloitte",
          website: "https://www.deloitte.fr",
          description: "Cabinet de conseil en stratégie et transformation",
        },
        // Add more default partners...
      ]
      setPartners(defaultPartners)
      localStorage.setItem("partners", JSON.stringify(defaultPartners))
    }
  }

  const handleSave = () => {
    if (editingPartner) {
      const updated = partners.map((partner) =>
        partner.id === editingPartner.id ? ({ ...formData, id: editingPartner.id } as Partner) : partner,
      )
      setPartners(updated)
      localStorage.setItem("partners", JSON.stringify(updated))
    } else {
      const newPartner = {
        ...formData,
        id: Date.now(),
      } as Partner
      const updated = [...partners, newPartner]
      setPartners(updated)
      localStorage.setItem("partners", JSON.stringify(updated))
    }

    setIsModalOpen(false)
    setEditingPartner(null)
    setFormData({
      name: "",
      logo: "",
      website: "",
      description: "",
    })
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData(partner)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      const updated = partners.filter((partner) => partner.id !== id)
      setPartners(updated)
      localStorage.setItem("partners", JSON.stringify(updated))
    }
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des partenaires</h1>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un partenaire
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingPartner ? "Modifier le partenaire" : "Ajouter un partenaire"}</DialogTitle>
                  <DialogDescription>Remplissez les informations du partenaire</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du partenaire</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Capgemini"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.capgemini.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo">URL du logo</Label>
                    <Input
                      id="logo"
                      value={formData.logo || ""}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="/placeholder.svg?height=80&width=160&text=Capgemini"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Leader mondial du conseil et des services numériques"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>{editingPartner ? "Modifier" : "Ajouter"}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center h-20 mb-4">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={`Logo ${partner.name}`}
                    width={160}
                    height={80}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                {partner.description && <CardDescription className="text-sm">{partner.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visiter
                    </a>
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(partner)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(partner.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun partenaire trouvé</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier partenaire
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
