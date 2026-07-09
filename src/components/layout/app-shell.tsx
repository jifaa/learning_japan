"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { MobileNav } from "./mobile-nav"
import { PageTransition } from "@/components/motion/page-transition"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

// ─── Shell Context ──────────────────────────────────────────────────

interface ShellContextValue {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  todayReviewCount: number
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error("useShell must be used within AppShell")
  return ctx
}

// ─── App Shell ──────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode
  user?: User | null
  displayName?: string | null
  todayReviewCount?: number
}

export function AppShell({ children, user, displayName, todayReviewCount = 0 }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <ShellContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        mobileNavOpen,
        setMobileNavOpen,
        todayReviewCount,
      }}
    >
      <div className="relative min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
            "lg:pl-[260px]",
            sidebarCollapsed && "lg:pl-[72px]"
          )}
        >
          {/* Header */}
          <AppHeader user={user} displayName={displayName} />

          {/* Page Content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

        {/* Mobile Slide-over Nav */}
        <MobileNav />
      </div>
    </ShellContext.Provider>
  )
}
