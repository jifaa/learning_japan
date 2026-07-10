import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ kana: string }>;
}

export default async function HiraganaKanaPage({ params }: PageProps) {
  // Redirect to hiragana page - individual kana detail pages don't exist
  redirect("/hiragana");
}
