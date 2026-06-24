import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetCard, type Card } from "@/lib/cards";
import { FULCRUM_KEYS } from "@/lib/fulcrum";
import TeaserGenerator, { type TeaserData } from "@/components/admin/TeaserGenerator";

export const dynamic = "force-dynamic";

function toTeaser(card: Card): TeaserData {
  return {
    id: card.id,
    title: card.title,
    lesson: card.lesson,
    severity: card.severity,
    fulcrumStatuses: FULCRUM_KEYS.map((k) => card.fulcrums[k].status),
  };
}

export default async function TeaserPage({ params }: { params: { id: string } }) {
  const [es, en] = await Promise.all([
    adminGetCard(params.id, "es"),
    adminGetCard(params.id, "en"),
  ]);
  if (!es && !en) notFound();
  // Si falta un idioma, usamos el otro como fallback para no romper el toggle.
  const esData = toTeaser((es || en)!);
  const enData = toTeaser((en || es)!);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <nav className="mb-6">
        <Link
          href={`/admin/cards/${params.id}`}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper hover:text-cream"
        >
          ← Versiones de #{params.id}
        </Link>
      </nav>
      <h1 className="mb-2 font-display text-3xl font-extrabold text-cream">
        Teaser LinkedIn · #{params.id}
      </h1>
      <p className="mb-8 font-sans text-sm text-cream/50">
        Genera la imagen 1200×627 de la card para LinkedIn. Edita el título o la lección si
        quieres, cambia de idioma y descárgala como PNG.
      </p>

      <TeaserGenerator es={esData} en={enData} />
    </main>
  );
}
