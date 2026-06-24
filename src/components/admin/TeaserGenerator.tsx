"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type Lang = "es" | "en";

export interface TeaserData {
  id: string;
  title: string;
  lesson: string;
  severity: string;
  fulcrumStatuses: string[]; // [material, epistemic, relational, provenance]
}

const SEVERITY_COLORS: Record<string, string> = {
  verified: "#5a9e6f",
  assumed: "#c4a03a",
  absent: "#b05050",
};

const SEVERITY_CONFIG: Record<string, { color: string; gradient: string }> = {
  strong: { color: "#5a9e6f", gradient: "rgba(90, 158, 111, 0.5)" },
  mixed: { color: "#c4a03a", gradient: "rgba(196, 160, 58, 0.5)" },
  warning: { color: "#c4a03a", gradient: "rgba(196, 160, 58, 0.5)" },
  critical: { color: "#b05050", gradient: "rgba(176, 80, 80, 0.5)" },
};

const LABELS: Record<Lang, { fulcrums: string; bookTitle: string; brand: string; urlBase: string }> = {
  es: {
    fulcrums: "FULCROS VERIFICADOS",
    bookTitle: "El Fulcro Invisible",
    brand: "García Bach & Hypatia · 2026",
    urlBase: "fulcrumcards.vercel.app/es/cards/",
  },
  en: {
    fulcrums: "FULCRUMS VERIFIED",
    bookTitle: "The Invisible Fulcrum",
    brand: "García Bach & Hypatia · 2026",
    urlBase: "fulcrumcards.vercel.app/en/cards/",
  },
};

function countVerified(statuses: string[]) {
  return statuses.filter((s) => s === "verified").length;
}

function TeaserPreview({
  data,
  lang,
  innerRef,
}: {
  data: TeaserData;
  lang: Lang;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const l = LABELS[lang];
  const verified = countVerified(data.fulcrumStatuses);
  const config = SEVERITY_CONFIG[data.severity] || SEVERITY_CONFIG.mixed;

  return (
    <div
      ref={innerRef}
      style={{
        width: 1200,
        height: 627,
        background: "#0b1a2e",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 100px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        boxSizing: "border-box",
      }}
    >
      {/* Corner marks */}
      <div style={{ position: "absolute", top: 24, left: 24, width: 32, height: 32, borderTop: "1px solid rgba(196,135,90,0.25)", borderLeft: "1px solid rgba(196,135,90,0.25)" }} />
      <div style={{ position: "absolute", bottom: 24, right: 24, width: 32, height: 32, borderBottom: "1px solid rgba(196,135,90,0.25)", borderRight: "1px solid rgba(196,135,90,0.25)" }} />

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 80,
          bottom: 80,
          width: 2,
          background: `linear-gradient(180deg, transparent 0%, ${config.gradient} 20%, ${config.gradient} 80%, transparent 100%)`,
        }}
      />

      {/* Label */}
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: "#c4875a", marginBottom: 28 }}>
        Card #{data.id} · {l.bookTitle}
      </div>

      {/* Title */}
      <div
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 800, fontSize: 52, color: "#f0e8db", lineHeight: 1.15, marginBottom: 32, letterSpacing: -0.5 }}
        dangerouslySetInnerHTML={{ __html: (data.title || "").replace(/</g, "&lt;").replace(/\n/g, "<br/>") }}
      />

      {/* Dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        {data.fulcrumStatuses.map((status, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: SEVERITY_COLORS[status] || SEVERITY_COLORS.absent }} />
        ))}
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 14, letterSpacing: 2, color: config.color, marginLeft: 6 }}>
          {verified} / 4 {l.fulcrums}
        </span>
      </div>

      {/* Lesson */}
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: "rgba(240,232,219,0.85)", lineHeight: 1.65, maxWidth: 820, marginBottom: 40 }}>
        &ldquo;{data.lesson}&rdquo;
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 14, color: "#d4a574", letterSpacing: 0.5 }}>
          {l.urlBase}
          {data.id}
        </span>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(196,135,90,0.4)" }}>
          {l.brand}
        </span>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-copper/25 bg-navy-deep px-3 py-2 font-sans text-sm text-cream outline-none focus:border-copper";
const labelCls = "mb-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70";

export default function TeaserGenerator({
  es,
  en,
}: {
  es: TeaserData;
  en: TeaserData;
}) {
  const [lang, setLang] = useState<Lang>("es");
  const [data, setData] = useState<Record<Lang, TeaserData>>({ es, en });
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const current = data[lang];

  function update(patch: Partial<TeaserData>) {
    setData((prev) => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));
  }

  async function download() {
    const node = previewRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(node, {
        width: 1200,
        height: 627,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0b1a2e",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `linkedin_teaser_${current.id}_${lang}.png`;
      a.click();
    } catch (e) {
      alert("No se pudo generar el PNG: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Controles superiores */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {(["es", "en"] as Lang[]).map((lg) => (
            <button
              key={lg}
              onClick={() => setLang(lg)}
              className={`rounded-sm px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] ${
                lang === lg ? "bg-copper text-navy-deep" : "border border-copper/30 text-copper hover:bg-copper/10"
              }`}
            >
              {lg}
            </button>
          ))}
        </div>
        <button
          onClick={download}
          disabled={busy}
          className="rounded-sm bg-copper px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
        >
          {busy ? "Generando PNG…" : "↓ Descargar PNG (1200×627)"}
        </button>
      </div>

      {/* Campos editables (título y lección por idioma) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Título (usa salto de línea para 2 líneas)</label>
          <textarea
            value={current.title}
            onChange={(e) => update({ title: e.target.value })}
            spellCheck={false}
            className={`${inputCls} h-20 resize-y`}
          />
        </div>
        <div>
          <label className={labelCls}>Lección (frase memorable)</label>
          <textarea
            value={current.lesson}
            onChange={(e) => update({ lesson: e.target.value })}
            spellCheck={false}
            className={`${inputCls} h-20 resize-y`}
          />
        </div>
      </div>
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-cream/40">
        severity: <span className="text-cream/70">{current.severity}</span> · fulcros:{" "}
        <span className="text-cream/70">{current.fulcrumStatuses.join(" · ")}</span> (del diagnóstico)
      </p>

      {/* Vista previa 1200×627 */}
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-copper">
        Vista previa LinkedIn (1200×627)
      </div>
      <div className="overflow-x-auto rounded-sm border border-copper/15">
        <TeaserPreview data={current} lang={lang} innerRef={previewRef} />
      </div>
    </div>
  );
}
