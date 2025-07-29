"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded text-xs">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <button onClick={() => setTheme("light")} className="mr-2 px-2 py-1 bg-white text-black rounded">
        Light
      </button>
      <button onClick={() => setTheme("dark")} className="px-2 py-1 bg-black text-white rounded">
        Dark
      </button>
    </div>
  )
}
