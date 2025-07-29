"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SharedHeader } from "@/components/shared-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Clock, Euro, Briefcase, Users, Star, CheckCircle } from "lucide-react"
import type { JobOffer } from "@/lib/types"
import { useAnalytics } from "@/hooks/use-analytics"

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    level: "",
    motivation: "",
  })
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    fetchJobs()
    trackEvent("page_view", { page: "/rejoignez-nous" })
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs/active")
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (job: JobOffer) => {
    setSelectedJob(job)
    trackEvent("job_application_start", { jobId: job.id, jobTitle: job.title })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOfferId: selectedJob.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          level: formData.level,
          motivation: formData.motivation,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setSelectedJob(null)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          level: "",
          motivation: "",
        })
        trackEvent("job_application_submit", { jobId: selectedJob.id, jobTitle: selectedJob.title })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stage":
        return "bg-blue-100 text-blue-800"
      case "alternance":
        return "bg-green-100 text-green-800"
      case "mission":
        return "bg-purple-100 text-purple-800"
      case "bénévolat":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stage":
        return "Stage"
      case "alternance":
        return "Alternance"
      case "mission":
        return "Mission"
      case "bénévolat":
        return "Bénévolat"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Rejoignez-nous</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Découvrez nos opportunités de stages, alternances et missions. Développez vos compétences au sein d'une
                équipe dynamique et passionnée.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Équipe collaborative</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span>Projets innovants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span>Expérience professionnelle</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Message */}
        {submitted && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Votre candidature a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {/* Job Offers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Nos offres actuelles</h2>

              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded" />
                          <div className="h-4 bg-muted rounded w-5/6" />
                          <div className="h-10 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-semibold mb-4">Aucune offre disponible</h3>
                  <p className="text-muted-foreground">
                    Nous n'avons pas d'offres ouvertes pour le moment. Revenez bientôt !
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getTypeColor(job.type)}>{getTypeLabel(job.type)}</Badge>
                          {job.is_urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                        <CardDescription>{job.department}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {job.duration}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Euro className="w-4 h-4 mr-2" />
                            {job.compensation}
                          </div>
                          <div className="flex items-center text-sm">
                            <Badge variant="outline">{job.level}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
                        <Button className="w-full" onClick={() => handleApply(job)}>
                          Postuler
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Application Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Postuler pour : {selectedJob.title}</CardTitle>
                <CardDescription>Remplissez le formulaire ci-dessous pour envoyer votre candidature.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Prénom *</label>
                      <Input
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nom *</label>
                      <Input
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Niveau d'études *</label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L3">Licence 3</SelectItem>
                        <SelectItem value="M1">Master 1</SelectItem>
                        <SelectItem value="M2">Master 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Lettre de motivation *</label>
                    <Textarea
                      required
                      rows={6}
                      placeholder="Expliquez pourquoi vous souhaitez rejoindre notre équipe..."
                      value={formData.motivation}
                      onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedJob(null)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? "Envoi..." : "Envoyer ma candidature"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
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
