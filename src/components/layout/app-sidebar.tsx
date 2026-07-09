"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNav, secondaryNav, type NavItem } from "./nav-items"
import { useShell } from "./app-shell"
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { ProgressBar } from "@/components/ui/progress-bar"

// ─── NavLink ────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? item.title : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  )
}

// ─── DailyGoalProgress ──────────────────────────────────────────────

function DailyGoalProgress() {
  // In a real app, these values would come from a store or context
  const current = 15
  const target = 20

  return (
    <ProgressBar
      value={current}
      max={target}
      label="Target Harian"
      size="sm"
    />
  )
}

// ─── AppSidebar ─────────────────────────────────────────────────────

export function AppSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()
  const { toggleSidebar } = useShell()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">学</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-foreground">
                Learning Japan
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                JLPT N5
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="hidden shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground lg:flex"
          aria-label={collapsed ? "Perluas sidebar" : "Kecilkan sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
        <ul className="space-y-0.5" role="list">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                isActive={
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                }
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-border" aria-hidden="true" />

        <ul className="space-y-0.5" role="list">
          {secondaryNav.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                isActive={
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                }
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Daily Goal Footer */}
      {!collapsed && (
        <div className="shrink-0 border-t border-border p-4">
          <DailyGoalProgress />
        </div>
      )}
    </aside>
  )
}
