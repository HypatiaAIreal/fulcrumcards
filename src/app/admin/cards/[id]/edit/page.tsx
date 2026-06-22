import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetCard, listSectors } from "@/lib/cards";
import CardEditor from "@/components/admin/CardEditor";

export const dynamic = "force-dynamic";

export default async function EditCardPage({
  params,
}: {
  params: { id: string };
}) {
  const [es, en] = await Promise.all([
    adminGetCard(params.id, "es"),
    adminGetCard(params.id, "en"),
  ]);
  if (!es && !en) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <nav className="mb-6">
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper hover:text-cream"
        >
          ← Admin
        </Link>
      </nav>
      <h1 className="mb-8 font-display text-3xl font-extrabold text-cream">
        Editar card #{params.id}
      </h1>
      <CardEditor
        mode="edit"
        id={params.id}
        sectors={listSectors()}
        initialEs={es ?? undefined}
        initialEn={en ?? undefined}
      />
    </main>
  );
}
