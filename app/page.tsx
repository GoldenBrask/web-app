"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Lightbulb,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Code,
  BarChart3,
  Briefcase,
  GraduationCap,
  Handshake,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeDebug } from "@/components/theme-debug"
import { NavLink } from "@/components/nav-link"
import { useActiveSection } from "@/hooks/use-active-section"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"
import { TeamCarousel } from "@/components/team-carousel"
import { PartnersCarousel } from "@/components/partners-carousel"
import { useAnalytics } from "@/hooks/use-analytics"

export default function LandingPage() {
  const activeSection = useActiveSection()
  const { scrollToSection } = useSmoothScroll()
  const { trackEvent } = useAnalytics()

  const handleDiscoverServices = () => {
    try {
      trackEvent("discover_services_click", { section: "hero" })
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
    scrollToSection("services")
  }

  const handleContactClick = () => {
    try {
      trackEvent("contact_click", { section: "hero" })
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
    scrollToSection("contact")
  }

  const handleBrochureClick = () => {
    try {
      trackEvent("brochure_download", { section: "hero" })
      // Get brochure URL from localStorage (uploaded via admin)
      const brochureUrl = localStorage.getItem("brochure-url") || "/placeholder-brochure.pdf"
      window.open(brochureUrl, "_blank")
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
  }

  const handleJoinUsClick = () => {
    try {
      trackEvent("join_us_click", { section: "hero" })
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
    window.location.href = "/rejoignez-nous"
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Junior MIAGE Concept</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <NavLink href="#services" isActive={activeSection === "services"}>
            Services
          </NavLink>
          <NavLink href="#about" isActive={activeSection === "about"}>
            À propos
          </NavLink>
          <NavLink href="#team" isActive={activeSection === "team"}>
            Équipe
          </NavLink>
          <NavLink href="#partners" isActive={activeSection === "partners"}>
            Partenaires
          </NavLink>
          <NavLink href="/blog" isActive={false}>
            Blog
          </NavLink>
          <NavLink href="/rejoignez-nous" isActive={false}>
            Recrutement
          </NavLink>
          <NavLink href="#contact" isActive={activeSection === "contact"}>
            Contact
          </NavLink>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Junior Entreprise Certifiée</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none dark:text-white">
                    Votre partenaire étudiant pour l'innovation digitale
                  </h1>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl">
                    Junior MIAGE Concept accompagne les entreprises dans leur transformation numérique grâce à
                    l'expertise de nos étudiants en informatique de gestion.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleContactClick}>
                    Demander un devis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleBrochureClick}>
                    Notre brochure
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleJoinUsClick}>
                    Rejoignez-nous
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>Certifiée CNJE</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>25+ étudiants experts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width="600"
                  height="400"
                  alt="Étudiants travaillant sur des projets informatiques"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">Nos Services</h2>
                <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Des solutions sur mesure alliant expertise technique et vision business
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <Code className="h-10 w-10 text-blue-600" />
                  <CardTitle>Développement Web & Mobile</CardTitle>
                  <CardDescription>
                    Applications web modernes, sites vitrine, applications mobiles et solutions e-commerce
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Sites web responsives</li>
                    <li>• Applications React/Next.js</li>
                    <li>• Applications mobiles</li>
                    <li>• Solutions e-commerce</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-blue-600" />
                  <CardTitle>Conseil & Analyse</CardTitle>
                  <CardDescription>
                    Audit informatique, conseil en transformation digitale et optimisation des processus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Audit des systèmes existants</li>
                    <li>• Conseil en digitalisation</li>
                    <li>• Analyse de données</li>
                    <li>• Optimisation des processus</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <Briefcase className="h-10 w-10 text-blue-600" />
                  <CardTitle>Gestion de Projet</CardTitle>
                  <CardDescription>Accompagnement complet de vos projets IT avec méthodologies agiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Gestion de projet Agile</li>
                    <li>• Formation utilisateurs</li>
                    <li>• Support technique</li>
                    <li>• Maintenance évolutive</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-blue-100 text-blue-800">Junior Entreprise</Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">
                    L'excellence étudiante au service des entreprises
                  </h2>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Junior MIAGE Concept est une Junior Entreprise regroupant les meilleurs étudiants de la filière
                    MIAGE. Nous combinons expertise technique et vision business pour accompagner les entreprises dans
                    leurs projets digitaux.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Projets sur mesure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Innovation constante</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Équipe dynamique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Qualité garantie</span>
                  </div>
                </div>
              </div>
              <Image
                src="/placeholder.svg?height=400&width=550"
                width="550"
                height="400"
                alt="Équipe Junior MIAGE Concept"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Projets réalisés</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">25+</div>
                <div className="text-sm text-gray-600">Étudiants experts</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Années d'expérience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">Notre Équipe</h2>
                <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Des étudiants passionnés et compétents, formés aux dernières technologies
                </p>
              </div>
            </div>
            <div className="py-12">
              <TeamCarousel />
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Handshake className="h-8 w-8 text-blue-600" />
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">Nos Partenaires</h2>
                </div>
                <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ils nous font confiance pour leurs projets de transformation digitale
                </p>
              </div>
            </div>
            <div className="py-12">
              <PartnersCarousel />
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cliquez sur un logo pour visiter le site de nos partenaires
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl dark:text-white">
                    Prêt à démarrer votre projet ?
                  </h2>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Contactez-nous pour discuter de vos besoins et obtenir un devis personnalisé.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="dark:text-gray-300">contact@junior-miage-concept.fr</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="dark:text-gray-300">+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="dark:text-gray-300">
                      Université Paris-Dauphine, Place du Maréchal de Lattre de Tassigny
                    </span>
                  </div>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Demande de devis</CardTitle>
                  <CardDescription>Décrivez-nous votre projet et nous vous recontacterons rapidement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Prénom" />
                    <Input placeholder="Nom" />
                  </div>
                  <Input placeholder="Email" type="email" />
                  <Input placeholder="Entreprise" />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Décrivez votre projet..."
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      try {
                        trackEvent("contact_form_submit", { form: "quote_request" })
                      } catch (error) {
                        console.warn("Analytics tracking error:", error)
                      }
                    }}
                  >
                    Envoyer la demande
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Junior MIAGE Concept. Tous droits réservés.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            Mentions légales
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            Politique de confidentialité
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            CGV
          </Link>
        </nav>
      </footer>
      <ThemeDebug />
    </div>
  )
}
