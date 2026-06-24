import Link from "next/link";
import {
  adminListCards,
  listSectors,
  DEFAULT_VISIBILITY,
  VISIBILITIES,
  type CardStatus,
  type Severity,
  type Visibility,
} from "@/lib/cards";
import { isLocale, type Locale } from "@/lib/i18n";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminCardsTable, { type AdminRow } from "@/components/admin/AdminCardsTable";

export const dynamic = "force-dynamic";

const SEVERITIES: Severity[] = ["strong", "mixed", "warning", "critical"];
const VIS_LABEL: Record<Visibility, string> = {
  public: "Pública",
  teaser: "Teaser",
  hidden: "Oculta",
};

type SP = { [k: string]: string | undefined };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: SP;
}) {
  const lang: Locale = isLocale(searchParams.lang || "") ? (searchParams.lang as Locale) : "es";
  const sector = searchParams.sector || "";
  const severity = (searchParams.severity || "") as Severity | "";
  const status = (searchParams.status || "") as CardStatus | "";
  const visibility = (searchParams.visibility || "") as Visibility | "";
  const q = searchParams.q || "";

  const cards = await adminListCards({
    lang,
    sector: sector || undefined,
    severity: severity || undefined,
    status: status || undefined,
    visibility: visibility || undefined,
    q: q || undefined,
  });
  const sectors = listSectors();

  const rows: AdminRow[] = cards.map((c) => ({
    id: c.id,
    title: c.title,
    sector: c.sector,
    severity: c.severity,
    status: c.status || "published",
    version: c.version ?? 1,
    versions: c._versions,
    visibility: (c.visibility as Visibility) || DEFAULT_VISIBILITY,
  }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-copper">
          FulcrumCards · Admin
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/admin/cards/new"
            className="rounded-sm bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light"
          >
            + Nueva card
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Filtros */}
      <form method="get" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-7">
        <select name="sector" defaultValue={sector} className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream">
          <option value="">Todos los sectores</option>
          {sectors.map((s) => (
            <option key={s.es} value={s.es}>{s.es}</option>
          ))}
        </select>
        <select name="severity" defaultValue={severity} className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream">
          <option value="">Toda severidad</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="visibility" defaultValue={visibility} className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream">
          <option value="">Toda visibilidad</option>
          {VISIBILITIES.map((v) => (
            <option key={v} value={v}>{VIS_LABEL[v]}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream">
          <option value="">Todo estado</option>
          <option value="published">published</option>
          <option value="draft">draft</option>
        </select>
        <select name="lang" defaultValue={lang} className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream">
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar título…"
          className="rounded-sm border border-copper/25 bg-navy-deep px-2 py-2 font-sans text-xs text-cream"
        />
        <div className="flex gap-2">
          <button className="flex-1 rounded-sm border border-copper/40 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-copper hover:bg-copper/10">
            Filtrar
          </button>
          <Link href="/admin" className="flex items-center px-2 font-mono text-[10px] uppercase tracking-wider text-cream/40 hover:text-cream">
            Limpiar
          </Link>
        </div>
      </form>

      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-cream/40">
        {cards.length} cards ({lang})
      </div>

      <AdminCardsTable rows={rows} lang={lang} />
    </main>
  );
}
