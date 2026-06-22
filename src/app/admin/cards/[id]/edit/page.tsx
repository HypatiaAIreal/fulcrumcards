import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetCard, listSectors } from "@/lib/cards";
import CardEditor from "@/components/admin/CardEditor";

export const dynamic = "force-dynamic";

export default async function EditCardPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { version?: string };
}) {
  const v = searchParams.version ? parseInt(searchParams.version, 10) : undefined;
  const [es, en] = await Promise.all([
    adminGetCard(params.id, "es", v),
    adminGetCard(params.id, "en", v),
  ]);
  if (!es && !en) notFound();
  const version = es?.version ?? en?.version ?? 1;

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
      <h1 className="mb-8 font-display text-3xl font-extrabold text-cream">
        Editar #{params.id} · v{version}
      </h1>
      <CardEditor
        mode="edit"
        id={params.id}
        version={version}
        sectors={listSectors()}
        initialEs={es ?? undefined}
        initialEn={en ?? undefined}
      />
    </main>
  );
}
