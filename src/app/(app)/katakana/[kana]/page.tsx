import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ kana: string }>;
}

export default async function KatakanaKanaPage({ params }: PageProps) {
  // Redirect to katakana page - individual kana detail pages don't exist
  redirect("/katakana");
}
