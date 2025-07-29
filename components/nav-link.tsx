"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive?: boolean
}

export function NavLink({ href, children, isActive }: NavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    const targetId = href.replace("#", "")
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      const headerHeight = 64 // Height of the sticky header (h-16 = 64px)
      const targetPosition = targetElement.offsetTop - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "text-sm font-medium transition-colors relative cursor-pointer",
        isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400",
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
      )}
    </a>
  )
}
