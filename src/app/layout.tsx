import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://fulcrumcards.vercel.app"),
  title: "FulcrumCards — El Fulcro Invisible",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El middleware fija x-locale para las rutas públicas; admin usa "es" por defecto.
  const lang = headers().get("x-locale") || "es";
  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${plex.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
