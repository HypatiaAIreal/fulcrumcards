import Link from "next/link";
import { listSectors } from "@/lib/cards";
import CardEditor from "@/components/admin/CardEditor";

export const dynamic = "force-dynamic";

export default function NewVersionPage({ params }: { params: { id: string } }) {
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
        Nueva versión de #{params.id}
      </h1>
      <CardEditor mode="new" id={params.id} sectors={listSectors()} />
    </main>
  );
}
