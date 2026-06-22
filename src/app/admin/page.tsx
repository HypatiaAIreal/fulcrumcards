import Link from "next/link";
import { adminListCards, listSectors, type CardStatus, type Severity } from "@/lib/cards";
import { isLocale, type Locale } from "@/lib/i18n";
import LogoutButton from "@/components/admin/LogoutButton";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

const SEVERITIES: Severity[] = ["strong", "mixed", "warning", "critical"];

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
  const q = searchParams.q || "";

  const cards = await adminListCards({
    lang,
    sector: sector || undefined,
    severity: severity || undefined,
    status: status || undefined,
    q: q || undefined,
  });
  const sectors = listSectors();

  const sevColor: Record<string, string> = {
    strong: "var(--verified)",
    mixed: "var(--assumed)",
    warning: "var(--warning)",
    critical: "var(--absent)",
  };

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
      <form
        method="get"
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6"
      >
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

      {/* Tabla */}
      <div className="overflow-x-auto rounded-sm border border-copper/15">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-copper/15 font-mono text-[9px] uppercase tracking-[0.15em] text-copper/70">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Sector</th>
              <th className="px-3 py-2">Severidad</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={`${c.id}-${c.lang}`} className="border-b border-copper/10 text-sm">
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
                <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cream/50">
                  {c.status || "published"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/${lang}/cards/${c.id}`}
                      target="_blank"
                      className="font-mono text-[10px] uppercase tracking-wider text-cream/50 hover:text-cream"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/cards/${c.id}/edit`}
                      className="font-mono text-[10px] uppercase tracking-wider text-copper hover:text-copper-light"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={c.id} title={c.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
