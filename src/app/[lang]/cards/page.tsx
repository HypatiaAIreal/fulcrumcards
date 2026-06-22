import Link from "next/link";
import { getAllCards, catalog } from "@/lib/cards";
import {
  FULCRUM_KEYS,
  SEVERITY_STYLE,
  countVerified,
  isAllVerified,
  statusColor,
} from "@/lib/fulcrum";
import { getDictionary, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { lang: Locale } }) {
  return { title: getDictionary(params.lang).meta.catalogTitle };
}

export default async function CardsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = getDictionary(lang);
  const cards = await getAllCards(lang);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      {/* Hero */}
      <header className="mb-16 max-w-3xl">
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-copper">
          {dict.nav.catalogKicker}
        </div>
        <h1 className="mb-5 font-display text-4xl font-extrabold leading-tight text-cream md:text-5xl">
          {dict.catalog.title}
        </h1>
        <p className="font-sans text-base font-light leading-relaxed text-cream/70 md:text-lg">
          {dict.catalog.subtitlePre}
          <span className="text-copper-light">
            {dict.catalog.subtitleHighlight}
          </span>
          {dict.catalog.subtitlePost(
            cards.length,
            Math.max(catalog.total_planned, cards.length)
          )}
        </p>
      </header>

      {/* Cards publicadas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const sev = SEVERITY_STYLE[card.severity];
          const verified = countVerified(card);
          const badge = isAllVerified(card)
            ? dict.severity.allVerified
            : dict.severity[card.severity];
          return (
            <Link
              key={card.id}
              href={`/${lang}/cards/${card.id}`}
              className="group relative block rounded-sm border border-copper/25 bg-navy-deep p-6 transition-colors hover:border-copper/60"
            >
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-copper">
                {dict.nav.card} #{card.id} · {card.sector}
              </div>
              <div
                className="mb-4 inline-block rounded-[1px] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em]"
                style={{ color: sev.color, backgroundColor: sev.bg }}
              >
                {badge}
              </div>
              <h2 className="mb-2 font-display text-xl font-bold leading-snug text-cream">
                {card.title}
              </h2>
              <p className="mb-5 line-clamp-3 font-sans text-[13px] font-light leading-relaxed text-cream/60">
                {card.subtitle}
              </p>
              <div className="mb-1 flex items-center gap-1.5">
                {FULCRUM_KEYS.map((key) => {
                  const st = card.fulcrums[key].status;
                  const label = `${dict.fulcrums[key]}: ${dict.status[st]}`;
                  return (
                    <span
                      key={key}
                      role="img"
                      aria-label={label}
                      title={label}
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: statusColor(st) }}
                    />
                  );
                })}
                <span
                  className="ml-2 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: sev.color }}
                >
                  {verified}/4
                </span>
              </div>
              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-copper/70 transition-colors group-hover:text-copper">
                {dict.catalog.viewDiagnosis}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Vista del catálogo completo */}
      <section className="mt-24">
        <h2 className="mb-8 font-mono text-[11px] uppercase tracking-[0.25em] text-copper">
          {dict.catalog.underConstruction(catalog.total_planned)}
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.sectors.map((sector) => (
            <div key={sector.name.es}>
              <h3 className="mb-3 border-b border-copper/15 pb-2 font-display text-sm font-bold text-cream/80">
                {sector.name[lang]}
              </h3>
              <ul className="space-y-1.5">
                {sector.cards.map((c) => {
                  const created = c.status === "created";
                  const inner = (
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-copper/60">
                        {c.id}
                      </span>
                      <span
                        className={`font-sans text-[12.5px] ${
                          created ? "text-cream/80" : "text-cream/55"
                        }`}
                      >
                        {c.title[lang]}
                      </span>
                    </span>
                  );
                  return (
                    <li key={c.id}>
                      {created ? (
                        <Link
                          href={`/${lang}/cards/${c.id}`}
                          className="transition-colors hover:text-copper"
                        >
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
