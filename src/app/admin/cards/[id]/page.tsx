import Link from "next/link";
import { notFound } from "next/navigation";
import { adminListVersions } from "@/lib/cards";
import VersionActions from "@/components/admin/VersionActions";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  published: "var(--verified)",
  draft: "var(--assumed)",
  archived: "var(--absent)",
};

export default async function CardVersionsPage({
  params,
}: {
  params: { id: string };
}) {
  const versions = await adminListVersions(params.id);
  if (versions.length === 0) notFound();
  const title = versions.find((v) => v.status === "published")?.title || versions[0].title;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <nav className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper hover:text-cream">
          ← Admin
        </Link>
        <Link
          href={`/admin/cards/${params.id}/new`}
          className="rounded-sm bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light"
        >
          + Nueva versión
        </Link>
      </nav>

      <h1 className="mb-1 font-display text-3xl font-extrabold text-cream">{title}</h1>
      <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/40">
        Card #{params.id} · {versions.length} {versions.length === 1 ? "versión" : "versiones"}
      </p>

      <div className="space-y-3">
        {versions.map((v) => (
          <div
            key={v.version}
            className="rounded-sm border border-copper/20 p-4"
            style={v.status === "published" ? { borderColor: "rgba(90,158,111,0.4)" } : undefined}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-cream">v{v.version}</span>
                <span
                  className="rounded-[1px] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{ color: statusColor[v.status] || "var(--cream)", backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  {v.status}
                </span>
                <span className="font-mono text-[10px] text-cream/40">
                  {v.langs.map((l) => l.toUpperCase()).join(" · ")}
                </span>
              </div>
              <VersionActions id={params.id} version={v.version} status={v.status} />
            </div>
            <div className="grid gap-x-8 gap-y-1 font-mono text-[10px] text-cream/50 sm:grid-cols-3">
              <span>model: <span className="text-cream/70">{v.model || "—"}</span></span>
              <span>created_by: <span className="text-cream/70">{v.created_by || "—"}</span></span>
              <span>created_at: <span className="text-cream/70">{v.created_at || "—"}</span></span>
            </div>
            {v.notes && <p className="mt-2 font-sans text-[12px] italic text-cream/55">{v.notes}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
