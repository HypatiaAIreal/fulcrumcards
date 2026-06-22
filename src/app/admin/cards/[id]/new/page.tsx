import Link from "next/link";
import { adminGetCard, listSectors } from "@/lib/cards";
import CardEditor from "@/components/admin/CardEditor";

export const dynamic = "force-dynamic";

export default async function NewVersionPage({
  params,
}: {
  params: { id: string };
}) {
  // Precarga la versión actual (publicada o más reciente) como punto de partida.
  const [es, en] = await Promise.all([
    adminGetCard(params.id, "es"),
    adminGetCard(params.id, "en"),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <nav className="mb-6">
        <Link
          href={`/admin/cards/${params.id}`}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper hover:text-cream"
        >
          ← Versiones de #{params.id}
        </Link>
      </nav>
      <h1 className="mb-2 font-display text-3xl font-extrabold text-cream">
        Nueva versión de #{params.id}
      </h1>
      <p className="mb-8 font-sans text-sm text-cream/50">
        Parte de la versión actual y edítala, o sube/pega un JSON para reemplazarla.
        Al guardar se crea una versión nueva (la anterior se conserva).
      </p>
      <CardEditor
        mode="new"
        id={params.id}
        sectors={listSectors()}
        initialEs={es ?? undefined}
        initialEn={en ?? undefined}
      />
    </main>
  );
}
