import Link from "next/link";
import { getAllCards, catalog, type Card } from "@/lib/cards";
import {
  FULCRUM_KEYS,
  SEVERITY_STYLE,
  countVerified,
  isAllVerified,
  statusColor,
} from "@/lib/fulcrum";
import LockIcon from "@/components/LockIcon";
import { getDictionary, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { lang: Locale } }) {
  return { title: getDictionary(params.lang).meta.catalogTitle };
}

export default async function CardsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = getDictionary(lang);
  // public + teaser (las hidden quedan fuera). El estilo depende de visibility.
  const cards = await getAllCards(lang);
  const publicCount = cards.filter((c) => c.visibility === "public").length;

  // Agrupado por sector para la lista, respetando el orden de catalog.json.
  const order = catalog.sectors.map((s) => s.name[lang]);
  const bySector = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = bySector.get(c.sector) ?? [];
    arr.push(c);
    bySector.set(c.sector, arr);
  }
  const sectorNames = [...bySector.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

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
          <span className="text-copper-light">{dict.catalog.subtitleHighlight}</span>
          {dict.catalog.subtitlePost(publicCount, cards.length)}
        </p>
      </header>

      {/* Tiles */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) =>
          card.visibility === "public" ? (
            <PublicTile key={card.id} card={card} lang={lang} dict={dict} />
          ) : (
            <TeaserTile key={card.id} card={card} dict={dict} />
          )
        )}
      </section>

      {/* Lista por sector */}
      <section className="mt-24">
        <h2 className="mb-8 font-mono text-[11px] uppercase tracking-[0.25em] text-copper">
          {dict.catalog.bySector}
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {sectorNames.map((name) => (
            <div key={name}>
              <h3 className="mb-3 border-b border-copper/15 pb-2 font-display text-sm font-bold text-cream/80">
                {name}
              </h3>
              <ul className="space-y-1.5">
                {(bySector.get(name) ?? []).map((c) => {
                  const inner = (
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-copper/60">{c.id}</span>
                      <span
                        className={`flex items-center gap-1.5 font-sans text-[12.5px] ${
                          c.visibility === "public" ? "text-cream/80" : "text-cream/45"
                        }`}
                      >
                        {c.title}
                        {c.visibility !== "public" && (
                          <span className="text-copper/50">
                            <LockIcon size={10} />
                          </span>
                        )}
                      </span>
                    </span>
                  );
                  return (
                    <li key={c.id}>
                      {c.visibility === "public" ? (
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

/* ----------------------------------- Tiles ---------------------------------- */

function PublicTile({
  card,
  lang,
  dict,
}: {
  card: Card;
  lang: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  const sev = SEVERITY_STYLE[card.severity];
  const verified = countVerified(card);
  const badge = isAllVerified(card) ? dict.severity.allVerified : dict.severity[card.severity];
  return (
    <Link
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
}

/** Tile bloqueado: título + subtítulo + severidad, en gris, con candado y sin link. */
function TeaserTile({
  card,
  dict,
}: {
  card: Card;
  dict: ReturnType<typeof getDictionary>;
}) {
  const sev = SEVERITY_STYLE[card.severity];
  const badge = isAllVerified(card) ? dict.severity.allVerified : dict.severity[card.severity];
  return (
    <div
      aria-label={dict.catalog.lockedAria}
      className="relative block cursor-default rounded-sm border border-copper/15 bg-navy-deep/50 p-6 opacity-60"
    >
      <div className="absolute right-4 top-4 text-copper/50">
        <LockIcon size={14} />
      </div>
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-copper/70">
        {dict.nav.card} #{card.id} · {card.sector}
      </div>
      <div
        className="mb-4 inline-block rounded-[1px] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em]"
        style={{ color: sev.color, backgroundColor: sev.bg }}
      >
        {badge}
      </div>
      <h2 className="mb-2 font-display text-xl font-bold leading-snug text-cream/80">
        {card.title}
      </h2>
      <p className="mb-5 line-clamp-3 font-sans text-[13px] font-light leading-relaxed text-cream/45">
        {card.subtitle}
      </p>
      <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-copper/60">
        {dict.catalog.comingSoon}
      </div>
    </div>
  );
}
