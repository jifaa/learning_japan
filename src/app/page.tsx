import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

/**
 * Landing page.
 * Redirects logged-in users to /dashboard.
 * Provides CTA for non-logged-in users.
 */
export default async function HomePage() {
  const user = await getCurrentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-semibold text-foreground">Learning Japan</span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Mulai Belajar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl text-center space-y-8 py-16 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground text-balance">
              Belajar Bahasa Jepang,<br />satu pelajaran setiap saat
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty">
              Kuasai hiragana, katakana, kosakata, dan tata bahasa dengan
              pelajaran terstruktur yang dirancang untuk pemula.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <Link href="/register">
              <Button size="lg" className="group h-12 px-6">
                Mulai belajar gratis
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Perjalanan Anda menuju kecekapan bahasa Jepang dimulai di sini.
        </div>
      </footer>
    </div>
  );
}
