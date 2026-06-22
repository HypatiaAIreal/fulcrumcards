"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`¿Eliminar la card #${id} "${title}" (ES + EN)?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("No se pudo eliminar");
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="font-mono text-[10px] uppercase tracking-wider text-absent/80 transition-colors hover:text-absent disabled:opacity-50"
    >
      {busy ? "…" : "Eliminar"}
    </button>
  );
}
