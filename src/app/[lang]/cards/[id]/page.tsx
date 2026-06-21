import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FulcrumCard from "@/components/FulcrumCard";
import { getAllCards, getCardById, getCardIds } from "@/lib/cards";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Pre-genera una ruta por cada card (combinada con cada idioma del layout). */
export function generateStaticParams() {
  return getCardIds().map((id) => ({ id }));
}

export function generateMetadata({
  params,
}: {
  params: { lang: Locale; id: string };
}): Metadata {
  const card = getCardById(params.lang, params.id);
  if (!card) return { title: "404" };
  return {
    title: `${card.title} · ${getDictionary(params.lang).nav.card} #${card.id}`,
    description: card.subtitle,
  };
}

export default function CardPage({
  params,
}: {
  params: { lang: Locale; id: string };
}) {
  const { lang, id } = params;
  const dict = getDictionary(lang);
  const card = getCardById(lang, id);
  if (!card) notFound();

  // Relacionadas: la card de contraste primero, luego otras del mismo sector.
  const MAX_RELATED = 4;
  const contrastCard = card.contrast?.card_ref
    ? getCardById(lang, card.contrast.card_ref)
    : undefined;
  const sameSector = getAllCards(lang).filter(
    (c) => c.id !== card.id && c.id !== contrastCard?.id && c.sector === card.sector
  );
  const related = [
    ...(contrastCard && contrastCard.id !== card.id ? [contrastCard] : []),
    ...sameSector,
  ].slice(0, MAX_RELATED);

  return (
    <main className="px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[680px]">
        <nav className="mb-8">
          <Link
            href={`/${lang}/cards`}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper transition-colors hover:text-cream"
          >
            {dict.nav.backToCatalog}
          </Link>
        </nav>

        <FulcrumCard card={card} dict={dict} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-copper">
              {dict.card.relatedCards}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((c) => (
                <Link
                  key={c.id}
                  href={`/${lang}/cards/${c.id}`}
                  className="block rounded-sm border border-copper/20 bg-navy-deep/60 px-4 py-3 transition-colors hover:border-copper/50"
                >
                  <span className="font-mono text-[10px] text-copper/70">
                    #{c.id}
                  </span>
                  <span className="ml-2 font-display text-sm text-cream/85">
                    {c.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
