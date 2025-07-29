"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getAnalytics, trackPageView, trackEvent } from "@/lib/analytics"

export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track if we're in the browser
    if (typeof window === "undefined") return

    try {
      // Track page view when pathname changes
      trackPageView(pathname)
    } catch (error) {
      console.warn("Analytics tracking error:", error)
    }
  }, [pathname])

  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      try {
        if (typeof window !== "undefined") {
          trackEvent(eventName, properties)
        }
      } catch (error) {
        console.warn("Analytics event tracking error:", error)
      }
    },
    trackClick: (element: string, value?: string) => {
      try {
        if (typeof window !== "undefined") {
          const analytics = getAnalytics()
          if (analytics) {
            analytics.trackEvent("click", { element, value })
          }
        }
      } catch (error) {
        console.warn("Analytics click tracking error:", error)
      }
    },
    trackFormSubmit: (formName: string) => {
      try {
        if (typeof window !== "undefined") {
          const analytics = getAnalytics()
          if (analytics) {
            analytics.trackEvent("form_submit", { element: formName })
          }
        }
      } catch (error) {
        console.warn("Analytics form tracking error:", error)
      }
    },
  }
}
