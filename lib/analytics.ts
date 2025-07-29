"use client"

export interface AnalyticsEvent {
  id: string
  type: "page_view" | "click" | "form_submit" | "download" | "external_link" | "scroll" | "time_on_page"
  page: string
  element?: string
  value?: string | number
  timestamp: number
  sessionId: string
  userId?: string
  userAgent: string
  referrer: string
  location: {
    country?: string
    city?: string
    ip?: string
  }
  device: {
    type: "desktop" | "tablet" | "mobile"
    os: string
    browser: string
    screenResolution: string
  }
  duration?: number
}

export interface AnalyticsSession {
  id: string
  startTime: number
  endTime?: number
  pageViews: number
  events: number
  referrer: string
  landingPage: string
  exitPage?: string
  duration?: number
  bounced: boolean
}

class AnalyticsTracker {
  private sessionId: string
  private startTime: number
  private lastActivityTime: number
  private pageStartTime: number
  private events: AnalyticsEvent[] = []
  private currentPage = ""
  private scrollDepth = 0
  private maxScrollDepth = 0

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.lastActivityTime = this.startTime
    this.pageStartTime = this.startTime

    // Only initialize if we're in a browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        this.initializeTracking()
      } catch (error) {
        console.warn("Failed to initialize analytics tracking:", error)
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceInfo() {
    if (typeof window === "undefined")
      return {
        type: "desktop" as const,
        os: "unknown",
        browser: "unknown",
        screenResolution: "unknown",
      }

    const userAgent = navigator.userAgent
    const screenWidth = window.screen.width

    let deviceType: "desktop" | "tablet" | "mobile" = "desktop"
    if (screenWidth < 768) deviceType = "mobile"
    else if (screenWidth < 1024) deviceType = "tablet"

    let os = "unknown"
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS")) os = "iOS"

    let browser = "unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    return {
      type: deviceType,
      os,
      browser,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    }
  }

  private async getLocationInfo() {
    try {
      // In a real implementation, you'd use a geolocation service
      // For demo purposes, we'll simulate location data
      return {
        country: "France",
        city: "Paris",
        ip: "192.168.1.1",
      }
    } catch {
      return {}
    }
  }

  private initializeTracking() {
    // Ensure we're in browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return
    }

    // Track page visibility changes
    if (typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.trackTimeOnPage()
        } else {
          this.pageStartTime = Date.now()
        }
      })
    }

    // Track scroll depth
    let ticking = false
    const trackScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          this.scrollDepth = Math.round((scrollTop / docHeight) * 100)
          this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth)

          // Track scroll milestones
          if (this.scrollDepth >= 25 && this.scrollDepth < 50 && !this.hasTrackedScroll(25)) {
            this.trackEvent("scroll", { element: "25%", value: 25 })
          } else if (this.scrollDepth >= 50 && this.scrollDepth < 75 && !this.hasTrackedScroll(50)) {
            this.trackEvent("scroll", { element: "50%", value: 50 })
          } else if (this.scrollDepth >= 75 && this.scrollDepth < 100 && !this.hasTrackedScroll(75)) {
            this.trackEvent("scroll", { element: "75%", value: 75 })
          } else if (this.scrollDepth >= 100 && !this.hasTrackedScroll(100)) {
            this.trackEvent("scroll", { element: "100%", value: 100 })
          }

          ticking = false
        })
        ticking = true
      }
    }

    if (typeof window.addEventListener === "function") {
      window.addEventListener("scroll", trackScroll, { passive: true })
    }

    // Track clicks on external links
    if (typeof document.addEventListener === "function") {
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement
        const link = target.closest("a")

        if (link && link.href) {
          const isExternal = !link.href.includes(window.location.hostname)
          if (isExternal) {
            this.trackEvent("external_link", {
              element: link.href,
              value: link.textContent || link.href,
            })
          }
        }
      })
    }

    // Track form submissions
    if (typeof document.addEventListener === "function") {
      document.addEventListener("submit", (event) => {
        const form = event.target as HTMLFormElement
        const formId = form.id || form.className || "unknown-form"
        this.trackEvent("form_submit", {
          element: formId,
          value: formId,
        })
      })
    }

    // Track when user leaves the page
    if (typeof window.addEventListener === "function") {
      window.addEventListener("beforeunload", () => {
        this.trackTimeOnPage()
        this.endSession()
      })
    }

    // Track user activity - only add listeners that exist
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    activityEvents.forEach((eventType) => {
      try {
        if (typeof document.addEventListener === "function") {
          document.addEventListener(
            eventType,
            () => {
              this.lastActivityTime = Date.now()
            },
            { passive: true },
          )
        }
      } catch (error) {
        // Silently ignore if event type is not supported
        console.warn(`Event type ${eventType} not supported:`, error)
      }
    })
  }

  private hasTrackedScroll(depth: number): boolean {
    return this.events.some(
      (event) => event.type === "scroll" && event.page === this.currentPage && event.value === depth,
    )
  }

  private trackTimeOnPage() {
    if (this.currentPage && this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime
      if (duration > 1000) {
        // Only track if more than 1 second
        this.trackEvent("time_on_page", {
          element: this.currentPage,
          value: duration,
        })
      }
    }
  }

  async trackPageView(page: string) {
    // Track time on previous page
    if (this.currentPage) {
      this.trackTimeOnPage()
    }

    this.currentPage = page
    this.pageStartTime = Date.now()
    this.maxScrollDepth = 0

    const location = await this.getLocationInfo()

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "page_view",
      page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      location,
      device: this.getDeviceInfo(),
    }

    this.events.push(event)
    this.saveEvent(event)
    this.updateSession()
  }

  async trackEvent(
    type: AnalyticsEvent["type"],
    data: { element?: string; value?: string | number; duration?: number } = {},
  ) {
    const location = await this.getLocationInfo()

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      page: this.currentPage,
      element: data.element,
      value: data.value,
      duration: data.duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      location,
      device: this.getDeviceInfo(),
    }

    this.events.push(event)
    this.saveEvent(event)
    this.updateSession()
  }

  private async saveEvent(event: AnalyticsEvent) {
    try {
      // Save to database via API
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      // Also save to localStorage as backup
      const existingEvents = JSON.parse(localStorage.getItem("analytics_events") || "[]")
      existingEvents.push(event)

      // Keep only last 1000 events to prevent localStorage overflow
      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000)
      }

      localStorage.setItem("analytics_events", JSON.stringify(existingEvents))
    } catch (error) {
      console.error("Failed to save analytics event:", error)
      // Fallback to localStorage only
      try {
        const existingEvents = JSON.parse(localStorage.getItem("analytics_events") || "[]")
        existingEvents.push(event)
        if (existingEvents.length > 1000) {
          existingEvents.splice(0, existingEvents.length - 1000)
        }
        localStorage.setItem("analytics_events", JSON.stringify(existingEvents))
      } catch (localError) {
        console.error("Failed to save to localStorage:", localError)
      }
    }
  }

  private async updateSession() {
    try {
      const pageViews = this.events.filter((e) => e.type === "page_view").length
      const sessionData = {
        id: this.sessionId,
        startTime: this.startTime,
        pageViews,
        events: this.events.length,
        referrer: document.referrer,
        landingPage: this.currentPage,
        bounced: pageViews <= 1 && Date.now() - this.startTime < 30000,
        exitPage: this.currentPage,
      }

      // Save to database via API
      await fetch("/api/analytics/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      })

      // Also save to localStorage as backup
      const sessions = JSON.parse(localStorage.getItem("analytics_sessions") || "[]")
      let currentSession = sessions.find((s: AnalyticsSession) => s.id === this.sessionId)

      if (!currentSession) {
        currentSession = sessionData
        sessions.push(currentSession)
      } else {
        Object.assign(currentSession, sessionData)
      }

      localStorage.setItem("analytics_sessions", JSON.stringify(sessions))
    } catch (error) {
      console.error("Failed to update session:", error)
      // Fallback to localStorage only
      try {
        const sessions = JSON.parse(localStorage.getItem("analytics_sessions") || "[]")
        let currentSession = sessions.find((s: AnalyticsSession) => s.id === this.sessionId)

        if (!currentSession) {
          currentSession = {
            id: this.sessionId,
            startTime: this.startTime,
            pageViews: 0,
            events: 0,
            referrer: document.referrer,
            landingPage: this.currentPage,
            bounced: true,
          }
          sessions.push(currentSession)
        }

        const pageViews = this.events.filter((e) => e.type === "page_view").length
        currentSession.pageViews = pageViews
        currentSession.events = this.events.length
        currentSession.bounced = pageViews <= 1 && Date.now() - this.startTime < 30000
        currentSession.exitPage = this.currentPage

        localStorage.setItem("analytics_sessions", JSON.stringify(sessions))
      } catch (localError) {
        console.error("Failed to save session to localStorage:", localError)
      }
    }
  }

  private async endSession() {
    try {
      const sessionData = {
        id: this.sessionId,
        endTime: Date.now(),
        duration: Date.now() - this.startTime,
      }

      // Save to database via API
      await fetch("/api/analytics/sessions/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      })

      // Also save to localStorage as backup
      const sessions = JSON.parse(localStorage.getItem("analytics_sessions") || "[]")
      const currentSession = sessions.find((s: AnalyticsSession) => s.id === this.sessionId)

      if (currentSession) {
        currentSession.endTime = Date.now()
        currentSession.duration = currentSession.endTime - currentSession.startTime
        localStorage.setItem("analytics_sessions", JSON.stringify(sessions))
      }
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Public method to track custom events
  track(eventName: string, properties: Record<string, any> = {}) {
    this.trackEvent("click", {
      element: eventName,
      value: JSON.stringify(properties),
    })
  }
}

// Create global analytics instance
let analytics: AnalyticsTracker | null = null

export const getAnalytics = () => {
  if (typeof window !== "undefined" && !analytics) {
    try {
      analytics = new AnalyticsTracker()
    } catch (error) {
      console.warn("Failed to initialize analytics:", error)
      return null
    }
  }
  return analytics
}

export const trackPageView = (page: string) => {
  try {
    const tracker = getAnalytics()
    if (tracker) {
      tracker.trackPageView(page)
    }
  } catch (error) {
    console.warn("Failed to track page view:", error)
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    const tracker = getAnalytics()
    if (tracker) {
      tracker.track(eventName, properties)
    }
  } catch (error) {
    console.warn("Failed to track event:", error)
  }
}
