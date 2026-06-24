"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Visibility } from "@/lib/cards";

export interface AdminRow {
  id: string;
  title: string;
  sector: string;
  severity: string;
  status: string;
  version: number;
  versions: number;
  visibility: Visibility;
}

const VIS_LABEL: Record<Visibility, string> = {
  public: "Pública",
  teaser: "Teaser",
  hidden: "Oculta",
};
const VIS_DOT: Record<Visibility, string> = {
  public: "var(--verified)",
  teaser: "var(--assumed)",
  hidden: "rgba(240,232,219,0.35)",
};
const VIS_OPTIONS: Visibility[] = ["public", "teaser", "hidden"];

const sevColor: Record<string, string> = {
  strong: "var(--verified)",
  mixed: "var(--assumed)",
  warning: "var(--warning)",
  critical: "var(--absent)",
};

export default function AdminCardsTable({
  rows,
  lang,
}: {
  rows: AdminRow[];
  lang: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [bulkVis, setBulkVis] = useState<Visibility>("public");

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected = selected.size > 0 && selected.size === rows.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(allIds)));
  }

  async function changeOne(id: string, visibility: Visibility) {
    setBusy(true);
    const r = await fetch(`/api/admin/cards/${id}/visibility`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility }),
    });
    setBusy(false);
    if (r.ok) router.refresh();
    else alert("No se pudo cambiar la visibilidad");
  }

  async function applyBulk() {
    if (selected.size === 0) return;
    setBusy(true);
    const r = await fetch(`/api/admin/cards/visibility`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [...selected], visibility: bulkVis }),
    });
    setBusy(false);
    if (r.ok) {
      setSelected(new Set());
      router.refresh();
    } else {
      alert("No se pudo aplicar la acción masiva");
    }
  }

  async function del(id: string, title: string) {
    if (!confirm(`¿Eliminar la card #${id} "${title}" (todas las versiones)?`)) return;
    setBusy(true);
    const r = await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) router.refresh();
    else alert("No se pudo eliminar");
  }

  return (
    <div>
      {/* Barra de acción masiva */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-sm border border-copper/30 bg-copper/10 px-4 py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-copper">
            {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-cream/40">
            → cambiar visibilidad a
          </span>
          <select
            value={bulkVis}
            onChange={(e) => setBulkVis(e.target.value as Visibility)}
            className="rounded-sm border border-copper/30 bg-navy-deep px-2 py-1 font-mono text-[11px] text-cream"
          >
            {VIS_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {VIS_LABEL[v]}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulk}
            disabled={busy}
            className="rounded-sm bg-copper px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep hover:bg-copper-light disabled:opacity-50"
          >
            Aplicar
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="font-mono text-[10px] uppercase tracking-wider text-cream/40 hover:text-cream"
          >
            Deseleccionar
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-sm border border-copper/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-copper/15 font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70">
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Seleccionar todas"
                  className="accent-copper"
                />
              </th>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Sector</th>
              <th className="px-3 py-2">Severidad</th>
              <th className="px-3 py-2">Visibilidad</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Versión</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-copper/10 text-sm">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    aria-label={`Seleccionar #${c.id}`}
                    className="accent-copper"
                  />
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-copper/70">{c.id}</td>
                <td className="px-3 py-2 font-display text-cream/90">{c.title}</td>
                <td className="px-3 py-2 font-sans text-[12px] text-cream/60">{c.sector}</td>
                <td className="px-3 py-2">
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: sevColor[c.severity] }}
                  >
                    {c.severity}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: VIS_DOT[c.visibility] }}
                      aria-hidden="true"
                    />
                    <select
                      value={c.visibility}
                      disabled={busy}
                      onChange={(e) => changeOne(c.id, e.target.value as Visibility)}
                      aria-label={`Visibilidad de #${c.id}`}
                      className="rounded-sm border border-copper/20 bg-navy-deep px-1.5 py-1 font-mono text-[10px] text-cream disabled:opacity-50"
                    >
                      {VIS_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {VIS_LABEL[v]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cream/50">
                  {c.status || "published"}
                </td>
                <td className="px-3 py-2 font-mono text-[10px] text-cream/50">
                  v{c.version ?? 1}
                  {c.versions > 1 && <span className="text-copper/60"> · {c.versions} vers.</span>}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
                    <Link
                      href={`/${lang}/cards/${c.id}`}
                      target="_blank"
                      className="text-cream/50 hover:text-cream"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/cards/${c.id}/teaser`}
                      className="text-cream/50 hover:text-cream"
                    >
                      Teaser
                    </Link>
                    <Link
                      href={`/admin/cards/${c.id}`}
                      className="text-copper hover:text-copper-light"
                    >
                      Versiones
                    </Link>
                    <button
                      onClick={() => del(c.id, c.title)}
                      disabled={busy}
                      className="text-absent/80 hover:text-absent disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
