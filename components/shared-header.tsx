"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Briefcase, BookOpen } from "lucide-react"

export function SharedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  const NavLink = ({
    href,
    children,
    className = "",
  }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link
      href={href}
      className={`transition-colors hover:text-primary ${
        isActive(href) ? "text-primary font-medium" : "text-muted-foreground"
      } ${className}`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-background/80 backdrop-blur-sm border-b"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">JM</span>
            </div>
            <span className="font-bold text-lg">Junior MIAGE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/#services">Services</NavLink>
            <NavLink href="/#equipe">Équipe</NavLink>
            <NavLink href="/#partenaires">Partenaires</NavLink>
            <NavLink href="/#contact">Contact</NavLink>

            <NavLink href="/blog" className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>Blog</span>
            </NavLink>
            <NavLink href="/rejoignez-nous" className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>Recrutement</span>
            </NavLink>

            <ThemeToggle />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-sm border-t">
            <nav className="flex flex-col space-y-4 p-4">
              <NavLink href="/">Accueil</NavLink>
              <NavLink href="/#services">Services</NavLink>
              <NavLink href="/#equipe">Équipe</NavLink>
              <NavLink href="/#partenaires">Partenaires</NavLink>
              <NavLink href="/#contact">Contact</NavLink>

              <NavLink href="/blog" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Blog</span>
              </NavLink>
              <NavLink href="/rejoignez-nous" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Recrutement</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
