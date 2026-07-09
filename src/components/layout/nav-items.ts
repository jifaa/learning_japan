import {
  BookOpen,
  Layers,
  BrainCircuit,
  FileText,
  BarChart3,
  Flame,
  Settings,
  Search,
  Bookmark,
  ClipboardList,
  Headphones,
  Award,
  User,
} from "lucide-react";

/**
 * Navigation item definition.
 */
export interface NavItem {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Main navigation items (primary learning features).
 * Labels in Bahasa Indonesia.
 */
export const mainNav: NavItem[] = [
  {
    href: "/dashboard",
    title: "Beranda",
    icon: BookOpen,
  },
  {
    href: "/learn",
    title: "Pelajaran",
    icon: Layers,
  },
  {
    href: "/hiragana",
    title: "Hiragana",
    icon: FileText,
  },
  {
    href: "/katakana",
    title: "Katakana",
    icon: FileText,
  },
  {
    href: "/vocabulary",
    title: "Kosakata",
    icon: BookOpen,
  },
  {
    href: "/grammar",
    title: "Tata Bahasa",
    icon: BrainCircuit,
  },
  {
    href: "/kanji",
    title: "Kanji",
    icon: FileText,
  },
  {
    href: "/flashcards",
    title: "Kartu Latihan",
    icon: Layers,
  },
  {
    href: "/quiz",
    title: "Kuis",
    icon: BrainCircuit,
  },
  {
    href: "/reading",
    title: "Bacaan",
    icon: FileText,
  },
];

/**
 * Secondary navigation items (progress, challenges, settings).
 */
export const secondaryNav: NavItem[] = [
  {
    href: "/search",
    title: "Cari",
    icon: Search,
  },
  {
    href: "/bookmarks",
    title: "Penanda",
    icon: Bookmark,
  },
  {
    href: "/notes",
    title: "Catatan",
    icon: FileText,
  },
  {
    href: "/mock-test",
    title: "Simulasi JLPT",
    icon: ClipboardList,
  },
  {
    href: "/listening",
    title: "Pendengaran",
    icon: Headphones,
  },
  {
    href: "/achievements",
    title: "Pencapaian",
    icon: Award,
  },
  {
    href: "/avatars",
    title: "Avatar",
    icon: User,
  },
  {
    href: "/progress",
    title: "Progres",
    icon: BarChart3,
  },
  {
    href: "/daily-challenge",
    title: "Tantangan Harian",
    icon: Flame,
  },
  {
    href: "/settings",
    title: "Pengaturan",
    icon: Settings,
  },
];

/**
 * All navigation items combined.
 */
export const allNavItems: NavItem[] = [...mainNav, ...secondaryNav];
