import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function Home({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = getDictionary(lang);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-copper">
        {dict.brand.authors}
      </div>
      <h1 className="mb-5 font-display text-5xl font-extrabold text-cream md:text-6xl">
        FulcrumCards
      </h1>
      <p className="mb-10 max-w-xl font-sans text-base font-light leading-relaxed text-cream/70 md:text-lg">
        {dict.home.leadPre}
        <em className="not-italic text-copper-light">{dict.brand.book}</em>
        {dict.home.leadPost}
      </p>
      <Link
        href={`/${lang}/cards`}
        className="rounded-sm border border-copper/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-copper transition-colors hover:border-copper hover:bg-copper/10"
      >
        {dict.home.cta}
      </Link>
    </main>
  );
}
