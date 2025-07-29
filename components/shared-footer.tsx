import Link from "next/link"
import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react"

export function SharedFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Junior MIAGE</h3>
            <p className="text-muted-foreground mb-4">
              Junior-Entreprise spécialisée dans le développement web et les solutions digitales innovantes.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#a-propos" className="text-muted-foreground hover:text-primary">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-muted-foreground hover:text-primary">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#equipe" className="text-muted-foreground hover:text-primary">
                  Équipe
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#services" className="text-muted-foreground hover:text-primary">
                  Développement Web
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-muted-foreground hover:text-primary">
                  Applications Mobiles
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-muted-foreground hover:text-primary">
                  Consulting IT
                </Link>
              </li>
              <li>
                <Link href="/rejoignez-nous" className="text-muted-foreground hover:text-primary">
                  Recrutement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contact@junior-miage.fr
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Lyon, France
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Junior MIAGE. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
