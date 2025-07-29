"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Linkedin } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { TeamMemberModal } from "./team-member-modal"
import { trackEvent } from "@/lib/analytics"
import type { TeamMember } from "@/lib/types"

export function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Load team members from API
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const response = await fetch("/api/team")
        if (response.ok) {
          const members = await response.json()
          setTeamMembers(members)
        } else {
          console.error("Failed to load team members")
        }
      } catch (error) {
        console.error("Error loading team members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamMembers()
  }, [])

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Number of cards to show at once (responsive)
  const getCardsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3 // lg screens
      if (window.innerWidth >= 768) return 2 // md screens
      return 1 // sm screens
    }
    return 3
  }

  const [cardsPerView, setCardsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView())
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || teamMembers.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = teamMembers.length - cardsPerView
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, cardsPerView, teamMembers.length])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => {
      const maxIndex = teamMembers.length - cardsPerView
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => {
      const maxIndex = teamMembers.length - cardsPerView
      return prevIndex <= 0 ? maxIndex : prevIndex - 1
    })
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const openMemberModal = (member: TeamMember) => {
    try {
      trackEvent("team_member_view", { member: member.name, role: member.role })
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const closeMemberModal = () => {
    setIsModalOpen(false)
    setSelectedMember(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement de l'équipe...</span>
      </div>
    )
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Aucun membre d'équipe trouvé</p>
      </div>
    )
  }

  const maxIndex = teamMembers.length - cardsPerView

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Carousel Container */}
      <div
        className="overflow-hidden"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
          }}
        >
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={cn(
                "flex-shrink-0 px-3",
                cardsPerView === 1 && "w-full",
                cardsPerView === 2 && "w-1/2",
                cardsPerView === 3 && "w-1/3",
              )}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="relative">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      width="120"
                      height="120"
                      alt={member.name}
                      className="mx-auto rounded-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {member.linkedin && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          try {
                            trackEvent("linkedin_click", { member: member.name })
                          } catch (error) {
                            console.warn("Analytics tracking error:", error)
                          }
                          window.open(member.linkedin, "_blank")
                        }}
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{member.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMemberModal(member)}
                    className="hover:bg-blue-50 hover:border-blue-200"
                  >
                    Voir le profil
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl z-10"
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl z-10"
        onClick={nextSlide}
        disabled={currentIndex >= maxIndex}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors duration-200",
              currentIndex === index
                ? "bg-blue-600"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500",
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Auto-play Toggle */}
      <div className="flex justify-center mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {isAutoPlaying ? "Pause" : "Play"} auto-défilement
        </Button>
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal member={selectedMember} isOpen={isModalOpen} onClose={closeMemberModal} />
    </div>
  )
}
