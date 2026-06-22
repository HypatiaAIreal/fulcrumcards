import Link from "next/link";
import { listSectors } from "@/lib/cards";
import CardEditor from "@/components/admin/CardEditor";

export const dynamic = "force-dynamic";

export default function NewCardPage() {
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
        Nueva card
      </h1>
      <CardEditor mode="new" sectors={listSectors()} />
    </main>
  );
}
