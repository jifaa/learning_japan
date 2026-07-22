import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { searchAll, type SearchResults } from "@/lib/content-search";
import { SearchClient } from "./search-client";

export const metadata: Metadata = { title: "Cari Kosakata, Kanji & Tata Bahasa" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params.q || "";

  let initialResults: SearchResults = {
    vocabulary: [],
    kanji: [],
    grammar: [],
    kana: [],
  };

  if (query.trim().length >= 1) {
    initialResults = await searchAll(query, 20);
  }

  return <SearchClient initialQuery={query} initialResults={initialResults} />;
}
