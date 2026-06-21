import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/i18n";
import { bookEditions, bookCommon, otherLocale } from "@/lib/book";

export function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Metadata {
  const ed = bookEditions[params.lang];
  return { title: ed.title, description: ed.subtitle };
}

export default function BookPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = getDictionary(lang);
  const ed = bookEditions[lang];
  const other = otherLocale(lang);

  const meta: Array<[string, string | number]> = [
    [dict.book.isbn, ed.isbn],
    [dict.book.publisher, bookCommon.publisher],
    [dict.book.pages, bookCommon.pages],
    [dict.book.published, bookCommon.published],
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <div className="mb-10 font-mono text-[11px] uppercase tracking-[0.3em] text-copper">
        {dict.book.kicker}
      </div>

      <div className="grid items-start gap-10 md:grid-cols-[280px_1fr] md:gap-14">
        {/* Cover */}
        <div className="relative mx-auto w-full max-w-[280px]">
          <Image
            src={ed.cover}
            width={ed.coverWidth}
            height={ed.coverHeight}
            alt={`${ed.title} — ${bookCommon.authors}`}
            priority
            className="h-auto w-full rounded-sm border border-copper/25 shadow-2xl shadow-black/40"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-cream md:text-5xl">
            {ed.title}
          </h1>
          <p className="mt-4 font-display text-lg italic text-copper-light md:text-xl">
            {ed.subtitle}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50">
            {dict.book.by} {bookCommon.authors}
          </p>

          <p className="mt-7 max-w-xl font-sans text-base font-light leading-relaxed text-cream/75">
            {ed.blurb}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href={ed.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-copper px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-navy-deep transition-colors hover:bg-copper-light"
            >
              {dict.book.buyOn(ed.store)} · {ed.price}
            </a>
            <Link
              href={`/${other}/book`}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/50 transition-colors hover:text-copper"
            >
              {dict.book.otherEdition}
            </Link>
          </div>

          {/* Metadata */}
          <dl className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-4 border-t border-copper/15 pt-8">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-copper/70">
                  {label}
                </dt>
                <dd className="mt-1 font-sans text-sm text-cream/80">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Ecosystem */}
      <section className="mt-20 border-t border-copper/15 pt-10">
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-copper">
          {dict.book.ecosystem}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {bookCommon.tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] tracking-wide text-cream/70 transition-colors hover:text-copper"
            >
              {tool.name} ↗
            </a>
          ))}
          <a
            href={bookCommon.site}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[12px] tracking-wide text-copper-light transition-colors hover:text-cream"
          >
            {dict.book.visitSite}
          </a>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/35">
          {dict.book.vol2}
        </p>
      </section>
    </main>
  );
}
