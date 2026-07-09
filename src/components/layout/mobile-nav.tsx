"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNav, secondaryNav, type NavItem } from "./nav-items"
import { useShell } from "./app-shell"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// ─── Mobile NavLink ─────────────────────────────────────────────────

function MobileNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{item.title}</span>
    </Link>
  )
}

// ─── MobileNav ──────────────────────────────────────────────────────

export function MobileNav() {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useShell()

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[280px] p-0 sm:w-[300px]">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">学</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Learning Japan
                </span>
                <span className="text-[11px] text-muted-foreground">
                  JLPT N5
                </span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Navigasi mobile"
        >
          <ul className="space-y-0.5" role="list">
            {mainNav.map((item) => (
              <li key={item.href}>
                <MobileNavLink
                  item={item}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                  onClick={() => setMobileNavOpen(false)}
                />
              </li>
            ))}
          </ul>

          <div className="my-4 h-px bg-border" aria-hidden="true" />

          <ul className="space-y-0.5" role="list">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <MobileNavLink
                  item={item}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                  onClick={() => setMobileNavOpen(false)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Daily Goal */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="rounded-lg bg-surface p-3">
            <p className="text-xs font-medium text-foreground">Target Harian</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Selesaikan 20 kartu hari ini
            </p>
            <div
              className="mt-2.5 h-1.5 w-full rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
