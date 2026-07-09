import { AppShell } from "@/components/layout/app-shell"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { getTodayReviewCount } from "@/lib/db/srs"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const profile = await getUserProfile()

  // Get today's review count for daily goal
  const todayReviewCount = user ? await getTodayReviewCount(user.id) : 0

  return (
    <AppShell user={user} displayName={profile?.display_name} todayReviewCount={todayReviewCount}>
      {children}
    </AppShell>
  )
}
