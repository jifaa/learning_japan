import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MockTestSelector } from "./mock-test-selector";

export const metadata: Metadata = { title: "Simulasi JLPT" };

export default async function MockTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <MockTestSelector />;
}
