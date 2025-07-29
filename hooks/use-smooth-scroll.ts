"use client"

import { useCallback } from "react"

export function useSmoothScroll() {
  const scrollToSection = useCallback((sectionId: string, offset = 64) => {
    const targetElement = document.getElementById(sectionId)

    if (targetElement) {
      const targetPosition = targetElement.offsetTop - offset

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  return { scrollToSection, scrollToTop }
}
