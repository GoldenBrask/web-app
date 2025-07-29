"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, FileText, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function BrochureManagement() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user.role === "admin") {
            setIsAuthenticated(true)
            loadBrochure()
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

  const loadBrochure = () => {
    const savedBrochureUrl = localStorage.getItem("brochure-url")
    setBrochureUrl(savedBrochureUrl)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setUploadMessage({ type: "error", text: "Veuillez sélectionner un fichier PDF" })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setUploadMessage({ type: "error", text: "Le fichier ne doit pas dépasser 10MB" })
      return
    }

    setIsUploading(true)
    setUploadMessage(null)

    try {
      // In a real implementation, you would upload to a file storage service
      // For demo purposes, we'll create a blob URL and store it
      const blobUrl = URL.createObjectURL(file)

      // Store the blob URL in localStorage (in production, store the actual file URL)
      localStorage.setItem("brochure-url", blobUrl)
      localStorage.setItem("brochure-filename", file.name)
      localStorage.setItem("brochure-upload-date", new Date().toISOString())

      setBrochureUrl(blobUrl)
      setUploadMessage({ type: "success", text: "Brochure téléchargée avec succès !" })
    } catch (error) {
      setUploadMessage({ type: "error", text: "Erreur lors du téléchargement" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteBrochure = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer la brochure ?")) {
      localStorage.removeItem("brochure-url")
      localStorage.removeItem("brochure-filename")
      localStorage.removeItem("brochure-upload-date")
      setBrochureUrl(null)
      setUploadMessage({ type: "success", text: "Brochure supprimée avec succès" })
    }
  }

  const handlePreviewBrochure = () => {
    if (brochureUrl) {
      window.open(brochureUrl, "_blank")
    }
  }

  if (!isAuthenticated) {
    return <div>Chargement...</div>
  }

  const brochureFilename = localStorage.getItem("brochure-filename")
  const uploadDate = localStorage.getItem("brochure-upload-date")

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion de la brochure</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Télécharger une nouvelle brochure
              </CardTitle>
              <CardDescription>Téléchargez un fichier PDF qui sera accessible aux visiteurs du site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brochure-upload">Fichier PDF (max 10MB)</Label>
                  <Input
                    id="brochure-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="mt-1"
                  />
                </div>

                {uploadMessage && (
                  <Alert variant={uploadMessage.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{uploadMessage.text}</AlertDescription>
                  </Alert>
                )}

                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Téléchargement en cours...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Brochure Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Brochure actuelle
              </CardTitle>
              <CardDescription>Brochure actuellement disponible sur le site</CardDescription>
            </CardHeader>
            <CardContent>
              {brochureUrl ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="font-medium">{brochureFilename || "brochure.pdf"}</p>
                          {uploadDate && (
                            <p className="text-sm text-gray-500">
                              Téléchargée le {new Date(uploadDate).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePreviewBrochure}>
                          <Eye className="h-4 w-4 mr-1" />
                          Aperçu
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteBrochure}
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Cette brochure est accessible aux visiteurs via le bouton "Notre brochure" sur la page d'accueil.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucune brochure n'est actuellement disponible</p>
                  <p className="text-sm text-gray-400">
                    Téléchargez un fichier PDF ci-dessus pour le rendre accessible aux visiteurs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>• La brochure doit être au format PDF</p>
                <p>• Taille maximale : 10MB</p>
                <p>• Le fichier sera accessible via le bouton "Notre brochure" sur la page d'accueil</p>
                <p>• Les visiteurs pourront télécharger ou consulter la brochure dans un nouvel onglet</p>
                <p>• Assurez-vous que le contenu est à jour avant de télécharger</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
