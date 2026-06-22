import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Metadata {
  const dict = getDictionary(params.lang);
  return {
    title: {
      default: dict.meta.titleDefault,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <>
      <header className="flex items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <Link
            href={`/${lang}`}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper transition-colors hover:text-cream"
          >
            FulcrumCards
          </Link>
          <nav className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.15em]">
            <Link
              href={`/${lang}/cards`}
              className="text-cream/50 transition-colors hover:text-cream"
            >
              {dict.nav.catalog}
            </Link>
            <Link
              href={`/${lang}/book`}
              className="text-cream/50 transition-colors hover:text-cream"
            >
              {dict.nav.book}
            </Link>
          </nav>
        </div>
        <LanguageSwitcher lang={lang} />
      </header>
      {children}
    </>
  );
}
