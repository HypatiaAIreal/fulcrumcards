import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-copper">
        García Bach &amp; Hypatia · 2026
      </div>
      <h1 className="mb-5 font-display text-5xl font-extrabold text-cream md:text-6xl">
        FulcrumCards
      </h1>
      <p className="mb-10 max-w-xl font-sans text-base font-light leading-relaxed text-cream/70 md:text-lg">
        Cards diagnósticas del framework{" "}
        <em className="not-italic text-copper-light">El Fulcro Invisible</em>.
        Diagnostica cualquier profesión a través de cuatro fulcros: material,
        epistémico, relacional y procedencia.
      </p>
      <Link
        href="/cards"
        className="rounded-sm border border-copper/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-copper transition-colors hover:border-copper hover:bg-copper/10"
      >
        Ver catálogo →
      </Link>
    </main>
  );
}
