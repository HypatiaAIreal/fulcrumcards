import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FulcrumCard from "@/components/FulcrumCard";
import SubscribeForm from "@/components/SubscribeForm";
import LockIcon from "@/components/LockIcon";
import { getAllCards, getCardById } from "@/lib/cards";
import { SEVERITY_STYLE } from "@/lib/fulcrum";
import { getDictionary, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; id: string };
}): Promise<Metadata> {
  const card = await getCardById(params.lang, params.id);
  if (!card) return { title: "404" };
  const dict = getDictionary(params.lang);
  const prefix = card.visibility === "teaser" ? `${dict.teaser.kicker} · ` : "";
  return {
    title: `${prefix}${card.title} · ${dict.nav.card} #${card.id}`,
    description: card.subtitle,
  };
}

export default async function CardPage({
  params,
}: {
  params: { lang: Locale; id: string };
}) {
  const { lang, id } = params;
  const dict = getDictionary(lang);
  const card = await getCardById(lang, id);
  if (!card) notFound(); // hidden o inexistente → 404

  /* ---------------------------- Teaser: próximamente ---------------------------- */
  if (card.visibility === "teaser") {
    const sev = SEVERITY_STYLE[card.severity];
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

          <article className="relative overflow-hidden rounded-sm border border-copper/25 bg-navy-deep p-8 md:p-12">
            {/* Marcas de esquina */}
            <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-copper/30" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-copper/30" />

            <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-copper">
              <LockIcon size={12} />
              {dict.nav.card} #{card.id} · {card.sector}
            </div>

            <div
              className="mb-5 inline-block rounded-[1px] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em]"
              style={{ color: sev.color, backgroundColor: sev.bg }}
            >
              {dict.teaser.kicker}
            </div>

            <h1 className="mb-4 font-display text-3xl font-extrabold leading-tight text-cream md:text-4xl">
              {card.title}
            </h1>
            <p className="mb-8 font-sans text-base font-light leading-relaxed text-cream/70">
              {card.subtitle}
            </p>

            <div className="mb-7 border-t border-copper/15 pt-7">
              <h2 className="mb-2 font-display text-lg font-bold text-cream">
                {dict.teaser.heading}
              </h2>
              <p className="mb-5 font-sans text-sm font-light leading-relaxed text-cream/60">
                {dict.teaser.body}
              </p>
              <SubscribeForm
                cardId={card.id}
                labels={{
                  emailPlaceholder: dict.teaser.emailPlaceholder,
                  cta: dict.teaser.cta,
                  sending: dict.teaser.sending,
                  success: dict.teaser.success,
                  invalid: dict.teaser.invalid,
                  error: dict.teaser.error,
                }}
              />
            </div>
          </article>
        </div>
      </main>
    );
  }

  /* -------------------------------- Public: card -------------------------------- */
  // Relacionadas: solo cards públicas (la de contraste primero, luego mismo sector).
  const MAX_RELATED = 4;
  const publicCards = await getAllCards(lang);
  const publicById = new Map(publicCards.map((c) => [c.id, c]));
  const contrastCard = card.contrast?.card_ref
    ? publicById.get(card.contrast.card_ref) ?? null
    : null;
  const sameSector = publicCards.filter(
    (c) =>
      c.visibility === "public" &&
      c.id !== card.id &&
      c.id !== contrastCard?.id &&
      c.sector === card.sector
  );
  const related = [
    ...(contrastCard && contrastCard.visibility === "public" && contrastCard.id !== card.id
      ? [contrastCard]
      : []),
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
