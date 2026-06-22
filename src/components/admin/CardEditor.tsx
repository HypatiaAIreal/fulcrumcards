"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FulcrumCard from "@/components/FulcrumCard";
import { getDictionary } from "@/lib/i18n";
import type { Card } from "@/lib/cards";

type Mode = "new" | "edit";
type Lang = "es" | "en";

const FK = ["material", "epistemic", "relational", "provenance"] as const;

function pretty(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

/** Comprobación superficial para evitar que el preview crashee con JSON a medias. */
function previewable(obj: unknown): obj is Card {
  const c = obj as Card | null;
  return !!(
    c &&
    typeof c === "object" &&
    c.fulcrums &&
    FK.every((k) => c.fulcrums[k] && Array.isArray(c.fulcrums[k].bar)) &&
    c.contrast &&
    Array.isArray(c.references)
  );
}

export default function CardEditor({
  mode,
  sectors = [],
  initialEs,
  initialEn,
  id,
}: {
  mode: Mode;
  sectors?: { es: string; en: string }[];
  initialEs?: Card;
  initialEn?: Card;
  id?: string;
}) {
  const router = useRouter();
  const [esText, setEsText] = useState(initialEs ? pretty(initialEs) : "");
  const [enText, setEnText] = useState(initialEn ? pretty(initialEn) : "");
  const [tab, setTab] = useState<Lang>("es");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"gen" | "save" | null>(null);

  // Generación (modo nuevo)
  const [sectorSel, setSectorSel] = useState(sectors[0]?.es || "");
  const [customSector, setCustomSector] = useState("");
  const [title, setTitle] = useState("");

  const showEditor = mode === "edit" || (!!esText.trim() && !!enText.trim());

  async function generate() {
    setError("");
    const sector = sectorSel === "__new__" ? customSector.trim() : sectorSel;
    if (!sector || !title.trim()) {
      setError("Indica sector y nombre de la profesión/caso.");
      return;
    }
    setBusy("gen");
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sector, title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de generación");
      setEsText(pretty(data.es));
      setEnText(pretty(data.en));
      setTab("es");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function save(publish: boolean) {
    setError("");
    let es: Card, en: Card;
    try {
      es = JSON.parse(esText);
      en = JSON.parse(enText);
    } catch {
      setError("El JSON (ES o EN) no es válido.");
      return;
    }
    es.status = publish ? "published" : "draft";
    en.status = publish ? "published" : "draft";
    setBusy("save");
    try {
      const url = mode === "new" ? "/api/admin/cards" : `/api/admin/cards/${id}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ es, en }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = [
          data.error,
          data.es?.length ? `ES: ${data.es.join("; ")}` : "",
          data.en?.length ? `EN: ${data.en.join("; ")}` : "",
        ]
          .filter(Boolean)
          .join(" · ");
        throw new Error(detail || "Error al guardar");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const activeText = tab === "es" ? esText : enText;
  const setActiveText = tab === "es" ? setEsText : setEnText;
  const parsed = useMemo(() => {
    try {
      return { card: JSON.parse(activeText) as unknown, err: "" };
    } catch (e) {
      return { card: null, err: e instanceof Error ? e.message : "JSON inválido" };
    }
  }, [activeText]);

  return (
    <div>
      {/* Generación con Claude (solo nuevo) */}
      {mode === "new" && (
        <div className="mb-8 rounded-sm border border-copper/20 p-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-copper">
            Generar borrador con Claude (Sonnet 4.6)
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={sectorSel}
              onChange={(e) => setSectorSel(e.target.value)}
              className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream"
            >
              {sectors.map((s) => (
                <option key={s.es} value={s.es}>{s.es}</option>
              ))}
              <option value="__new__">➕ Nuevo sector…</option>
            </select>
            {sectorSel === "__new__" ? (
              <input
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Nombre del sector (ES)"
                className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream"
              />
            ) : (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Profesión o caso (ej. El Notario)"
                className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream"
              />
            )}
            <button
              onClick={generate}
              disabled={busy !== null}
              className="rounded-sm bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
            >
              {busy === "gen" ? "Generando…" : "Generar"}
            </button>
          </div>
          {sectorSel === "__new__" && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Profesión o caso (ej. El Notario)"
              className="mt-3 w-full rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream"
            />
          )}
          <p className="mt-2 font-sans text-[11px] text-cream/40">
            Genera el borrador ES + traducción EN. Después puedes editar el JSON y previsualizar antes de publicar.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-sm border border-absent/40 bg-absent/10 px-3 py-2 font-mono text-[11px] text-absent">
          {error}
        </p>
      )}

      {showEditor && (
        <>
          {/* Tabs idioma */}
          <div className="mb-3 flex items-center gap-3">
            {(["es", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setTab(l)}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
                  tab === l ? "text-copper" : "text-cream/40 hover:text-cream"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Editor + Preview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <textarea
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                spellCheck={false}
                className="h-[70vh] w-full rounded-sm border border-copper/25 bg-navy-deep p-3 font-mono text-[11px] leading-relaxed text-cream/90 outline-none focus:border-copper"
              />
              {parsed.err && (
                <p className="mt-1 font-mono text-[10px] text-absent">JSON: {parsed.err}</p>
              )}
            </div>
            <div>
              {previewable(parsed.card) ? (
                <FulcrumCard card={parsed.card} dict={getDictionary(tab)} />
              ) : (
                <div className="rounded-sm border border-copper/15 p-6 font-sans text-sm text-cream/40">
                  Completa un JSON válido para previsualizar.
                </div>
              )}
            </div>
          </div>

          {/* Guardar */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => save(true)}
              disabled={busy !== null}
              className="rounded-sm bg-copper px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
            >
              {busy === "save" ? "Guardando…" : "Publicar"}
            </button>
            <button
              onClick={() => save(false)}
              disabled={busy !== null}
              className="rounded-sm border border-copper/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-copper transition-colors hover:bg-copper/10 disabled:opacity-50"
            >
              Guardar borrador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
