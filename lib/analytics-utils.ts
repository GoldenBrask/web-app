"use client"

import type { AnalyticsEvent, AnalyticsSession } from "./analytics"

export interface AnalyticsData {
  events: AnalyticsEvent[]
  sessions: AnalyticsSession[]
}

export interface AnalyticsStats {
  totalPageViews: number
  uniqueVisitors: number
  totalSessions: number
  averageSessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number; percentage: number }>
  topReferrers: Array<{ referrer: string; visits: number; percentage: number }>
  deviceTypes: Array<{ type: string; count: number; percentage: number }>
  browsers: Array<{ browser: string; count: number; percentage: number }>
  operatingSystems: Array<{ os: string; count: number; percentage: number }>
  hourlyTraffic: Array<{ hour: number; views: number }>
  dailyTraffic: Array<{ date: string; views: number; visitors: number }>
  realTimeVisitors: number
  averageTimeOnPage: number
  exitPages: Array<{ page: string; exits: number; percentage: number }>
}

export function getAnalyticsData(): AnalyticsData {
  try {
    const events = JSON.parse(localStorage.getItem("analytics_events") || "[]")
    const sessions = JSON.parse(localStorage.getItem("analytics_sessions") || "[]")
    return { events, sessions }
  } catch {
    return { events: [], sessions: [] }
  }
}

export function calculateAnalyticsStats(data: AnalyticsData, dateRange = 30): AnalyticsStats {
  const { events, sessions } = data
  const cutoffDate = Date.now() - dateRange * 24 * 60 * 60 * 1000

  // Filter events and sessions by date range
  const filteredEvents = events.filter((event) => event.timestamp >= cutoffDate)
  const filteredSessions = sessions.filter((session) => session.startTime >= cutoffDate)

  // Basic metrics
  const pageViews = filteredEvents.filter((e) => e.type === "page_view")
  const totalPageViews = pageViews.length
  const uniqueVisitors = new Set(filteredSessions.map((s) => s.id)).size
  const totalSessions = filteredSessions.length

  // Session metrics
  const completedSessions = filteredSessions.filter((s) => s.endTime)
  const averageSessionDuration =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0

  const bounceRate =
    filteredSessions.length > 0 ? (filteredSessions.filter((s) => s.bounced).length / filteredSessions.length) * 100 : 0

  // Top pages
  const pageViewCounts = pageViews.reduce(
    (acc, event) => {
      acc[event.page] = (acc[event.page] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topPages = Object.entries(pageViewCounts)
    .map(([page, views]) => ({
      page: page || "Unknown",
      views,
      percentage: totalPageViews > 0 ? (views / totalPageViews) * 100 : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  // Top referrers
  const referrerCounts = filteredSessions.reduce(
    (acc, session) => {
      const referrer = session.referrer || "Direct"
      acc[referrer] = (acc[referrer] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topReferrers = Object.entries(referrerCounts)
    .map(([referrer, visits]) => ({
      referrer: referrer === "" ? "Direct" : referrer,
      visits,
      percentage: totalSessions > 0 ? (visits / totalSessions) * 100 : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)

  // Device analytics
  const deviceCounts = filteredEvents.reduce(
    (acc, event) => {
      if (event.device) {
        acc[event.device.type] = (acc[event.device.type] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const deviceTypes = Object.entries(deviceCounts)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Browser analytics
  const browserCounts = filteredEvents.reduce(
    (acc, event) => {
      if (event.device?.browser) {
        acc[event.device.browser] = (acc[event.device.browser] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const browsers = Object.entries(browserCounts)
    .map(([browser, count]) => ({
      browser,
      count,
      percentage: filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Operating system analytics
  const osCounts = filteredEvents.reduce(
    (acc, event) => {
      if (event.device?.os) {
        acc[event.device.os] = (acc[event.device.os] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const operatingSystems = Object.entries(osCounts)
    .map(([os, count]) => ({
      os,
      count,
      percentage: filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Hourly traffic
  const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => {
    const views = pageViews.filter((event) => {
      const eventHour = new Date(event.timestamp).getHours()
      return eventHour === hour
    }).length
    return { hour, views }
  })

  // Daily traffic
  const dailyTraffic = Array.from({ length: dateRange }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateString = date.toISOString().split("T")[0]
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime()

    const views = pageViews.filter((event) => event.timestamp >= dayStart && event.timestamp <= dayEnd).length

    const visitors = new Set(
      filteredSessions
        .filter((session) => session.startTime >= dayStart && session.startTime <= dayEnd)
        .map((session) => session.id),
    ).size

    return { date: dateString, views, visitors }
  }).reverse()

  // Real-time visitors (last 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const realTimeVisitors = new Set(
    filteredSessions
      .filter((session) => session.startTime >= fiveMinutesAgo && !session.endTime)
      .map((session) => session.id),
  ).size

  // Average time on page
  const timeOnPageEvents = filteredEvents.filter((e) => e.type === "time_on_page")
  const averageTimeOnPage =
    timeOnPageEvents.length > 0
      ? timeOnPageEvents.reduce((sum, event) => sum + ((event.value as number) || 0), 0) / timeOnPageEvents.length
      : 0

  // Exit pages
  const exitPageCounts = filteredSessions.reduce(
    (acc, session) => {
      if (session.exitPage) {
        acc[session.exitPage] = (acc[session.exitPage] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const exitPages = Object.entries(exitPageCounts)
    .map(([page, exits]) => ({
      page,
      exits,
      percentage: totalSessions > 0 ? (exits / totalSessions) * 100 : 0,
    }))
    .sort((a, b) => b.exits - a.exits)
    .slice(0, 10)

  return {
    totalPageViews,
    uniqueVisitors,
    totalSessions,
    averageSessionDuration,
    bounceRate,
    topPages,
    topReferrers,
    deviceTypes,
    browsers,
    operatingSystems,
    hourlyTraffic,
    dailyTraffic,
    realTimeVisitors,
    averageTimeOnPage,
    exitPages,
  }
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
