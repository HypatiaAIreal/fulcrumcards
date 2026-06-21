import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Metadata {
  const dict = getDictionary(params.lang);
  return {
    metadataBase: new URL("https://fulcrumcards.vercel.app"),
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
  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${plex.variable} ${mono.variable}`}
    >
      <body>
        <header className="flex items-center justify-between px-5 py-3 sm:px-8">
          <Link
            href={`/${lang}`}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-copper transition-colors hover:text-cream"
          >
            FulcrumCards
          </Link>
          <LanguageSwitcher lang={lang} />
        </header>
        {children}
      </body>
    </html>
  );
}
