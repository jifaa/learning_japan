import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Learning Japan",
    template: "%s | Learning Japan",
  },
  description:
    "A Japanese language learning app for absolute beginners. Master hiragana, katakana, vocabulary, and grammar through structured, bite-sized lessons.",
  keywords: [
    "Japanese",
    "language learning",
    "JLPT",
    "N5",
    "hiragana",
    "katakana",
  ],
  authors: [{ name: "Learning Japan" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Learning Japan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
