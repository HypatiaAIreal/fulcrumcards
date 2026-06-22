"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream/50 transition-colors hover:text-copper"
    >
      Salir →
    </button>
  );
}
