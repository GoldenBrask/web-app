"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import type { Partner } from "@/lib/types"

export function PartnersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Load partners from API
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const response = await fetch("/api/partners")
        if (response.ok) {
          const data = await response.json()
          setPartners(data)
        } else {
          console.error("Failed to load partners")
        }
      } catch (error) {
        console.error("Error loading partners:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPartners()
  }, [])

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Number of logos to show at once (responsive)
  const getLogosPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1280) return 6 // xl screens
      if (window.innerWidth >= 1024) return 5 // lg screens
      if (window.innerWidth >= 768) return 4 // md screens
      if (window.innerWidth >= 640) return 3 // sm screens
      return 2 // xs screens
    }
    return 5
  }

  const [logosPerView, setLogosPerView] = useState(5)

  useEffect(() => {
    const handleResize = () => {
      setLogosPerView(getLogosPerView())
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || partners.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = partners.length - logosPerView
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, 3000) // Faster auto-play for logos

    return () => clearInterval(interval)
  }, [isAutoPlaying, logosPerView, partners.length])

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
      const maxIndex = partners.length - logosPerView
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => {
      const maxIndex = partners.length - logosPerView
      return prevIndex <= 0 ? maxIndex : prevIndex - 1
    })
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const handlePartnerClick = (website: string, partnerName: string) => {
    try {
      trackEvent("partner_click", { partner: partnerName, website })
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
    window.open(website, "_blank", "noopener,noreferrer")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des partenaires...</span>
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Aucun partenaire trouvé</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Carousel Container */}
      <div
        className="overflow-hidden"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / logosPerView)}%)`,
          }}
        >
          {partners.map((partner) => (
            <div
              key={partner.id}
              className={cn(
                "flex-shrink-0 px-4 py-6",
                logosPerView === 2 && "w-1/2",
                logosPerView === 3 && "w-1/3",
                logosPerView === 4 && "w-1/4",
                logosPerView === 5 && "w-1/5",
                logosPerView === 6 && "w-1/6",
              )}
            >
              <div
                className="flex items-center justify-center h-20 cursor-pointer group transition-all duration-300 hover:scale-110"
                onClick={() => handlePartnerClick(partner.website, partner.name)}
                title={partner.description || `Visiter ${partner.name}`}
              >
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={`Logo ${partner.name}`}
                  width={160}
                  height={80}
                  className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle navigation indicators (optional) */}
      <div className="flex justify-center mt-4 space-x-1">
        {Array.from({ length: Math.ceil(partners.length / logosPerView) }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-200",
              Math.floor(currentIndex / logosPerView) === index ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700",
            )}
          />
        ))}
      </div>
    </div>
  )
}
