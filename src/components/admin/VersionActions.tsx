"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VersionActions({
  id,
  version,
  status,
}: {
  id: string;
  version: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function publish() {
    setBusy(true);
    const r = await fetch(`/api/admin/cards/${id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version }),
    });
    setBusy(false);
    if (r.ok) router.refresh();
    else alert("No se pudo publicar");
  }

  async function del() {
    if (!confirm(`¿Eliminar la versión ${version} (ES + EN)?`)) return;
    setBusy(true);
    const r = await fetch(`/api/admin/cards/${id}/versions/${version}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) router.refresh();
    else alert("No se pudo eliminar");
  }

  return (
    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider">
      {status !== "published" && (
        <button onClick={publish} disabled={busy} className="text-verified hover:opacity-80 disabled:opacity-50">
          Publicar
        </button>
      )}
      <Link href={`/admin/cards/${id}/edit?version=${version}`} className="text-copper hover:text-copper-light">
        Editar
      </Link>
      <button onClick={del} disabled={busy} className="text-absent/80 hover:text-absent disabled:opacity-50">
        Eliminar
      </button>
    </div>
  );
}
