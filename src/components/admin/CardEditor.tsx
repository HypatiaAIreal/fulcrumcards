"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FulcrumCard from "@/components/FulcrumCard";
import { getDictionary } from "@/lib/i18n";
import type { Card } from "@/lib/cards";

type Mode = "new" | "edit";
type Lang = "es" | "en";

const FK = ["material", "epistemic", "relational", "provenance"] as const;
const pretty = (o: unknown) => JSON.stringify(o, null, 2);

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

const inputCls =
  "rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream outline-none focus:border-copper";

export default function CardEditor({
  mode,
  sectors = [],
  initialEs,
  initialEn,
  id,
  version,
}: {
  mode: Mode;
  sectors?: { es: string; en: string }[];
  initialEs?: Card;
  initialEn?: Card;
  id?: string;
  version?: number;
}) {
  const router = useRouter();
  const [esText, setEsText] = useState(initialEs ? pretty(initialEs) : "");
  const [enText, setEnText] = useState(initialEn ? pretty(initialEn) : "");
  const [tab, setTab] = useState<Lang>("es");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<null | "gen" | "save">(null);

  // Metadata de versión
  const [model, setModel] = useState(initialEs?.model || "manual");
  const [createdBy, setCreatedBy] = useState(initialEs?.created_by || "carles");
  const [notes, setNotes] = useState(initialEs?.notes || "");

  // Entradas de creación
  const [source, setSource] = useState<"gen" | "import">("gen");
  const [sectorSel, setSectorSel] = useState(sectors[0]?.es || "");
  const [customSector, setCustomSector] = useState("");
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [importText, setImportText] = useState("");

  const isNewVersion = mode === "new" && !!id;
  const showCreateTools = mode === "new";
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
        body: JSON.stringify({ sector, title: title.trim(), context: context.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de generación");
      setEsText(pretty(data.es));
      setEnText(pretty(data.en));
      setModel(data.es?.model || "claude-sonnet-4-6");
      setCreatedBy(data.es?.created_by || "claude-api");
      setNotes(data.es?.notes || "");
      setTab("es");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  function importJson() {
    setError("");
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(importText);
    } catch (e) {
      setError("JSON inválido: " + (e instanceof Error ? e.message : String(e)));
      return;
    }
    if (obj.es && obj.en) {
      setEsText(pretty(obj.es));
      setEnText(pretty(obj.en));
    } else if (obj.lang === "es") {
      setEsText(pretty(obj));
    } else if (obj.lang === "en") {
      setEnText(pretty(obj));
    } else {
      setError('Se esperaba {"es":…,"en":…} o una card con campo "lang".');
      return;
    }
    setModel("manual");
    setCreatedBy("json-import");
    setTab("es");
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
    if (id) {
      es.id = id;
      en.id = id;
    }
    const meta = { model, created_by: createdBy, notes };
    let url = "/api/admin/cards";
    let method = "POST";
    if (mode === "edit") {
      url = `/api/admin/cards/${id}/versions/${version}`;
      method = "PUT";
    } else if (isNewVersion) {
      url = `/api/admin/cards/${id}/versions`;
    }
    setBusy("save");
    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ es, en, meta, publish }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = [data.error, data.es?.join?.("; "), data.en?.join?.("; ")]
          .filter(Boolean)
          .join(" · ");
        throw new Error(detail || "Error al guardar");
      }
      router.push(id || data.id ? `/admin/cards/${id || data.id}` : "/admin");
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
      {showCreateTools && (
        <div className="mb-8 rounded-sm border border-copper/20 p-4">
          <div className="mb-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em]">
            <button
              onClick={() => setSource("gen")}
              className={source === "gen" ? "text-copper" : "text-cream/40 hover:text-cream"}
            >
              Generar con Claude
            </button>
            <span className="text-copper/30">·</span>
            <button
              onClick={() => setSource("import")}
              className={source === "import" ? "text-copper" : "text-cream/40 hover:text-cream"}
            >
              Importar JSON
            </button>
          </div>

          {source === "gen" ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                <select value={sectorSel} onChange={(e) => setSectorSel(e.target.value)} className={inputCls}>
                  {sectors.map((s) => (
                    <option key={s.es} value={s.es}>{s.es}</option>
                  ))}
                  <option value="__new__">➕ Nuevo sector…</option>
                </select>
                {sectorSel === "__new__" ? (
                  <input value={customSector} onChange={(e) => setCustomSector(e.target.value)} placeholder="Nombre del sector (ES)" className={inputCls} />
                ) : (
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Profesión o caso (ej. El Notario)" className={inputCls} />
                )}
              </div>
              {sectorSel === "__new__" && (
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Profesión o caso (ej. El Notario)" className={`${inputCls} w-full`} />
              )}
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Contexto adicional (opcional): datos, papers, enfoques, matices que Claude debe usar en el diagnóstico…"
                className={`${inputCls} h-24 w-full resize-y`}
              />
              <button
                onClick={generate}
                disabled={busy !== null}
                className="rounded-sm bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
              >
                {busy === "gen" ? "Generando… (~40s)" : "Generar borrador"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Pega aquí: {"es": {…}, "en": {…}}  (o una card individual con "lang")'
                spellCheck={false}
                className={`${inputCls} h-40 w-full resize-y font-mono`}
              />
              <button
                onClick={importJson}
                className="rounded-sm bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light"
              >
                Cargar JSON
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-sm border border-absent/40 bg-absent/10 px-3 py-2 font-mono text-[11px] text-absent">
          {error}
        </p>
      )}

      {showEditor && (
        <>
          {/* Metadata de versión */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70">model</span>
              <input value={model} onChange={(e) => setModel(e.target.value)} className={`${inputCls} mt-1 w-full`} />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70">created_by</span>
              <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className={`${inputCls} mt-1 w-full`} />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70">notes</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas de esta versión" className={`${inputCls} mt-1 w-full`} />
            </label>
          </div>

          <div className="mb-3 flex items-center gap-3">
            {(["es", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setTab(l)}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] ${tab === l ? "text-copper" : "text-cream/40 hover:text-cream"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <textarea
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                spellCheck={false}
                className="h-[70vh] w-full rounded-sm border border-copper/25 bg-navy-deep p-3 font-mono text-[11px] leading-relaxed text-cream/90 outline-none focus:border-copper"
              />
              {parsed.err && <p className="mt-1 font-mono text-[10px] text-absent">JSON: {parsed.err}</p>}
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
