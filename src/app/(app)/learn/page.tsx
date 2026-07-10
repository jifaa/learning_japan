import { redirect } from "next/navigation";

export default function LearnPage() {
  // Halaman sementara dinonaktifkan
  redirect("/dashboard");
}
