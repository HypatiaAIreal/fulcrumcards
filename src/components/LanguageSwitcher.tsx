"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

/** Conmuta el primer segmento de la ruta entre los idiomas disponibles. */
export default function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname() || `/${lang}`;

  function pathFor(target: Locale): string {
    const parts = pathname.split("/");
    parts[1] = target; // el primer segmento siempre es el locale
    return parts.join("/") || `/${target}`;
  }

  return (
    <nav
      aria-label="Language"
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]"
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-copper/30">·</span>}
          <Link
            href={pathFor(l)}
            aria-current={l === lang ? "true" : undefined}
            className={
              l === lang
                ? "text-copper"
                : "text-cream/40 transition-colors hover:text-cream"
            }
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  );
}
